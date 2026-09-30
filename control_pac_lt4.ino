#include <SPI.h>
#include <Ethernet.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// --- KONFIGURASI HARDWARE ---
#define RELAY_PIN 26
#define W5500_CS_PIN 5 // VSPI

// --- KONFIGURASI JARINGAN & MQTT ---
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 10, 120);
IPAddress gateway(192, 168, 10, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress dns(8, 8, 8, 8);

const char* mqtt_server = "192.168.10.10";
const char* mqtt_topic_settings = "ttcsudiang/pac/settings";
const char* mqtt_topic_status = "ttcsudiang/pac/status";
const char* device_code = "PAC4_1";
const char* mqtt_topic_sensor = "ttcsudiang/sensor/battery4";
const char* mqtt_topic_time = "ttcsudiang/time";

// Pesan LWT: dikirim broker otomatis jika perangkat putus tak wajar
const char* LWT_PAYLOAD = "{\"device_code\":\"PAC4_1\",\"online\":false}";

// --- KONFIGURASI PROTEKSI ---
const unsigned long MIN_SWITCH_INTERVAL_MS = 300000UL; // jeda minimum ON/OFF: 5 menit
const unsigned long DATA_TIMEOUT_MS = 30000UL;        // data sensor/waktu basi: 30 detik
const unsigned long RECONNECT_INTERVAL_MS = 5000UL;
const unsigned long EVAL_INTERVAL_MS = 2000UL;
const unsigned long HEARTBEAT_INTERVAL_MS = 30000UL;  // heartbeat status: 30 detik

EthernetClient ethClient;
PubSubClient mqttClient(ethClient);
Preferences prefs;

// --- PARAMETER & STATE ---
bool tempModeActive = false;
float tempMin = 20.0;
float tempMax = 25.0;
float currentRoomTemp = 0.0;
unsigned long lastSensorMs = 0;
bool hasSensor = false;

bool timeModeActive = false;
String timeOn = "08:00";
String timeOff = "17:00";
String currentEspTime = "";
unsigned long lastTimeMs = 0;
bool hasTime = false;

int currentRelayState = 0;
int wantedState = 0;
int prevTempDesired = -1;   // -1 = tidak ada, 0 = OFF, 1 = ON
int prevTimeDesired = -1;
unsigned long lastChangeMs = 0;
bool hasChanged = false;

unsigned long lastEvaluation = 0;
unsigned long lastReconnectAttempt = 0;
unsigned long lastHeartbeat = 0;
bool linkWasUp = true;

// --- SETTINGS: FLASH ---
void loadSettings() {
  prefs.begin("pac", true); // read-only
  tempModeActive = prefs.getBool("tempOn", false);
  tempMin = prefs.getFloat("tempMin", 20.0);
  tempMax = prefs.getFloat("tempMax", 25.0);
  timeModeActive = prefs.getBool("timeOn", false);
  timeOn = prefs.getString("tOn", "08:00");
  timeOff = prefs.getString("tOff", "17:00");
  prefs.end();
  Serial.println("Settings dimuat dari flash.");
}

void saveSettings() {
  prefs.begin("pac", false);
  prefs.putBool("tempOn", tempModeActive);
  prefs.putFloat("tempMin", tempMin);
  prefs.putFloat("tempMax", tempMax);
  prefs.putBool("timeOn", timeModeActive);
  prefs.putString("tOn", timeOn);
  prefs.putString("tOff", timeOff);
  prefs.end();
  Serial.println("Settings disimpan ke flash.");
}

// --- VALIDASI ---
bool validHHMM(const char* s) {
  if (s == nullptr || strlen(s) != 5 || s[2] != ':') return false;
  for (int i : {0, 1, 3, 4}) {
    if (s[i] < '0' || s[i] > '9') return false;
  }
  int hh = (s[0] - '0') * 10 + (s[1] - '0');
  int mm = (s[3] - '0') * 10 + (s[4] - '0');
  return hh < 24 && mm < 60;
}

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); // active HIGH: LOW = OFF

  loadSettings();

  Ethernet.init(W5500_CS_PIN);
  Ethernet.begin(mac, ip, dns, gateway, subnet);
  delay(1500);

  if (Ethernet.hardwareStatus() == EthernetNoHardware) {
    Serial.println("ERROR: W5500 tidak terdeteksi (cek wiring SPI/CS)");
  }
  if (Ethernet.linkStatus() == LinkOFF) {
    Serial.println("WARNING: Kabel Ethernet belum terhubung");
  }

  Serial.print("IP ESP32: ");
  Serial.println(Ethernet.localIP());

  mqttClient.setBufferSize(512);
  mqttClient.setServer(mqtt_server, 1883);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  // Pantau link Ethernet (log hanya saat berubah)
  bool linkUp = (Ethernet.linkStatus() != LinkOFF);
  if (linkUp != linkWasUp) {
    Serial.println(linkUp ? "Ethernet link UP" : "Ethernet link DOWN");
    linkWasUp = linkUp;
  }

  // Reconnect non-blocking, dilewati saat link mati
  if (!mqttClient.connected()) {
    if (linkUp && millis() - lastReconnectAttempt >= RECONNECT_INTERVAL_MS) {
      lastReconnectAttempt = millis();
      reconnectMQTT();
    }
  } else {
    mqttClient.loop();
    if (millis() - lastHeartbeat >= HEARTBEAT_INTERVAL_MS) {
      lastHeartbeat = millis();
      publishStatus();
    }
  }

  if (millis() - lastEvaluation >= EVAL_INTERVAL_MS) {
    lastEvaluation = millis();
    evaluateLogic();
  }
}

// --- UTILITAS ---
int toMinutes(const String& hhmm) {
  return hhmm.substring(0, 2).toInt() * 60 + hhmm.substring(3, 5).toInt();
}

bool isFresh(bool has, unsigned long lastMs) {
  return has && (millis() - lastMs <= DATA_TIMEOUT_MS);
}

// --- LOGIKA EVALUASI ---
// Aturan: mode yang kondisinya tercapai (berubah) duluan menentukan state.
// Event terakhir yang memicu berlaku. Jika bersamaan, ON diprioritaskan.
void evaluateLogic() {
  bool sensorFresh = isFresh(hasSensor, lastSensorMs);
  bool timeFresh = isFresh(hasTime, lastTimeMs);

  Serial.println("\n--- Evaluasi Logika ---");
  Serial.print("Mode Suhu/Waktu : ");
  Serial.print(tempModeActive); Serial.print(" / "); Serial.println(timeModeActive);

  if (!tempModeActive && !timeModeActive) {
    wantedState = 0;
    prevTempDesired = -1;
    prevTimeDesired = -1;
  } else {
    int tempEvent = -1;
    int timeEvent = -1;

    int tempDesired = -1;
    if (tempModeActive) {
      if (sensorFresh) {
        Serial.print("Suhu: "); Serial.print(currentRoomTemp);
        Serial.print(" (batas "); Serial.print(tempMin); Serial.print("-"); Serial.print(tempMax); Serial.println(")");
        if (currentRoomTemp >= tempMax) tempDesired = 1;
        else if (currentRoomTemp <= tempMin) tempDesired = 0;
      } else {
        Serial.println("  -> Data suhu basi/belum ada, diabaikan");
      }
    }
    if (tempDesired != -1 && tempDesired != prevTempDesired) tempEvent = tempDesired;
    prevTempDesired = tempDesired;

    int timeDesired = -1;
    if (timeModeActive) {
      if (timeFresh) {
        Serial.print("Waktu: "); Serial.print(currentEspTime);
        Serial.print(" (batas "); Serial.print(timeOn); Serial.print(" - "); Serial.print(timeOff); Serial.println(")");
        int cur = toMinutes(currentEspTime);
        int on = toMinutes(timeOn);
        int off = toMinutes(timeOff);
        bool inWindow = (on < off) ? (cur >= on && cur < off)
                                   : (cur >= on || cur < off);
        timeDesired = inWindow ? 1 : 0;
      } else {
        Serial.println("  -> Data waktu basi/belum ada, diabaikan");
      }
    }
    if (timeDesired != -1 && timeDesired != prevTimeDesired) timeEvent = timeDesired;
    prevTimeDesired = timeDesired;

    if (tempEvent == 1 || timeEvent == 1) wantedState = 1;
    else if (tempEvent == 0 || timeEvent == 0) wantedState = 0;
  }

  if (wantedState != currentRelayState) {
    bool allowed = !hasChanged || (millis() - lastChangeMs >= MIN_SWITCH_INTERVAL_MS);
    if (allowed) {
      currentRelayState = wantedState;
      digitalWrite(RELAY_PIN, currentRelayState == 1 ? HIGH : LOW);
      lastChangeMs = millis();
      hasChanged = true;
      publishStatus();
      Serial.print(">>> RELAY BERUBAH MENJADI: ");
      Serial.println(currentRelayState == 1 ? "ON" : "OFF");
    } else {
      Serial.print("Menunggu jeda minimum, sisa ");
      Serial.print((MIN_SWITCH_INTERVAL_MS - (millis() - lastChangeMs)) / 1000);
      Serial.println(" detik");
    }
  } else {
    Serial.print("Status Relay: ");
    Serial.println(currentRelayState == 1 ? "ON" : "OFF");
  }
  Serial.println("-----------------------");
}

// --- CALLBACK MQTT ---
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);

  // Topik waktu (plain text "HH:MM")
  if (topicStr == mqtt_topic_time) {
    String t = String((char*)payload, length);
    if (validHHMM(t.c_str())) {
      currentEspTime = t;
      lastTimeMs = millis();
      hasTime = true;
    }
    return;
  }

  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload, length);
  if (error) return;

  if (topicStr == mqtt_topic_settings) {
    // Validasi seluruh pesan; jika ada yang tidak valid, tolak semuanya
    bool ok = doc["tempModeActive"].is<bool>()
           && doc["timeModeActive"].is<bool>()
           && doc["tempMin"].is<float>()
           && doc["tempMax"].is<float>()
           && validHHMM(doc["timeOn"] | (const char*)nullptr)
           && validHHMM(doc["timeOff"] | (const char*)nullptr);
    if (ok) {
      float newMin = doc["tempMin"];
      float newMax = doc["tempMax"];
      ok = newMin < newMax;
    }
    if (!ok) {
      Serial.println("Settings ditolak: field hilang/tidak valid.");
      return;
    }

    bool newTempMode = doc["tempModeActive"];
    float newMin = doc["tempMin"];
    float newMax = doc["tempMax"];
    bool newTimeMode = doc["timeModeActive"];
    String newOn = doc["timeOn"].as<String>();
    String newOff = doc["timeOff"].as<String>();

    // Simpan ke flash hanya jika berubah (hemat siklus tulis flash;
    // retained message dikirim ulang tiap reconnect)
    bool changed = (newTempMode != tempModeActive) || (newMin != tempMin) || (newMax != tempMax)
                || (newTimeMode != timeModeActive) || (newOn != timeOn) || (newOff != timeOff);

    tempModeActive = newTempMode;
    tempMin = newMin;
    tempMax = newMax;
    timeModeActive = newTimeMode;
    timeOn = newOn;
    timeOff = newOff;

    if (changed) {
      saveSettings();
      // Reset tracking agar kondisi dievaluasi ulang sebagai event baru
      prevTempDesired = -1;
      prevTimeDesired = -1;
      Serial.println("Parameter sinkronisasi MQTT diperbarui.");
    }
  }
  else if (topicStr == mqtt_topic_sensor) {
    if (!doc["t_avg"].is<float>()) return;
    currentRoomTemp = doc["t_avg"].as<float>();
    lastSensorMs = millis();
    hasSensor = true;
  }
}

// --- UTILITAS MQTT ---
void publishStatus() {
  if (!mqttClient.connected()) return;
  StaticJsonDocument<200> doc;
  doc["device_code"] = device_code;
  doc["state"] = currentRelayState;
  doc["online"] = true;

  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);
  mqttClient.publish(mqtt_topic_status, jsonBuffer); // tidak retained: topik status dipakai bersama semua PAC
}

// Satu kali percobaan per panggilan (dipanggil tiap 5 detik dari loop)
void reconnectMQTT() {
  if (mqttClient.connect(device_code, nullptr, nullptr,
                         mqtt_topic_status, 1, false, LWT_PAYLOAD)) {
    mqttClient.subscribe(mqtt_topic_settings);
    mqttClient.subscribe(mqtt_topic_sensor);
    mqttClient.subscribe(mqtt_topic_time);
    publishStatus();
    lastHeartbeat = millis();
  }
}
