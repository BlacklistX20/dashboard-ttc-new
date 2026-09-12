require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { dbFuel, dbPotency, dbPower, dbTemp, dbGas, dbControl } = require('./src/config/database');

const dashboardRoutes = require('./src/routes/DashboardRoutes');
const kelistrikanRoutes = require('./src/routes/KelistrikanRoutes');
const suhuRoutes = require('./src/routes/SuhuRoutes');
const tangkiRoutes = require('./src/routes/TangkiRoutes');
const gasRoutes = require('./src/routes/GasRoutes'); 
const valveRoutes = require('./src/routes/ValveRoutes');
const pacRoutes = require('./src/routes/PacRoutes');

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
    await dbControl.authenticate();
    console.log('✅ Berhasil terhubung ke 5 Database (Fuel, Potency, Power, Temp, Gas)!');

    // Tambahkan sinkronisasi tabel di sini (tanpa force: true agar data tidak hilang)
    await dbFuel.sync();
    await dbPotency.sync();
    await dbPower.sync();
    await dbTemp.sync();
    await dbGas.sync();
    await dbControl.sync();
    console.log('✅ Sinkronisasi semua tabel berhasil!');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error);
  }
};
testConnections();

app.use('/api/dashboard', dashboardRoutes);
app.use('/api/kelistrikan', kelistrikanRoutes);
app.use('/api/suhu', suhuRoutes);
app.use('/api/tangki', tangkiRoutes);
app.use('/api/gas', gasRoutes);
app.use('/api/valve', valveRoutes);
app.use('/api/pac', pacRoutes);

// ==========================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});