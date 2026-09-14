const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Op } = require('sequelize');
const { PmHistory } = require('../models/PotencyModel'); // Sesuaikan path jika berbeda

// --- KONFIGURASI MULTER (UPLOAD FILE) ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = 'public/uploads/pm-dokumen';
    // Otomatis membuat folder jika belum ada di server
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    // Format nama file: PM-[Timestamp]-[NamaOriginal].pdf
    cb(null, 'PM-' + Date.now() + path.extname(file.originalname));
  }
});

// Filter untuk menolak selain PDF
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Hanya diperbolehkan format PDF!'), false);
  }
};

// Middleware Upload
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // Batas maksimal 5MB
});

exports.uploadMiddleware = upload.single('document'); // 'document' adalah nama field dari frontend

// --- OPERASI CRUD ---

// 1. Ambil Data (dengan Filter)
exports.getAll = async (req, res) => {
  try {
    const { startDate, endDate, device, status } = req.query;
    let whereClause = {};

    if (startDate && endDate) {
      whereClause.plan_date = { [Op.between]: [startDate, endDate] };
    }
    if (device) whereClause.device_type = device;
    if (status) whereClause.status = status;

    const data = await PmHistory.findAll({ 
      where: whereClause,
      order: [['plan_date', 'DESC']]
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal mengambil riwayat PM' });
  }
};

// 2. Tambah Data Baru
exports.createData = async (req, res) => {
  try {
    const newData = { ...req.body };
    if (req.file) {
      // Simpan path relatif: "uploads/pm-dokumen/namafile.pdf"
      newData.document_path = req.file.path.replace(/\\/g, '/').replace('public/', '');
    }
    
    const result = await PmHistory.create(newData);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menambah data' });
  }
};

// 3. Edit Data
exports.updateData = async (req, res) => {
  try {
    const { id } = req.params;
    const pm = await PmHistory.findByPk(id);
    if (!pm) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    const updateData = { ...req.body };
    
    // Jika ada file baru yang diunggah, hapus file lama secara fisik
    if (req.file) {
      if (pm.document_path) {
        const oldPath = path.join(__dirname, '../../public', pm.document_path);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.document_path = req.file.path.replace(/\\/g, '/').replace('public/', '');
    }

    await pm.update(updateData);
    res.status(200).json({ success: true, message: 'Data berhasil diperbarui' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal memperbarui data' });
  }
};

// 4. Hapus Data
exports.deleteData = async (req, res) => {
  try {
    const { id } = req.params;
    const pm = await PmHistory.findByPk(id);
    if (!pm) return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });

    // Hapus file fisik PDF jika ada
    if (pm.document_path) {
      const oldPath = path.join(__dirname, '../../public', pm.document_path);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    await pm.destroy();
    res.status(200).json({ success: true, message: 'Data dan dokumen berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Gagal menghapus data' });
  }
};