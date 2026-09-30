const mqtt = require('mqtt');
const { DeviceState, PacSetting, ControlLog } = require('../models/ControlModel');
// Import model tabel spesifik ruangan baterai dari database Temp
const { Battery2, Battery3, Battery4 } = require('../models/TempModel'); 

// --- KONFIGURASI MQTT BROKER ---
// Ganti dengan IP Broker MQTT Anda
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://192.168.10.10:1883';
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
  console.log('✅ Terhubung ke MQTT Broker (PAC System)');
  // Subscribe ke topik status PAC dari hardware
  client.subscribe('ttcsudiang/pac/status'); 
});

// PENTING: 'error' WAJIB ditangani. Tanpa listener ini, event error dari
// MQTT client (mis. broker unreachable, auth gagal) akan jadi unhandled
// exception dan bisa mematikan seluruh proses Node.js.
client.on('error', (err) => {
  console.error('❌ MQTT Client Error:', err.message);
});

client.on('close', () => {
  console.warn('⚠️  Koneksi MQTT Broker terputus (close)');
});

client.on('offline', () => {
  console.warn('⚠️  MQTT Client offline (broker tidak terjangkau)');
});

client.on('reconnect', () => {
  console.log('🔄 Mencoba menyambung ulang ke MQTT Broker...');
});

// ========================================================================
// PRESENCE PERANGKAT PAC
// Firmware baru mengirim {"device_code","state","online":true} saat connect
// dan tiap 30 detik (heartbeat). Saat perangkat putus tak wajar, broker
// mengirim LWT: {"device_code","online":false} (tanpa field state).
// Perangkat lama (tanpa field "online") tidak masuk pelacakan ini -> online: null
// 1 ESP32 = 1 relay = 2 PAC (lantai 2 & 3): PAC kedua ikut presence PAC pertama.
// ========================================================================
const PRESENCE_TIMEOUT_MS = parseInt(process.env.PAC_PRESENCE_TIMEOUT_MS || '90000', 10); // 3x heartbeat
const presence = {};        // { PAC4_1: { online: true, lastSeen: 1700000000000 } }
const PRESENCE_SOURCE = { PAC2_2: 'PAC2_1', PAC3_2: 'PAC3_1' }; // PAC kedua -> ESP32 pembawa heartbeat
const lastKnownState = {};  // cache state terakhir agar heartbeat tidak menulis DB berulang

// true / false = status diketahui, null = perangkat belum/tidak mendukung presence
const getOnlineStatus = (deviceCode) => {
  const p = presence[PRESENCE_SOURCE[deviceCode] || deviceCode];
  if (!p) return null;
  return p.online && (Date.now() - p.lastSeen <= PRESENCE_TIMEOUT_MS);
};

// Catatan: publish suhu (sensor/battery2|3|4) dan jam server kini ditangani MqttService.js

// Menerima status PAC dari hardware via MQTT (status, heartbeat, dan LWT)
client.on('message', async (topic, message) => {
  if (topic === 'ttcsudiang/pac/status') {
    try {
      // Contoh Payload : {"device_code": "PAC4_1", "state": 1, "online": true}
      // Payload LWT    : {"device_code": "PAC4_1", "online": false}
      const data = JSON.parse(message.toString());
      if (!data.device_code) return;

      // Catat presence hanya untuk firmware yang mengirim field "online"
      if (typeof data.online === 'boolean') {
        const wasOnline = presence[data.device_code] ? presence[data.device_code].online : null;
        presence[data.device_code] = { online: data.online, lastSeen: Date.now() };
        if (wasOnline !== data.online) {
          console.log(`ℹ️  ${data.device_code} ${data.online ? 'ONLINE' : 'OFFLINE (LWT)'}`);
        }
      }

      // LWT tidak membawa state -> jangan sentuh state di database
      if (data.online === false) return;

      // Update state hanya jika valid (0/1) dan berubah
      if ((data.state === 0 || data.state === 1) && lastKnownState[data.device_code] !== data.state) {
        await DeviceState.update(
          { state: data.state },
          { where: { device_code: data.device_code } }
        );
        lastKnownState[data.device_code] = data.state;
      }
    } catch (error) {
      console.error('MQTT Parsing Error:', error);
    }
  }
});

// --- API: MENGAMBIL DATA (GET) ---
exports.getPacData = async (req, res) => {
  try {
    // 1. Ambil Parameter
    const [settings] = await PacSetting.findOrCreate({ where: { id: 1 } });
    
    // 2. Ambil Status PAC dari database control
    const pacStates = await DeviceState.findAll({
      where: { device_code: ['PAC2_1', 'PAC2_2', 'PAC3_1', 'PAC3_2', 'PAC4_1'] }
    });
    const pMap = {};
    pacStates.forEach(p => { pMap[p.device_code] = p.state === 1; });

    // 3. Ambil Suhu Realtime (Baris terbaru dari tabel Battery2, Battery3, Battery4)
    const [bat2, bat3, bat4] = await Promise.all([
      Battery2.findOne({ order: [['updated_at', 'DESC']] }),
      Battery3.findOne({ order: [['updated_at', 'DESC']] }),
      Battery4.findOne({ order: [['updated_at', 'DESC']] })
    ]);

    // 4. Format Data untuk Vue
    const rooms = [
      {
        name: 'Ruang Baterai Lantai 2',
        sensors: [
          { temp: bat2 && bat2.t1 !== null ? parseFloat(bat2.t1) : null }, 
          { temp: bat2 && bat2.t2 !== null ? parseFloat(bat2.t2) : null }
        ],
        pacs: [
          { name: 'PAC 1', isOn: pMap['PAC2_1'] || false, online: getOnlineStatus('PAC2_1') }, 
          { name: 'PAC 2', isOn: pMap['PAC2_2'] || false, online: getOnlineStatus('PAC2_2') }
        ]
      },
      {
        name: 'Ruang Baterai Lantai 3',
        sensors: [
          { temp: bat3 && bat3.t1 !== null ? parseFloat(bat3.t1) : null }, 
          { temp: bat3 && bat3.t2 !== null ? parseFloat(bat3.t2) : null }
        ],
        pacs: [
          { name: 'PAC 1', isOn: pMap['PAC3_1'] || false, online: getOnlineStatus('PAC3_1') }, 
          { name: 'PAC 2', isOn: pMap['PAC3_2'] || false, online: getOnlineStatus('PAC3_2') }
        ]
      },
      {
        name: 'Ruang Baterai Lantai 4',
        sensors: [
          { temp: bat4 && bat4.t1 !== null ? parseFloat(bat4.t1) : null }, 
          { temp: bat4 && bat4.t2 !== null ? parseFloat(bat4.t2) : null }
        ],
        pacs: [
          { name: 'PAC 1', isOn: pMap['PAC4_1'] || false, online: getOnlineStatus('PAC4_1') }
        ]
      }
    ];

    res.status(200).json({ success: true, mqttConnected: client.connected, settings, rooms });
  } catch (error) {
    console.error('Error getPacData:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data PAC' });
  }
};

// --- API: MENYIMPAN PARAMETER (POST) ---
// Firmware menolak SELURUH pesan settings jika ada field yang bertipe salah,
// jadi payload dinormalisasi dan divalidasi di sini sebelum disimpan/dipublish.
const isValidHHMM = (v) => typeof v === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(v);
const toHHMM = (v) => (typeof v === 'string' ? v.trim().slice(0, 5) : v); // "08:00:00" -> "08:00"
const toNumber = (v) => (v === '' || v === null || v === undefined ? NaN : Number(v));
const toBool = (v) => v === true || v === 1 || v === '1' || v === 'true';

exports.saveParameters = async (req, res) => {
  try {
    const raw = req.body || {};

    // 1. Normalisasi tipe data
    const data = {
      tempModeActive: toBool(raw.tempModeActive),
      tempMin: toNumber(raw.tempMin),
      tempMax: toNumber(raw.tempMax),
      timeModeActive: toBool(raw.timeModeActive),
      timeOn: toHHMM(raw.timeOn),
      timeOff: toHHMM(raw.timeOff)
    };

    // 2. Validasi (diterapkan walau mode nonaktif, karena firmware memvalidasi semua field)
    let errorMessage = null;
    if (!Number.isFinite(data.tempMin) || !Number.isFinite(data.tempMax)) {
      errorMessage = 'Batas suhu harus berupa angka';
    } else if (data.tempMin >= data.tempMax) {
      errorMessage = 'Batas bawah suhu harus lebih kecil dari batas atas';
    } else if (!isValidHHMM(data.timeOn) || !isValidHHMM(data.timeOff)) {
      errorMessage = 'Format jam tidak valid (HH:MM)';
    }
    if (errorMessage) {
      return res.status(400).json({ success: false, message: errorMessage });
    }

    // 3. Simpan ke database (tetap disimpan meski MQTT sedang terputus,
    // supaya parameter tidak hilang dan otomatis ikut kekirim saat broker reconnect)
    await PacSetting.update({
      temp_mode: data.tempModeActive ? 1 : 0,
      temp_min: data.tempMin,
      temp_max: data.tempMax,
      time_mode: data.timeModeActive ? 1 : 0,
      time_on: data.timeOn,
      time_off: data.timeOff
    }, { where: { id: 1 } });

    // 4. Cek status koneksi MQTT SEBELUM klaim sukses ke user
    const isMqttConnected = client.connected;

    // Publish tetap dipanggil - kalau broker sedang terputus, mqtt.js akan
    // meng-antre pesan ini dan mengirimnya otomatis begitu tersambung lagi.
    // Retained: ESP32 langsung menerima settings terakhir setiap kali reconnect.
    client.publish('ttcsudiang/pac/settings', JSON.stringify(data), { qos: 1, retain: true });

    // 5. Catat di Log - status log mengikuti kondisi koneksi yang sebenarnya
    await ControlLog.create({
      device_code: 'SYS_PAC',
      action: 'UPDATE_PARAMS',
      status: isMqttConnected ? 'SUCCESS' : 'WARNING',
      message: isMqttConnected
        ? `Parameter diubah: Temp(${data.tempMin}-${data.tempMax}), Time(${data.timeOn}-${data.timeOff})`
        : `Parameter disimpan ke database, tapi MQTT Broker sedang TERPUTUS saat publish - pesan di-queue, belum pasti sampai ke perangkat: Temp(${data.tempMin}-${data.tempMax}), Time(${data.timeOn}-${data.timeOff})`
    });

    if (isMqttConnected) {
      res.status(200).json({ success: true, mqttConnected: true, message: 'Parameter berhasil disinkronkan ke MQTT' });
    } else {
      // success: true karena data tetap tersimpan di database, tapi mqttConnected: false
      // memberi tahu frontend bahwa publish ke perangkat BELUM tentu terkirim
      res.status(200).json({ success: true, mqttConnected: false, message: 'Parameter tersimpan, tapi MQTT Broker sedang terputus - belum tentu tersinkron ke perangkat' });
    }
  } catch (error) {
    console.error('Error saveParameters:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan parameter' });
  }
};