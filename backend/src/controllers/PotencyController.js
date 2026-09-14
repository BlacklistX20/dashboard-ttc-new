const models = require('../models/PotencyModel');

// Pemetaan parameter URL (tableName) ke Model Database
const ModelMap = {
  'power': models.PowerAsset,
  'cool': models.Cool,
  'rack': models.Rack,
  'fire': models.Fire,
  'tank': models.Tank,
  'security': models.Security,
  'light': models.Light,
  'pump': models.Pump,
  'furniture': models.Furniture,
  'finishing': models.Finishing,
  'safety': models.Safety,
  'transport': models.Transport
};

// --- Helper: Mengecek Validitas Model ---
const getModel = (tableName) => {
  return ModelMap[tableName];
};

// ==========================================
// 1. GET ALL (Read)
// ==========================================
exports.getAllData = async (req, res) => {
  try {
    const Model = getModel(req.params.tableName);
    if (!Model) return res.status(400).json({ success: false, message: 'Tabel tidak valid' });

    // Mengambil data, diurutkan berdasarkan ID secara menurun (data terbaru di atas)
    const data = await Model.findAll({ order: [['id', 'DESC']] });
    res.status(200).json(data);
  } catch (error) {
    console.error('Error getAllData:', error);
    res.status(500).json({ success: false, message: 'Gagal mengambil data' });
  }
};

// ==========================================
// 2. CREATE (Tambah Data)
// ==========================================
exports.createData = async (req, res) => {
  try {
    const Model = getModel(req.params.tableName);
    if (!Model) return res.status(400).json({ success: false, message: 'Tabel tidak valid' });

    const newData = await Model.create(req.body);
    res.status(201).json({ success: true, message: 'Data berhasil ditambahkan', data: newData });
  } catch (error) {
    console.error('Error createData:', error);
    res.status(500).json({ success: false, message: 'Gagal menyimpan data' });
  }
};

// ==========================================
// 3. UPDATE (Edit Data)
// ==========================================
exports.updateData = async (req, res) => {
  try {
    const Model = getModel(req.params.tableName);
    if (!Model) return res.status(400).json({ success: false, message: 'Tabel tidak valid' });

    const { id } = req.params;
    const existingData = await Model.findByPk(id);
    
    if (!existingData) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    await Model.update(req.body, { where: { id } });
    res.status(200).json({ success: true, message: 'Data berhasil diperbarui' });
  } catch (error) {
    console.error('Error updateData:', error);
    res.status(500).json({ success: false, message: 'Gagal memperbarui data' });
  }
};

// ==========================================
// 4. DELETE (Hapus Data)
// ==========================================
exports.deleteData = async (req, res) => {
  try {
    const Model = getModel(req.params.tableName);
    if (!Model) return res.status(400).json({ success: false, message: 'Tabel tidak valid' });

    const { id } = req.params;
    const deletedCount = await Model.destroy({ where: { id } });

    if (deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Data tidak ditemukan' });
    }

    res.status(200).json({ success: true, message: 'Data berhasil dihapus' });
  } catch (error) {
    console.error('Error deleteData:', error);
    res.status(500).json({ success: false, message: 'Gagal menghapus data' });
  }
};