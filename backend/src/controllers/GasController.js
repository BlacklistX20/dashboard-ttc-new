const { PerSecond, VendorHistory, ControlHistory, Battery2History, Battery3History, Battery4History, Alert } = require('../models/Gas');
const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const moment = require('moment');

const ModelMap = {
  vendor: VendorHistory, control: ControlHistory,
  battery2: Battery2History, battery3: Battery3History, battery4: Battery4History
};

const formatRoomData = async (roomName, HistoryModel, gasType) => {
  const realtime = await PerSecond.findOne({ where: { gas: gasType, room: roomName } });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = await HistoryModel.findAll({
    where: { updated_at: { [Op.gte]: today } },
    attributes: [
      [PerSecond.sequelize.fn('MIN', PerSecond.sequelize.col('temp1')), 'minTemp'],
      [PerSecond.sequelize.fn('MAX', PerSecond.sequelize.col('temp1')), 'maxTemp'],
      [PerSecond.sequelize.fn('MIN', PerSecond.sequelize.col('hum1')), 'minHum'],
      [PerSecond.sequelize.fn('MAX', PerSecond.sequelize.col('hum1')), 'maxHum'],
      [PerSecond.sequelize.fn('MIN', PerSecond.sequelize.col('sensor1')), 'minGas'],
      [PerSecond.sequelize.fn('MAX', PerSecond.sequelize.col('sensor1')), 'maxGas'],
    ],
    raw: true
  });

  const rt = realtime || { temp1: 0, temp2: 0, hum1: 0, hum2: 0, sensor1: 0, sensor2: 0 };
  const st = stats[0] || {};

  const avgTemp = ((parseFloat(rt.temp1) + parseFloat(rt.temp2)) / 2).toFixed(1);
  const avgHum = ((parseFloat(rt.hum1) + parseFloat(rt.hum2)) / 2).toFixed(1);
  const avgGas = ((parseFloat(rt.sensor1) + parseFloat(rt.sensor2)) / 2).toFixed(0);

  return {
    temp: { current: avgTemp, sensors: [{ value: rt.temp1 }, { value: rt.temp2 }], min: st.minTemp || 0, max: st.maxTemp || 0 },
    humidity: { current: avgHum, sensors: [{ value: rt.hum1 }, { value: rt.hum2 }], min: st.minHum || 0, max: st.maxHum || 0 },
    gas: { current: avgGas, sensors: [{ value: rt.sensor1 }, { value: rt.sensor2 }], min: st.minGas || 0, max: st.maxGas || 0 }
  };
};

const getLatestGasData = async (req, res) => {
  try {
    const vendor = await formatRoomData('vendor', VendorHistory, 'co2');
    const control = await formatRoomData('control', ControlHistory, 'co2');
    const battery2 = await formatRoomData('battery2', Battery2History, 'hydrogen');
    const battery3 = await formatRoomData('battery3', Battery3History, 'hydrogen');
    const battery4 = await formatRoomData('battery4', Battery4History, 'hydrogen');
    
    res.status(200).json({ vendor, control, battery2, battery3, battery4 });
  } catch (error) {
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

const getTrend = async (req, res) => {
  try {
    const { room } = req.query;
    const Model = ModelMap[room];
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const history = await Model.findAll({
      where: { updated_at: { [Op.gte]: yesterday } },
      order: [['updated_at', 'ASC']]
    });

    const temp = [], humidity = [], gas = [];
    history.forEach(h => {
      const time = new Date(h.updated_at).getTime();
      temp.push([time, parseFloat(h.temp1)]);
      humidity.push([time, parseFloat(h.hum1)]);
      gas.push([time, parseFloat(h.sensor1)]);
    });

    res.status(200).json({ temp, humidity, gas });
  } catch (error) {
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