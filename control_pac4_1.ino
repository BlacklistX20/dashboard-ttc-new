#include <SPI.h>
#include <Ethernet.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

// --- KONFIGURASI HARDWARE ---
#define RELAY_PIN 26
#define W5500_CS_PIN 5 // VSPI

// --- KONFIGURASI JARINGAN & MQTT ---
byte mac[] = { 0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED };
IPAddress ip(192, 168, 10, 120);
IPAddress gateway(192, 168, 10, 1);
IPAddress subnet(255, 255, 255, 0);
IPAddress dns(8, 8, 8, 8); // DNS tetap diisi walau intranet

const char* mqtt_server = "192.168.10.10";
const char* mqtt_topic_settings = "ttcsudiang/pac/settings";
const char* mqtt_topic_status = "ttcsudiang/pac/status";
const char* device_code = "PAC4_1";

// Topik tambahan untuk komunikasi Intranet
const char* mqtt_topic_sensor = "ttcsudiang/sensor/battery4"; 
const char* mqtt_topic_time = "ttcsudiang/time"; 

EthernetClient ethClient;
PubSubClient mqttClient(ethClient);

// --- VARIABEL PARAMETER & STATE ---
bool tempModeActive = false;
float tempMin = 20.0;
float tempMax = 25.0;
float currentRoomTemp = -999.0; 

bool timeModeActive = false;
String timeOn = "08:00";
String timeOff = "17:00";
String currentEspTime = "00:00"; // Diperbarui via MQTT

int currentRelayState = 0; // 0 = OFF, 1 = ON
unsigned long lastEvaluation = 0;

void setup() {
  Serial.begin(115200);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW); 

  Ethernet.init(W5500_CS_PIN);
  Ethernet.begin(mac, ip, dns, gateway, subnet);
  
  delay(1500);
  Serial.print("IP ESP32: ");
  Serial.println(Ethernet.localIP());

  mqttClient.setServer(mqtt_server, 1883);
  mqttClient.setCallback(mqttCallback);
}

void loop() {
  if (!mqttClient.connected()) {
    reconnectMQTT();
  }
  mqttClient.loop();

  // Evaluasi kondisi setiap 2 detik
  if (millis() - lastEvaluation > 2000) {
    evaluateLogic();
    lastEvaluation = millis();
  }
}

// --- LOGIKA EVALUASI MANDIRI ---
void evaluateLogic() {
  bool targetState = currentRelayState; 
  bool conditionON = false;
  bool conditionOFF = false;

  Serial.println("\n--- Evaluasi Logika ---");
  Serial.print("Mode Suhu Aktif : "); Serial.println(tempModeActive);
  Serial.print("Mode Waktu Aktif: "); Serial.println(timeModeActive);

  // 1. Evaluasi Suhu
  if (tempModeActive) {
    Serial.print("Suhu Realtime   : "); Serial.println(currentRoomTemp);
    Serial.print("Batas Suhu      : "); Serial.print(tempMin); Serial.print(" - "); Serial.println(tempMax);
    
    if (currentRoomTemp != -999.0) {
      if (currentRoomTemp >= tempMax) conditionON = true;
      else if (currentRoomTemp <= tempMin) conditionOFF = true;
    } else {
      Serial.println("  -> WARNING: Suhu belum diterima dari MQTT");
    }
  }

  // 2. Evaluasi Waktu
  if (timeModeActive) {
    Serial.print("Waktu Server    : "); Serial.println(currentEspTime);
    Serial.print("Batas Waktu     : "); Serial.print(timeOn); Serial.print(" - "); Serial.println(timeOff);

    // Hindari eksekusi jika waktu belum tersinkron
    if (currentEspTime != "00:00") {
      int currentMinutes = (currentEspTime.substring(0, 2).toInt() * 60) + currentEspTime.substring(3, 5).toInt();
      int onMinutes = (timeOn.substring(0, 2).toInt() * 60) + timeOn.substring(3, 5).toInt();
      int offMinutes = (timeOff.substring(0, 2).toInt() * 60) + timeOff.substring(3, 5).toInt();

      if (onMinutes < offMinutes) {
        if (currentMinutes >= onMinutes && currentMinutes < offMinutes) conditionON = true;
        else conditionOFF = true;
      } else {
        if (currentMinutes >= onMinutes || currentMinutes < offMinutes) conditionON = true;
        else conditionOFF = true;
      }
    } else {
      Serial.println("  -> WARNING: Waktu server belum diterima dari MQTT");
    }
  }

  // 3. Eksekusi Akhir (Prioritaskan ON)
  if (conditionON) {
    targetState = 1;
  } else if (conditionOFF && !conditionON) { 
    targetState = 0;
  }

  // Publish dan nyalakan relay jika status berubah
  if (targetState != currentRelayState) {
    currentRelayState = targetState;
    digitalWrite(RELAY_PIN, currentRelayState == 1 ? HIGH : LOW);
    publishStatus();
    Serial.print(">>> RELAY BERUBAH MENJADI: "); 
    Serial.println(currentRelayState == 1 ? "ON" : "OFF");
  } else {
    Serial.print("Status Akhir Relay: "); 
    Serial.println(currentRelayState == 1 ? "ON (Tidak Berubah)" : "OFF (Tidak Berubah)");
  }
  Serial.println("-----------------------");
}

// --- CALLBACK MQTT ---
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  String topicStr = String(topic);

  // 1. Tangani Topik Waktu (Bentuk Teks Biasa / Plain Text)
  if (topicStr == mqtt_topic_time) {
    currentEspTime = String((char*)payload, length);
    return; // Langsung keluar karena bukan JSON
  }

  // 2. Tangani Topik JSON (Settings & Sensor)
  StaticJsonDocument<512> doc;
  DeserializationError error = deserializeJson(doc, payload);
  if (error) return;

  if (topicStr == mqtt_topic_settings) {
    tempModeActive = doc["tempModeActive"];
    tempMin = doc["tempMin"];
    tempMax = doc["tempMax"];
    timeModeActive = doc["timeModeActive"];
    timeOn = doc["timeOn"].as<String>();
    timeOff = doc["timeOff"].as<String>();
    Serial.println("Parameter sinkronisasi MQTT diperbarui.");
  } 
  else if (topicStr == mqtt_topic_sensor) {
    currentRoomTemp = doc["t_avg"].as<float>();
  }
}

// --- UTILITAS MQTT ---
void publishStatus() {
  StaticJsonDocument<200> doc;
  doc["device_code"] = device_code;
  doc["state"] = currentRelayState;

  char jsonBuffer[200];
  serializeJson(doc, jsonBuffer);
  mqttClient.publish(mqtt_topic_status, jsonBuffer);
}

void reconnectMQTT() {
  while (!mqttClient.connected()) {
    if (mqttClient.connect(device_code)) {
      // Langganan ke semua topik yang diperlukan
      mqttClient.subscribe(mqtt_topic_settings);
      mqttClient.subscribe(mqtt_topic_sensor);
      mqttClient.subscribe(mqtt_topic_time); 
    } else {
      delay(5000);
    }
  }
}