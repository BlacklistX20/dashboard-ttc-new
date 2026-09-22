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

// Menerima update status ON/OFF PAC langsung dari hardware via MQTT
client.on('message', async (topic, message) => {
  if (topic === 'ttcsudiang/pac/status') {
    try {
      // Contoh Payload: {"device_code": "PAC2_1", "state": 1}
      const data = JSON.parse(message.toString());
      await DeviceState.update(
        { state: data.state }, 
        { where: { device_code: data.device_code } }
      );
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
          { name: 'PAC 1', isOn: pMap['PAC2_1'] || false }, 
          { name: 'PAC 2', isOn: pMap['PAC2_2'] || false }
        ]
      },
      {
        name: 'Ruang Baterai Lantai 3',
        sensors: [
          { temp: bat3 && bat3.t1 !== null ? parseFloat(bat3.t1) : null }, 
          { temp: bat3 && bat3.t2 !== null ? parseFloat(bat3.t2) : null }
        ],
        pacs: [
          { name: 'PAC 1', isOn: pMap['PAC3_1'] || false }, 
          { name: 'PAC 2', isOn: pMap['PAC3_2'] || false }
        ]
      },
      {
        name: 'Ruang Baterai Lantai 4',
        sensors: [
          { temp: bat4 && bat4.t1 !== null ? parseFloat(bat4.t1) : null }, 
          { temp: bat4 && bat4.t2 !== null ? parseFloat(bat4.t2) : null }
        ],
        pacs: [
          { name: 'PAC 1', isOn: pMap['PAC4_1'] || false }
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
exports.saveParameters = async (req, res) => {
  try {
    const data = req.body;
    
    // 1. Simpan ke database (tetap disimpan meski MQTT sedang terputus,
    // supaya parameter tidak hilang dan otomatis ikut kekirim saat broker reconnect)
    await PacSetting.update({
      temp_mode: data.tempModeActive ? 1 : 0,
      temp_min: data.tempMin,
      temp_max: data.tempMax,
      time_mode: data.timeModeActive ? 1 : 0,
      time_on: data.timeOn,
      time_off: data.timeOff
    }, { where: { id: 1 } });

    // 2. Cek status koneksi MQTT SEBELUM klaim sukses ke user
    const isMqttConnected = client.connected;

    // Publish tetap dipanggil - kalau broker sedang terputus, mqtt.js akan
    // meng-antre pesan ini dan mengirimnya otomatis begitu tersambung lagi.
    const payload = JSON.stringify(data);
    client.publish('ttcsudiang/pac/settings', payload, { qos: 1 });

    // 3. Catat di Log - status log mengikuti kondisi koneksi yang sebenarnya
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