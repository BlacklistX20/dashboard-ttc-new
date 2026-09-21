const { PerSecond, VendorHistory, ControlHistory, Battery2History, Battery3History, Battery4History, Alert } = require('../models/GasModel');
const { Op, QueryTypes } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');

const ModelMap = {
  vendor: VendorHistory, control: ControlHistory,
  battery2: Battery2History, battery3: Battery3History, battery4: Battery4History
};

// Cache stats min/max harian per ruangan. Nilai ini jarang berubah (cuma naik/turun
// kalau ada pembacaan baru yang lebih ekstrem), jadi tidak perlu dihitung ulang dari
// nol tiap polling 5 detik - cukup disegarkan tiap STATS_CACHE_TTL_MS.
const STATS_CACHE_TTL_MS = 60 * 1000; // 60 detik
const statsCache = new Map(); // key: `${gasType}_${roomName}` -> { data, expiresAt }

const getDailyStats = async (roomName, HistoryModel, gasType) => {
  const cacheKey = `${gasType}_${roomName}`;
  const cached = statsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await HistoryModel.findAll({
    where: { updated_at: { [Op.gte]: today } },
    attributes: [
      [HistoryModel.sequelize.fn('MIN', HistoryModel.sequelize.col('temp1')), 'minTemp'],
      [HistoryModel.sequelize.fn('MAX', HistoryModel.sequelize.col('temp1')), 'maxTemp'],
      [HistoryModel.sequelize.fn('MIN', HistoryModel.sequelize.col('hum1')), 'minHum'],
      [HistoryModel.sequelize.fn('MAX', HistoryModel.sequelize.col('hum1')), 'maxHum'],
      [HistoryModel.sequelize.fn('MIN', HistoryModel.sequelize.col('sensor1')), 'minGas'],
      [HistoryModel.sequelize.fn('MAX', HistoryModel.sequelize.col('sensor1')), 'maxGas'],
    ],
    raw: true
  });

  const data = stats[0] || {};
  statsCache.set(cacheKey, { data, expiresAt: Date.now() + STATS_CACHE_TTL_MS });
  return data;
};

const formatRoomData = async (roomName, HistoryModel, gasType) => {
  // Realtime (butuh selalu fresh tiap poll) & stats harian (di-cache) diambil paralel
  const [realtime, st] = await Promise.all([
    PerSecond.findOne({ where: { gas: gasType, room: roomName } }),
    getDailyStats(roomName, HistoryModel, gasType)
  ]);

  // Jika tabel per_second tidak memiliki data (kosong), kembalikan null
  if (!realtime) {
    return {
      temp: { current: null, sensors: [{ value: null }, { value: null }], min: st.minTemp || null, max: st.maxTemp || null },
      humidity: { current: null, sensors: [{ value: null }, { value: null }], min: st.minHum || null, max: st.maxHum || null },
      gas: { current: null, sensors: [{ value: null }, { value: null }], min: st.minGas || null, max: st.maxGas || null }
    };
  }

  // Jika ada datanya, proses seperti biasa
  const avgTemp = ((parseFloat(realtime.temp1) + parseFloat(realtime.temp2)) / 2).toFixed(1);
  const avgHum = ((parseFloat(realtime.hum1) + parseFloat(realtime.hum2)) / 2).toFixed(1);
  const avgGas = ((parseFloat(realtime.sensor1) + parseFloat(realtime.sensor2)) / 2).toFixed(0);

  return {
    temp: { current: avgTemp, sensors: [{ value: realtime.temp1 }, { value: realtime.temp2 }], min: st.minTemp || null, max: st.maxTemp || null },
    humidity: { current: avgHum, sensors: [{ value: realtime.hum1 }, { value: realtime.hum2 }], min: st.minHum || null, max: st.maxHum || null },
    gas: { current: avgGas, sensors: [{ value: realtime.sensor1 }, { value: realtime.sensor2 }], min: st.minGas || null, max: st.maxGas || null }
  };
};

const getLatestGasData = async (req, res) => {
  try {
    const [vendor, control, battery2, battery3, battery4] = await Promise.all([
      formatRoomData('vendor', VendorHistory, 'co2'),
      formatRoomData('control', ControlHistory, 'co2'),
      formatRoomData('battery2', Battery2History, 'hydrogen'),
      formatRoomData('battery3', Battery3History, 'hydrogen'),
      formatRoomData('battery4', Battery4History, 'hydrogen')
    ]);

    res.status(200).json({ vendor, control, battery2, battery3, battery4 });
  } catch (error) {
    console.error('Gas Realtime Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data realtime' });
  }
};

const getAlerts = async (req, res) => {
  try {
    const { room } = req.query;
    // Tentukan jenis gas berdasarkan nama ruangan (CO2 untuk vendor/control, Hydrogen untuk battery)
    const gasType = ['vendor', 'control'].includes(room) ? 'co2' : 'hydrogen';
    
    const alerts = await Alert.findAll({
      where: { gas: gasType, room },
      order: [['updated_at', 'DESC']],
      limit: 50
    });
    
    const formattedAlerts = alerts.map(a => ({ time: a.updated_at, alert: a.alert, status: a.status }));
    res.status(200).json(formattedAlerts);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil alert' });
  }
};

// Ukuran bucket untuk grafik tren 24 jam - 5 menit per titik cukup detail untuk
// dilihat tapi jauh lebih ringan daripada mengirim data mentah per detik.
const TREND_BUCKET_SECONDS = 5 * 60;

const getTrend = async (req, res) => {
  try {
    const { room } = req.query;
    const Model = ModelMap[room];
    if (!Model) {
      return res.status(400).json({ success: false, message: `Ruangan '${room}' tidak dikenali` });
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const tableName = Model.getTableName();

    // Agregasi (AVG) per bucket waktu dihitung langsung oleh MySQL, jadi Node
    // hanya menerima hasil yang sudah ringkas (~288 titik/24 jam), bukan seluruh
    // baris mentah per detik.
    const rows = await Model.sequelize.query(
      `SELECT
         FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(updated_at) / :bucketSeconds) * :bucketSeconds) AS bucket_start,
         AVG(temp1) AS avg_temp,
         AVG(hum1) AS avg_hum,
         AVG(sensor1) AS avg_gas
       FROM \`${tableName}\`
       WHERE updated_at >= :startDate
       GROUP BY bucket_start
       ORDER BY bucket_start ASC`,
      {
        replacements: { bucketSeconds: TREND_BUCKET_SECONDS, startDate: yesterday },
        type: QueryTypes.SELECT
      }
    );

    const temp = [], humidity = [], gas = [];
    rows.forEach(r => {
      const time = new Date(r.bucket_start).getTime();
      temp.push([time, r.avg_temp !== null ? parseFloat(r.avg_temp) : null]);
      humidity.push([time, r.avg_hum !== null ? parseFloat(r.avg_hum) : null]);
      gas.push([time, r.avg_gas !== null ? parseFloat(r.avg_gas) : null]);
    });

    res.status(200).json({ temp, humidity, gas });
  } catch (error) {
    console.error('Gas Trend Error:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil tren' });
  }
};

const exportData = async (req, res) => {
  try {
    const { room, format, startDate, endDate } = req.query;
    const Model = ModelMap[room];
    
    let whereClause = {};
    if (startDate && endDate) {
      whereClause.updated_at = {
        [Op.between]: [new Date(`${startDate} 00:00:00`), new Date(`${endDate} 23:59:59`)]
      };
    }

    const data = await Model.findAll({ where: whereClause, order: [['updated_at', 'DESC']] });
    const gasLabel = ['vendor', 'control'].includes(room) ? 'CO2' : 'Hidrogen';

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Data ${room}`);
      
      worksheet.columns = [
        { header: 'Waktu', key: 'time', width: 25 },
        { header: 'Suhu 1 (°C)', key: 'temp1', width: 15 },
        { header: 'Humidity 1 (%)', key: 'hum1', width: 15 },
        { header: `${gasLabel} Sensor 1 (ppm)`, key: 'sensor1', width: 25 }
      ];

      data.forEach(item => {
        worksheet.addRow({
          time: moment(item.updated_at).format('YYYY-MM-DD HH:mm:ss'),
          temp1: item.temp1, hum1: item.hum1, sensor1: item.sensor1
        });
      });

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Data_Gas_${room}.xlsx`);
      return workbook.xlsx.write(res).then(() => res.end());
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Data_Gas_${room}.pdf`);
      doc.pipe(res);

      doc.fontSize(16).text(`Laporan Histori Ruang ${room.toUpperCase()}`, { align: 'center' }).moveDown();
      data.forEach(item => {
        const time = moment(item.updated_at).format('YYYY-MM-DD HH:mm:ss');
        doc.fontSize(10).text(`Waktu: ${time} | Suhu: ${item.temp1}°C | Hum: ${item.hum1}% | ${gasLabel}: ${item.sensor1}ppm`);
        doc.moveDown(0.5);
      });
      doc.end();
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengekspor data' });
  }
};

module.exports = { getLatestGasData, getAlerts, getTrend, exportData };