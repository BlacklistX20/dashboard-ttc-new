const { Daily, Monthly } = require('../models/Fuel');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');

// Konfigurasi Kapasitas Tangki (Ubah di sini jika ada perubahan di masa depan)
const TANK_CAPACITY = {
  harian: { tank1: 1500, tank2: 1500 },
  bulanan: { tank1: 11662, tank2: 10000, tank3: 10000 }
};

const getLatestFuelData = async (req, res) => {
  try {
    const dailyData = await Daily.findByPk(1);
    const monthlyData = await Monthly.findByPk(1);

    if (!dailyData || !monthlyData) {
      return res.status(404).json({ success: false, message: 'Data ID 1 tidak ditemukan' });
    }

    const tanksHarian = [
      { name: 'Harian 1', capacity: TANK_CAPACITY.harian.tank1, currentVolume: parseFloat(dailyData.tank1), animatedVolume: 0, animatedPercentage: 0 },
      { name: 'Harian 2', capacity: TANK_CAPACITY.harian.tank2, currentVolume: parseFloat(dailyData.tank2), animatedVolume: 0, animatedPercentage: 0 }
    ];

    const tanksBulanan = [
      { name: 'Bulanan 1', capacity: TANK_CAPACITY.bulanan.tank1, currentVolume: parseFloat(monthlyData.tank1), animatedVolume: 0, animatedPercentage: 0 },
      { name: 'Bulanan 2', capacity: TANK_CAPACITY.bulanan.tank2, currentVolume: parseFloat(monthlyData.tank2), animatedVolume: 0, animatedPercentage: 0 },
      { name: 'Bulanan 3', capacity: TANK_CAPACITY.bulanan.tank3, currentVolume: parseFloat(monthlyData.tank3), animatedVolume: 0, animatedPercentage: 0 }
    ];

    res.status(200).json({ success: true, tanksHarian, tanksBulanan });
  } catch (error) {
    console.error('Error fetching fuel data:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data tangki' });
  }
};

const exportFuelData = async (req, res) => {
  try {
    const { kategori, format, startDate, endDate } = req.query;
    const Model = kategori === 'harian' ? Daily : Monthly;
    
    // Mengecualikan ID 1 dari hasil query
    let whereClause = {
      id: { [Op.ne]: 1 }
    };
    
    if (startDate && endDate) {
      whereClause.updated_at = {
        [Op.between]: [new Date(`${startDate} 00:00:00`), new Date(`${endDate} 23:59:59`)]
      };
    }

    const data = await Model.findAll({ 
      where: whereClause, 
      order: [['updated_at', 'DESC']] 
    });

    if (data.length === 0) {
      return res.status(404).json({ success: false, message: 'Tidak ada data historis pada rentang tanggal tersebut' });
    }

    if (format === 'excel') {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(`Data ${kategori}`);
      
      const baseColumns = [
        { header: 'ID', key: 'id', width: 10 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Update Terakhir', key: 'updated_at', width: 30 }
      ];

      const tankColumns = kategori === 'harian' 
        ? [ { header: 'Tank 1 (L)', key: 'tank1', width: 20 }, { header: 'Tank 2 (L)', key: 'tank2', width: 20 } ]
        : [ { header: 'Tank 1 (L)', key: 'tank1', width: 20 }, { header: 'Tank 2 (L)', key: 'tank2', width: 20 }, { header: 'Tank 3 (L)', key: 'tank3', width: 20 } ];

      worksheet.columns = [...baseColumns.slice(0,1), ...tankColumns, ...baseColumns.slice(1)];
      data.forEach(item => worksheet.addRow(item.toJSON()));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=Data_Tangki_${kategori}.xlsx`);
      return workbook.xlsx.write(res).then(() => res.end());
    }

    if (format === 'pdf') {
      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=Data_Tangki_${kategori}.pdf`);
      doc.pipe(res);

      doc.fontSize(16).text(`Laporan Data Historis Tangki ${kategori.toUpperCase()}`, { align: 'center' });
      doc.moveDown();

      data.forEach(item => {
        const text = kategori === 'harian'
          ? `[ID: ${item.id}] Waktu: ${item.updated_at} | T1: ${item.tank1}L | T2: ${item.tank2}L | Status: ${item.status}`
          : `[ID: ${item.id}] Waktu: ${item.updated_at} | T1: ${item.tank1}L | T2: ${item.tank2}L | T3: ${item.tank3}L | Status: ${item.status}`;
        doc.fontSize(10).text(text);
        doc.moveDown(0.5);
      });
      
      doc.end();
    }
  } catch (error) {
    console.error('Error export:', error);
    res.status(500).json({ success: false, message: 'Gagal mengekspor data' });
  }
};

module.exports = { getLatestFuelData, exportFuelData };