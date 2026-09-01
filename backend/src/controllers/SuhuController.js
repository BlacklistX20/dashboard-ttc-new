const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const {
  Battery2, Battery3, Battery4, Containment5, Genset, Mkios3, Ocs3, Pengembangan5, UtilityA5, UtilityB5,
  Recti2, Recti3, Recti4, Trafo,
  Bss4, Core3, Csps2, Interkoneksi4,
  DataCenter5, Invas3, Msc2, Transmisi4,
  TempPerSecond
} = require('../models/Temp');

// ==========================================================
// KONFIGURASI RUANGAN
// Mapping id di tabel per_second -> model tabel detail (history per sensor),
// lantai (untuk grouping tab di frontend), dan jumlah sensor per ruangan.
// Urutan & id sudah dikonfirmasi sesuai data di tabel per_second.
// ==========================================================
const ROOM_CONFIG = [
  { id: 21, key: 'trafo',         label: 'Ruang Trafo',        floor: 'lt1', model: Trafo,         sensorCount: 3 },
  { id: 22, key: 'genset',        label: 'Ruang Genset',       floor: 'lt1', model: Genset,        sensorCount: 2 },

  { id: 1,  key: 'battery2',      label: 'Ruang Baterai',      floor: 'lt2', model: Battery2,      sensorCount: 2 },
  { id: 2,  key: 'recti2',        label: 'Ruang Recti',        floor: 'lt2', model: Recti2,        sensorCount: 3 },
  { id: 3,  key: 'msc2',          label: 'Ruang MSC',          floor: 'lt2', model: Msc2,          sensorCount: 6 },
  { id: 4,  key: 'csps2',         label: 'Ruang CSPS',         floor: 'lt2', model: Csps2,         sensorCount: 4 },

  { id: 5,  key: 'battery3',      label: 'Ruang Baterai',      floor: 'lt3', model: Battery3,      sensorCount: 2 },
  { id: 6,  key: 'recti3',        label: 'Ruang Recti',        floor: 'lt3', model: Recti3,        sensorCount: 3 },
  { id: 7,  key: 'invas3',        label: 'Ruang INVAS',        floor: 'lt3', model: Invas3,        sensorCount: 6 },
  { id: 8,  key: 'core3',         label: 'Ruang Core',         floor: 'lt3', model: Core3,         sensorCount: 4 },
  { id: 9,  key: 'mkios3',        label: 'Ruang MKios',        floor: 'lt3', model: Mkios3,        sensorCount: 2 },
  { id: 10, key: 'ocs3',          label: 'Ruang OCS',          floor: 'lt3', model: Ocs3,          sensorCount: 2 },

  { id: 11, key: 'battery4',      label: 'Ruang Baterai',      floor: 'lt4', model: Battery4,      sensorCount: 2 },
  { id: 12, key: 'recti4',        label: 'Ruang Recti',        floor: 'lt4', model: Recti4,        sensorCount: 3 },
  { id: 13, key: 'bss4',          label: 'Ruang BSS',          floor: 'lt4', model: Bss4,          sensorCount: 4 },
  { id: 14, key: 'interkoneksi4', label: 'Ruang Interkoneksi', floor: 'lt4', model: Interkoneksi4, sensorCount: 4 },
  { id: 15, key: 'transmisi4',    label: 'Ruang Transmisi',    floor: 'lt4', model: Transmisi4,    sensorCount: 6 },

  { id: 16, key: 'utilityA5',     label: 'Ruang Utility A',    floor: 'lt5', model: UtilityA5,     sensorCount: 2 },
  { id: 17, key: 'utilityB5',     label: 'Ruang Utility B',    floor: 'lt5', model: UtilityB5,     sensorCount: 2 },
  { id: 18, key: 'dataCenter5',   label: 'Ruang Data Center',  floor: 'lt5', model: DataCenter5,   sensorCount: 6 },
  { id: 19, key: 'pengembangan5', label: 'Ruang Pengembangan', floor: 'lt5', model: Pengembangan5, sensorCount: 2 },
  { id: 20, key: 'containment5',  label: 'Ruang Containment',  floor: 'lt5', model: Containment5,  sensorCount: 2 }
];

const ROOM_BY_KEY = {};
ROOM_CONFIG.forEach(r => { ROOM_BY_KEY[r.key] = r; });

// ==========================================================
// 1. DATA REALTIME (Ringkasan dari 'per_second' + breakdown sensor dari tabel detail)
// ==========================================================
exports.getRealtime = async (req, res) => {
  try {
    // Ringkasan (rata-rata suhu/kelembapan + status koneksi) - 1 query untuk semua ruangan
    const perSecondRows = await TempPerSecond.findAll();
    const perSecondMap = {};
    perSecondRows.forEach(item => { perSecondMap[item.id] = item; });

    // Breakdown per sensor - ambil baris terbaru dari tiap tabel detail ruangan
    const latestRows = await Promise.all(
      ROOM_CONFIG.map(room => room.model.findOne({ order: [['updated_at', 'DESC']] }))
    );
    const latestMap = {};
    ROOM_CONFIG.forEach((room, idx) => { latestMap[room.id] = latestRows[idx]; });

    const grouped = { lt1: [], lt2: [], lt3: [], lt4: [], lt5: [] };

    ROOM_CONFIG.forEach(room => {
      const summary = perSecondMap[room.id];
      const latest = latestMap[room.id];

      const sensors = [];
      for (let i = 1; i <= room.sensorCount; i++) {
        sensors.push({
          name: `Sensor Suhu ${i}`,
          temp: latest ? parseFloat(latest[`t${i}`]) : 0
        });
      }

      grouped[room.floor].push({
        id: room.id,
        name: room.label,
        avgTemp: summary ? parseFloat(summary.temp) : 0,
        avgHum: summary ? parseFloat(summary.hum) : 0,
        isConnected: summary ? summary.status === 'C' : false,
        sensors
      });
    });

    res.json(grouped);
  } catch (error) {
    console.error('Realtime Suhu Error:', error);
    res.status(500).json({ error: 'Gagal mengambil data suhu realtime' });
  }
};

// ==========================================================
// 2. EXPORT DATA (Excel / PDF) - History per ruangan
// ==========================================================
const sendExcel = async (res, title, columns, rows, filenameBase) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title.substring(0, 31));

  sheet.columns = [
    { header: 'Waktu', key: 'updated_at', width: 22 },
    ...columns.map(c => ({ header: c.header, key: c.key, width: 18 }))
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2C0' } };

  rows.forEach(row => {
    const rowData = { updated_at: new Date(row.updated_at).toLocaleString('id-ID') };
    columns.forEach(c => { rowData[c.key] = row[c.key] !== null ? parseFloat(row[c.key]) : null; });
    sheet.addRow(rowData);
  });

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.xlsx"`);
  await workbook.xlsx.write(res);
  res.end();
};

const sendPdf = (res, title, columns, rows, filenameBase) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
  doc.pipe(res);

  doc.fontSize(14).font('Helvetica-Bold').text(`Laporan Suhu - ${title}`, { align: 'center' });
  doc.moveDown(0.7);

  const headers = ['Waktu', ...columns.map(c => c.header)];
  const colCount = headers.length;
  const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colWidth = pageWidth / colCount;
  const rowHeight = 20;
  let y = doc.y + 5;

  const drawRow = (values, isHeader = false) => {
    if (y + rowHeight > doc.page.height - doc.page.margins.bottom) {
      doc.addPage();
      y = doc.page.margins.top;
    }
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica').fontSize(8);
    values.forEach((val, i) => {
      doc.text(String(val ?? '-'), doc.page.margins.left + i * colWidth, y, { width: colWidth, align: 'left' });
    });
    doc.moveTo(doc.page.margins.left, y + rowHeight - 4)
      .lineTo(doc.page.width - doc.page.margins.right, y + rowHeight - 4)
      .strokeColor('#e2e8f0').stroke();
    y += rowHeight;
  };

  drawRow(headers, true);
  rows.forEach(row => {
    const values = [
      new Date(row.updated_at).toLocaleString('id-ID'),
      ...columns.map(c => (row[c.key] !== null ? parseFloat(row[c.key]).toFixed(2) : '-'))
    ];
    drawRow(values);
  });

  doc.end();
};

exports.exportData = async (req, res) => {
  try {
    const { room, format, startDate, endDate } = req.query;

    const config = ROOM_BY_KEY[room];
    if (!config) {
      return res.status(400).json({ error: `Ruangan '${room}' tidak dikenali` });
    }
    if (!['excel', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Format harus excel atau pdf' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate dan endDate wajib diisi' });
    }

    const rangeStart = new Date(`${startDate}T00:00:00`);
    const rangeEnd = new Date(`${endDate}T23:59:59.999`);

    // Kolom dinamis: rata-rata + tiap sensor (Suhu & Kelembapan), sesuai jumlah sensor ruangan ini
    const columns = [
      { header: 'Rata-rata Suhu (°C)', key: 't_avg' },
      { header: 'Rata-rata Kelembapan (%)', key: 'h_avg' }
    ];
    for (let i = 1; i <= config.sensorCount; i++) {
      columns.push({ header: `Suhu Sensor ${i} (°C)`, key: `t${i}` });
      columns.push({ header: `Kelembapan Sensor ${i} (%)`, key: `h${i}` });
    }

    const attributeKeys = ['updated_at', ...columns.map(c => c.key)];
    const rows = await config.model.findAll({
      where: { updated_at: { [Op.between]: [rangeStart, rangeEnd] } },
      order: [['updated_at', 'ASC']],
      attributes: attributeKeys
    });

    const filenameBase = `Suhu_${config.label.replace(/\s+/g, '')}_${startDate}_${endDate}`;

    if (format === 'excel') {
      await sendExcel(res, config.label, columns, rows, filenameBase);
    } else {
      sendPdf(res, config.label, columns, rows, filenameBase);
    }
  } catch (error) {
    console.error('Export Suhu Error:', error);
    res.status(500).json({ error: 'Gagal membuat file export' });
  }
};