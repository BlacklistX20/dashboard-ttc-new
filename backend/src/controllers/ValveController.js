const axios = require('axios');
const { DeviceState, ControlLog } = require('../models/ControlModel'); // Memanggil ControlModel.js sesuai permintaan

// Konfigurasi IP Arduino - via environment variable supaya bisa beda per environment
// (dev/staging/prod, atau saat pindah ke Docker) tanpa perlu rebuild kode.
const ARDUINO_IP = process.env.ARDUINO_IP || 'http://192.168.10.177';

// ========================================================================
// FUNGSI KOMUNIKASI DEVICE (FUTURE-PROOF UNTUK MQTT)
// ========================================================================
const sendToDevice = async (valveIndex, state) => {
  try {
    // --- SOLUSI SEMENTARA (HTTP GET) ---
    // Mengirim request misal: http://192.168.10.177/set?v=1&s=1
    const response = await axios.get(`${ARDUINO_IP}/set`, {
      params: { v: valveIndex, s: state },
      timeout: 4000 // Timeout 4 detik agar frontend tidak hang jika Arduino mati
    });
    return { success: true, data: response.data };

    // --- PERSIAPAN MQTT MASA DEPAN ---
    // Jika sudah pakai MQTT, hapus axios di atas dan uncomment kode di bawah:
    // mqttClient.publish(`rooftop/valve/${valveIndex}/set`, state.toString());
    // return { success: true };

  } catch (error) {
    console.error(`Gagal mengirim perintah ke Valve ${valveIndex}:`, error.message);
    return { success: false, error: error.message };
  }
};


// ========================================================================
// 1. GET ALL STATES (Digunakan frontend untuk update UI Realtime)
// ========================================================================
exports.getStates = async (req, res) => {
  try {
    const states = await DeviceState.findAll();
    
    // Format menjadi object agar mudah dibaca frontend { ARD1: 1, VLV1: 0, ... }
    const formattedStates = {};
    states.forEach(item => {
      formattedStates[item.device_code] = item.state;
    });

    res.status(200).json({ success: true, data: formattedStates });
  } catch (error) {
    console.error('Error getStates:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil status device' });
  }
};


// ========================================================================
// 2. TOGGLE ARDUINO CONNECTION (Simulasi/Manual Override Server)
// ========================================================================
exports.toggleArduino = async (req, res) => {
  try {
    const { state } = req.body; // state: 1 (Connected) atau 0 (Disconnected)

    if (state !== 0 && state !== 1) {
      return res.status(400).json({ success: false, message: 'Nilai state harus 0 atau 1' });
    }

    await DeviceState.update({ state }, { where: { device_code: 'ARD1' } });

    // Jika diputus (0), matikan semua valve dan pompa di database demi keamanan
    if (state === 0) {
      await DeviceState.update({ state: 0 }, { 
        where: { device_code: ['PMP1', 'VLV1', 'VLV2', 'VLV3'] } 
      });
    }

    await ControlLog.create({
      device_code: 'ARD1',
      action: state === 1 ? 'CONNECT' : 'DISCONNECT',
      status: 'SUCCESS',
      message: `Status Arduino diubah menjadi ${state === 1 ? 'Online' : 'Offline'} via Dashboard`
    });

    res.status(200).json({ success: true, message: 'Status koneksi diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal merubah status koneksi' });
  }
};


// ========================================================================
// 3. TOGGLE VALVE & AUTO-PUMP
// ========================================================================
exports.toggleValve = async (req, res) => {
  try {
    const { deviceCode, targetState } = req.body; // Contoh: deviceCode="VLV1", targetState=1

    // Pastikan device_code valid
    const validValves = { 'VLV1': 1, 'VLV2': 2, 'VLV3': 3 };
    const valveIndex = validValves[deviceCode];

    if (!valveIndex) {
      return res.status(400).json({ success: false, message: 'Kode Valve tidak valid' });
    }

    // 1. Eksekusi Perintah ke Arduino via fungsi Wrapper
    const hwResponse = await sendToDevice(valveIndex, targetState);

    if (!hwResponse.success) {
      // Request ke hardware benar-benar gagal (timeout/unreachable) - tandai Arduino
      // terputus secara OTOMATIS di database, supaya badge status tidak terus
      // menunjukkan CONNECTED padahal alat sudah tidak merespons. Matikan juga
      // semua valve & pompa demi keamanan (pola yang sama dengan toggleArduino manual).
      await DeviceState.update({ state: 0 }, { where: { device_code: 'ARD1' } });
      await DeviceState.update({ state: 0 }, { where: { device_code: ['PMP1', 'VLV1', 'VLV2', 'VLV3'] } });

      // Catat kegagalan ke histori log
      await ControlLog.create({
        device_code: deviceCode,
        action: targetState === 1 ? 'TURN_ON' : 'TURN_OFF',
        status: 'FAILED',
        message: `HTTP Request Timeout/Error: ${hwResponse.error}`
      });
      return res.status(503).json({ success: false, message: 'Arduino tidak merespons. Pastikan alat menyala.' });
    }

    // 2. Jika sukses, update state valve di database.
    // Dibungkus 1 transaction supaya "matikan valve lain -> set valve tujuan -> hitung &
    // set pompa" jadi atomic - mencegah state tidak konsisten kalau ada 2 request nyaris
    // bersamaan (mis. dari 2 tab/klien berbeda).
    const t = await DeviceState.sequelize.transaction();
    let pumpState;
    try {
      // Karena rule frontend: "Hanya 1 valve terbuka", matikan valve lain jika state=1
      if (targetState === 1) {
        await DeviceState.update(
          { state: 0 },
          { where: { device_code: ['VLV1', 'VLV2', 'VLV3'] }, transaction: t }
        );
      }

      // Update valve yang dituju
      await DeviceState.update(
        { state: targetState },
        { where: { device_code: deviceCode }, transaction: t }
      );

      // 3. Logika Pompa Otomatis (Cek apakah ada setidaknya 1 valve yang masih menyala)
      const activeValves = await DeviceState.count({
        where: { device_code: ['VLV1', 'VLV2', 'VLV3'], state: 1 },
        transaction: t
      });

      pumpState = activeValves > 0 ? 1 : 0;
      await DeviceState.update(
        { state: pumpState },
        { where: { device_code: 'PMP1' }, transaction: t }
      );

      await t.commit();
    } catch (dbError) {
      await t.rollback();
      throw dbError;
    }

    // 4. Catat Keberhasilan di Log
    await ControlLog.create({
      device_code: deviceCode,
      action: targetState === 1 ? 'TURN_ON' : 'TURN_OFF',
      status: 'SUCCESS',
      message: `Valve ${valveIndex} berhasil di-${targetState === 1 ? 'buka' : 'tutup'}. Status Pompa: ${pumpState === 1 ? 'ON' : 'OFF'}`
    });

    res.status(200).json({ success: true, message: 'Perintah berhasil dieksekusi' });

  } catch (error) {
    console.error('Error toggleValve:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server backend' });
  }
};