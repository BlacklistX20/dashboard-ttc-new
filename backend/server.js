require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { dbFuel, dbPotency, dbPower, dbTemp, dbGas } = require('./src/config/database');

const dashboardRoutes = require('./src/routes/dashboardRoutes');
const kelistrikanRoutes = require('./src/routes/kelistrikanRoutes');
const suhuRoutes = require('./src/routes/SuhuRoutes');
const tangkiRoutes = require('./src/routes/tangkiRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Tes Koneksi ke 4 Database
const testConnections = async () => {
  try {
    await dbFuel.authenticate();
    await dbPotency.authenticate();
    await dbPower.authenticate();
    await dbTemp.authenticate();
    await dbGas.authenticate();
    console.log('✅ Berhasil terhubung ke 5 Database (Fuel, Potency, Power, Temp, Gas)!');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error);
  }
};
testConnections();

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/kelistrikan', kelistrikanRoutes);
app.use('/api/suhu', suhuRoutes);
app.use('/api/tangki', tangkiRoutes);

// ==========================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});