const { Op } = require('sequelize');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const {
  PerSecond, Pue, Lvmdp, It, Recti, Ups,
  P205, P236, P305, P310, P429,
  Ups202, Ups203, Ups301, Ups302, Ups501, Ups502
} = require('../models/Power');

// Helper: Menentukan Waktu Mulai (Range Filter)
const getStartDate = (range) => {
  const now = new Date();
  if (range === '1d') return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (range === '1w') return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - 60 * 60 * 1000); // Default: 1 Jam ('1h')
};

// Helper: Ukuran bucket waktu untuk downsampling (agar chart tidak lag di rentang panjang)
const getBucketMs = (range) => {
  if (range === '1w') return 60 * 60 * 1000;   // per 1 jam
  if (range === '1d') return 5 * 60 * 1000;    // per 5 menit
  return 0;                                     // '1h' -> data mentah, tanpa bucketing
};

// Helper: Downsampling data time-series dengan rata-rata (AVG) per bucket waktu
const aggregateSeries = (rows, range, valueKey = 'loads') => {
  const bucketMs = getBucketMs(range);
  if (bucketMs === 0) {
    return rows.map(item => ({ x: item.updated_at, y: parseFloat(item[valueKey]) }));
  }
  const buckets = new Map(); // key: awal bucket (ms) -> { sum, count }
  rows.forEach(item => {
    const t = new Date(item.updated_at).getTime();
    const bucketStart = Math.floor(t / bucketMs) * bucketMs;
    const val = parseFloat(item[valueKey]);
    if (!buckets.has(bucketStart)) buckets.set(bucketStart, { sum: 0, count: 0 });
    const b = buckets.get(bucketStart);
    b.sum += val;
    b.count += 1;
  });
  return Array.from(buckets.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([bucketStart, { sum, count }]) => ({
      x: new Date(bucketStart),
      y: parseFloat((sum / count).toFixed(2))
    }));
};

// ==========================================================
// 1. DATA REALTIME (Dari tabel 'per_second')
// ==========================================================
exports.getRealtime = async (req, res) => {
  try {
    const rawData = await PerSecond.findAll();
    
    // Mapping data berdasarkan ID untuk pencarian O(1)
    const map = {};
    rawData.forEach(item => { map[item.id] = item; });

    const format = (id, defaultName) => ({
      name: map[id] ? map[id].name : defaultName,
      kva: map[id] ? parseFloat(map[id].loads) : 0,
      voltage: map[id] ? parseFloat(map[id].voltage) : 0,
      current: map[id] ? parseFloat(map[id].current) : 0,
      freq: map[id] ? parseFloat(map[id].frequency) : 0,
    });

    const formatPanel = (id, defaultName) => ({
      name: map[id] ? map[id].name : defaultName,
      kva: map[id] ? parseFloat(map[id].loads) : 0,
      v: map[id] ? parseFloat(map[id].voltage) : 0,
      a: map[id] ? parseFloat(map[id].current) : 0,
      hz: map[id] ? parseFloat(map[id].frequency) : 0,
    });

    res.json({
      pue: map[1] ? parseFloat(map[1].loads) : 0.00, // ID 1
      lvmdp: format(2, 'LVMDP'),                     // ID 2
      itLoad: format(3, 'IT Load'),                  // ID 3
      totalRecti: format(4, 'Total Rectifier'),      // ID 4
      totalUps: format(5, 'Total UPS'),              // ID 5
      
      rectiList: [ // ID 6 - 10
        formatPanel(6, 'P205'), formatPanel(7, 'P236'), formatPanel(8, 'P305'),
        formatPanel(9, 'P310'), formatPanel(10, 'P429')
      ],
      
      upsList: [ // ID 11 - 16
        formatPanel(11, 'UPS 202'), formatPanel(12, 'UPS 203'), formatPanel(13, 'UPS 301'),
        formatPanel(14, 'UPS 302'), formatPanel(15, 'UPS 501'), formatPanel(16, 'UPS 502')
      ]
    });
  } catch (error) {
    console.error('Realtime Error:', error);
    res.status(500).json({ error: 'Gagal mengambil data realtime' });
  }
};

// ==========================================================
// 2. TREN DATA RECTIFIER (Digabungkan 1 Route)
// ==========================================================
exports.getTrendRectifiers = async (req, res) => {
  try {
    const range = req.query.range || '1h';
    const startDate = getStartDate(range);
    const whereClause = { updated_at: { [Op.gte]: startDate } };
    const order = [['updated_at', 'ASC']];
    const attributes = ['loads', 'updated_at'];

    const [p205, p236, p305, p310, p429] = await Promise.all([
      P205.findAll({ where: whereClause, order, attributes }),
      P236.findAll({ where: whereClause, order, attributes }),
      P305.findAll({ where: whereClause, order, attributes }),
      P310.findAll({ where: whereClause, order, attributes }),
      P429.findAll({ where: whereClause, order, attributes })
    ]);

    res.json([
      { name: 'Panel 2.05', data: aggregateSeries(p205, range) },
      { name: 'Panel 2.36', data: aggregateSeries(p236, range) },
      { name: 'Panel 3.05', data: aggregateSeries(p305, range) },
      { name: 'Panel 3.10', data: aggregateSeries(p310, range) },
      { name: 'Panel 4.29', data: aggregateSeries(p429, range) }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil tren Rectifier' });
  }
};

// ==========================================================
// 3. TREN DATA UPS (Digabungkan 1 Route)
// ==========================================================
exports.getTrendUps = async (req, res) => {
  try {
    const range = req.query.range || '1h';
    const startDate = getStartDate(range);
    const whereClause = { updated_at: { [Op.gte]: startDate } };
    const order = [['updated_at', 'ASC']];
    const attributes = ['loads', 'updated_at'];

    const [u202, u203, u301, u302, u501, u502] = await Promise.all([
      Ups202.findAll({ where: whereClause, order, attributes }),
      Ups203.findAll({ where: whereClause, order, attributes }),
      Ups301.findAll({ where: whereClause, order, attributes }),
      Ups302.findAll({ where: whereClause, order, attributes }),
      Ups501.findAll({ where: whereClause, order, attributes }),
      Ups502.findAll({ where: whereClause, order, attributes })
    ]);

    res.json([
      { name: 'UPS 2.02', data: aggregateSeries(u202, range) },
      { name: 'UPS 2.03', data: aggregateSeries(u203, range) },
      { name: 'UPS 3.01', data: aggregateSeries(u301, range) },
      { name: 'UPS 3.02', data: aggregateSeries(u302, range) },
      { name: 'UPS 5.01', data: aggregateSeries(u501, range) },
      { name: 'UPS 5.02', data: aggregateSeries(u502, range) }
    ]);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil tren UPS' });
  }
};

// ==========================================================
// 4. TREN UTAMA (LVMDP, IT, PUE)
// ==========================================================
exports.getTrendMain = async (req, res) => {
  try {
    const range = req.query.range || '1h';
    const startDate = getStartDate(range);
    const whereClause = { updated_at: { [Op.gte]: startDate } };
    const order = [['updated_at', 'ASC']];

    const [lvmdp, it, pue] = await Promise.all([
      Lvmdp.findAll({ where: whereClause, order, attributes: ['loads', 'updated_at'] }),
      It.findAll({ where: whereClause, order, attributes: ['loads', 'updated_at'] }),
      Pue.findAll({ where: whereClause, order, attributes: ['pue', 'updated_at'] }) // Ambil nilai PUE spesifik
    ]);

    res.json({
      lvmdp: aggregateSeries(lvmdp, range, 'loads'),
      it: aggregateSeries(it, range, 'loads'),
      pue: aggregateSeries(pue, range, 'pue')
    });
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil tren Utama' });
  }
};

// ==========================================================
// 5. EXPORT DATA (Excel / PDF)
// ==========================================================
// Kolom standar untuk tabel panel/UPS tunggal
const panelColumns = () => ([
  { header: 'Loads (kVA)', key: 'loads' },
  { header: 'Voltage (V)', key: 'voltage' },
  { header: 'Current (A)', key: 'current' },
  { header: 'Frequency (Hz)', key: 'frequency' }
]);

// Mapping tableType -> model sumber data & kolom yang di-export.
// Rectifier/UPS/All Load diambil dari tabel 'pue' karena tabel itu sudah
// berisi kolom gabungan semua panel per timestamp yang sama (tidak perlu join manual).
const EXPORT_CONFIG = {
  'PUE': {
    model: Pue,
    columns: [{ header: 'PUE', key: 'pue' }]
  },
  'Rectifier': {
    model: Pue,
    columns: [
      { header: 'Total Rectifier (kVA)', key: 'recti' },
      { header: 'Panel 2.05 (kVA)', key: 'p205' },
      { header: 'Panel 2.36 (kVA)', key: 'p236' },
      { header: 'Panel 3.05 (kVA)', key: 'p305' },
      { header: 'Panel 3.10 (kVA)', key: 'p310' },
      { header: 'Panel 4.29 (kVA)', key: 'p429' }
    ]
  },
  'UPS': {
    model: Pue,
    columns: [
      { header: 'Total UPS (kVA)', key: 'ups' },
      { header: 'UPS 2.02 (kVA)', key: 'ups202' },
      { header: 'UPS 2.03 (kVA)', key: 'ups203' },
      { header: 'UPS 3.01 (kVA)', key: 'ups301' },
      { header: 'UPS 3.02 (kVA)', key: 'ups302' },
      { header: 'UPS 5.01 (kVA)', key: 'ups501' },
      { header: 'UPS 5.02 (kVA)', key: 'ups502' }
    ]
  },
  'Panel 2.05': { model: P205, columns: panelColumns() },
  'Panel 2.36': { model: P236, columns: panelColumns() },
  'Panel 3.05': { model: P305, columns: panelColumns() },
  'Panel 3.10': { model: P310, columns: panelColumns() },
  'Panel 4.29': { model: P429, columns: panelColumns() },
  'UPS 2.02': { model: Ups202, columns: panelColumns() },
  'UPS 2.03': { model: Ups203, columns: panelColumns() },
  'UPS 3.01': { model: Ups301, columns: panelColumns() },
  'UPS 3.02': { model: Ups302, columns: panelColumns() },
  'UPS 5.01': { model: Ups501, columns: panelColumns() },
  'UPS 5.02': { model: Ups502, columns: panelColumns() },
  'All Load': {
    model: Pue,
    columns: [
      { header: 'PUE', key: 'pue' },
      { header: 'LVMDP (kVA)', key: 'lvmdp' },
      { header: 'IT Load (kVA)', key: 'it' },
      { header: 'Total Rectifier (kVA)', key: 'recti' },
      { header: 'Total UPS (kVA)', key: 'ups' },
      { header: 'Panel 2.05 (kVA)', key: 'p205' },
      { header: 'Panel 2.36 (kVA)', key: 'p236' },
      { header: 'Panel 3.05 (kVA)', key: 'p305' },
      { header: 'Panel 3.10 (kVA)', key: 'p310' },
      { header: 'Panel 4.29 (kVA)', key: 'p429' },
      { header: 'UPS 2.02 (kVA)', key: 'ups202' },
      { header: 'UPS 2.03 (kVA)', key: 'ups203' },
      { header: 'UPS 3.01 (kVA)', key: 'ups301' },
      { header: 'UPS 3.02 (kVA)', key: 'ups302' },
      { header: 'UPS 5.01 (kVA)', key: 'ups501' },
      { header: 'UPS 5.02 (kVA)', key: 'ups502' }
    ]
  }
};

// Generate & kirim file Excel (.xlsx) memakai exceljs
const sendExcel = async (res, title, columns, rows, filenameBase) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(title.substring(0, 31)); // nama sheet maks 31 karakter

  sheet.columns = [
    { header: 'Waktu', key: 'updated_at', width: 22 },
    ...columns.map(c => ({ header: c.header, key: c.key, width: 18 }))
  ];

  sheet.getRow(1).font = { bold: true };
  sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0F2FE' } };

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

// Generate & kirim file PDF (tabel sederhana) memakai pdfkit
const sendPdf = (res, title, columns, rows, filenameBase) => {
  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}.pdf"`);
  doc.pipe(res);

  doc.fontSize(14).font('Helvetica-Bold').text(`Laporan Kelistrikan - ${title}`, { align: 'center' });
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
    const { tableType, format, startDate, endDate } = req.query;

    const config = EXPORT_CONFIG[tableType];
    if (!config) {
      return res.status(400).json({ error: `Tipe data '${tableType}' tidak dikenali` });
    }
    if (!['excel', 'pdf'].includes(format)) {
      return res.status(400).json({ error: 'Format harus excel atau pdf' });
    }
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'startDate dan endDate wajib diisi' });
    }

    const rangeStart = new Date(`${startDate}T00:00:00`);
    const rangeEnd = new Date(`${endDate}T23:59:59.999`);

    const attributeKeys = ['updated_at', ...config.columns.map(c => c.key)];
    const rows = await config.model.findAll({
      where: { updated_at: { [Op.between]: [rangeStart, rangeEnd] } },
      order: [['updated_at', 'ASC']],
      attributes: attributeKeys
    });

    const filenameBase = `Kelistrikan_${tableType}_${startDate}_${endDate}`;

    if (format === 'excel') {
      await sendExcel(res, tableType, config.columns, rows, filenameBase);
    } else {
      sendPdf(res, tableType, config.columns, rows, filenameBase);
    }
  } catch (error) {
    console.error('Export Error:', error);
    res.status(500).json({ error: 'Gagal membuat file export' });
  }
};