// Tambahkan fungsi ini di berkas yang mengatur MQTT di backend Anda
// (Misal: PacController.js atau MqttService.js)

const mqtt = require('mqtt');
// Import model tabel spesifik ruangan baterai
const { Battery2, Battery3, Battery4 } = require('./src/models/TempModel'); 

// Ganti dengan IP Broker MQTT Anda
const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://192.168.10.10:1883';
const client = mqtt.connect(MQTT_BROKER);

// Fungsi untuk mengambil suhu terbaru dan mem-publish ke MQTT
const publishRealtimeBatteryTemps = async () => {
  try {
    if (!client.connected) {
      console.log('MQTT belum terhubung, publish dibatalkan.');
      return;
    }

    // Ambil baris terbaru dari masing-masing tabel Baterai
    const [bat2, bat3, bat4] = await Promise.all([
      Battery2.findOne({ order: [['updated_at', 'DESC']] }),
      Battery3.findOne({ order: [['updated_at', 'DESC']] }),
      Battery4.findOne({ order: [['updated_at', 'DESC']] })
    ]);

    // Format payload JSON untuk masing-masing ruangan
    const createPayload = (batData) => {
      if (!batData) return null;
      // Menggunakan t_avg (rata-rata suhu) sebagai acuan utama
      return JSON.stringify({
        t_avg: batData.t_avg !== null ? parseFloat(batData.t_avg) : null,
        t1: batData.t1 !== null ? parseFloat(batData.t1) : null,
        t2: batData.t2 !== null ? parseFloat(batData.t2) : null
      });
    };

    const payloadBat2 = createPayload(bat2);
    const payloadBat3 = createPayload(bat3);
    const payloadBat4 = createPayload(bat4); // Ini yang akan dipakai oleh PAC4_1

    // Publish ke topik MQTT yang spesifik per ruangan
    if (payloadBat2) client.publish('ttcsudiang/sensor/battery2', payloadBat2, { retain: true });
    if (payloadBat3) client.publish('ttcsudiang/sensor/battery3', payloadBat3, { retain: true });
    if (payloadBat4) client.publish('ttcsudiang/sensor/battery4', payloadBat4, { retain: true });

    console.log('Data suhu baterai berhasil di-publish ke MQTT');
  } catch (error) {
    console.error('Gagal publish suhu baterai ke MQTT:', error);
  }
};

// --- FUNGSI BARU: PUBLISH WAKTU SERVER LOKAL ---
const publishServerTime = () => {
  if (client.connected) {
    const now = new Date();
    // Format menjadi HH:MM berdasarkan waktu lokal server
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    // Publish sebagai plain text dengan retain = true agar ESP32 langsung mendapatkan waktu saat terhubung
    client.publish('ttcsudiang/time', currentTime, { retain: true });
    // console.log(`Waktu tersinkronisasi ke MQTT: ${currentTime}`);
  }
};

// PANGGIL FUNGSI SECARA BERKALA
// Publish suhu baterai dan sinkronisasi waktu setiap 30 detik
setInterval(() => {
  publishRealtimeBatteryTemps();
  publishServerTime();
}, 30000);