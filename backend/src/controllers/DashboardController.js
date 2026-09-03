const { Pue, PerSecond: PowerPerSecond } = require('../models/Power');
const { TempPerSecond } = require('../models/Temp');
const { Daily, Monthly } = require('../models/Fuel');
const { PerSecond: GasPerSecond } = require('../models/Gas'); // Perbarui import model Gas

exports.getDashboardData = async (req, res) => {
  try {
    // -------------------------------------------------------------
    // 1. STATISTIK PUE (Database: power, Tabel: pue)
    // -------------------------------------------------------------
    const pueRecords = await Pue.findAll({ limit: 7, order: [['id', 'DESC']] });
    const pueChartData = pueRecords.map(r => parseFloat(r.pue)).reverse(); 
    
    const currentPue = pueChartData.length > 0 ? pueChartData[pueChartData.length - 1] : 0;
    const minPue = pueChartData.length > 0 ? Math.min(...pueChartData) : 0;
    const maxPue = pueChartData.length > 0 ? Math.max(...pueChartData) : 0;

    // -------------------------------------------------------------
    // 2. SUHU DATA CENTER (Database: temp, Tabel: per_second, id: 18)
    // -------------------------------------------------------------
    const dcTempRecord = await TempPerSecond.findByPk(18);
    const suhuDataCenter = dcTempRecord ? parseFloat(dcTempRecord.temp) : 0;

    // -------------------------------------------------------------
    // 3. OKUPANSI SUMBER DAYA (Database: power, Tabel: per_second, id: 2)
    // -------------------------------------------------------------
    const lvmdpRecord = await PowerPerSecond.findByPk(2);
    const loads = lvmdpRecord ? parseFloat(lvmdpRecord.loads) : 0;
    
    const okupansi = {
      trafo: Math.round((loads / 2000) * 100),
      pln: Math.round((loads / 1385) * 100),
      genset: Math.round((loads / 2500) * 100)
    };

    // -------------------------------------------------------------
    // 4. DATA BBM (Database: fuel, Tabel: daily & monthly)
    // -------------------------------------------------------------
    const dailyRecords = await Daily.findAll({ limit: 7, order: [['id', 'DESC']] });
    const monthlyRecords = await Monthly.findAll({ limit: 7, order: [['id', 'DESC']] });

    // -------------------------------------------------------------
    // 5. ENVIRONMENT GEDUNG (Database: gas & Mock Data)
    // -------------------------------------------------------------
    // Mengambil semua baris data realtime per_second dari DB gas sekaligus
    const gasRealtime = await GasPerSecond.findAll();

    // Fungsi helper untuk mencari gas & ruangan tertentu lalu merata-ratakan nilai sensornya
    const getGasAvg = (gasType, roomName, decimals = 0) => {
      const record = gasRealtime.find(r => r.gas === gasType && r.room === roomName);
      if (!record) return 0;
      const avg = (parseFloat(record.sensor1) + parseFloat(record.sensor2)) / 2;
      return Number(avg.toFixed(decimals));
    };

    const environment = {
      co2Data: [
        { name: 'Ruang Control', value: getGasAvg('co2', 'control') },
        { name: 'Ruang Vendor', value: getGasAvg('co2', 'vendor') }
      ],
      h2Data: [
        { name: 'R. Baterai Lt 1', value: 0.2 }, // Mock (Tidak ada di gas.sql)
        { name: 'R. Baterai Lt 2', value: getGasAvg('hydrogen', 'battery2', 2) },
        { name: 'R. Baterai Lt 3', value: getGasAvg('hydrogen', 'battery3', 2) },
        { name: 'R. Baterai Lt 4', value: getGasAvg('hydrogen', 'battery4', 2) },
        { name: 'R. Baterai Lt 5', value: 0.25 }  // Mock (Tidak ada di gas.sql)
      ],
      coGensetData: [
        { name: 'Genset 1', value: 12 }, // Mock
        { name: 'Genset 2', value: 18 }, // Mock
        { name: 'Genset 3', value: 45 }  // Mock
      ]
    };

    // -------------------------------------------------------------
    // 6. KIRIM RESPONSE JSON KE FRONTEND
    // -------------------------------------------------------------
    res.json({
      pue: { current: currentPue, min: minPue, max: maxPue, chart: pueChartData },
      suhuDataCenter,
      okupansi,
      environment,
      fuel: {
        daily: dailyRecords.reverse(),
        monthly: monthlyRecords.reverse()
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server saat mengambil data dashboard.' });
  }
};