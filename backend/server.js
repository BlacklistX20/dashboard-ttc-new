const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { dbFuel, dbPotency, dbPower, dbTemp } = require('./src/config/database');

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
    console.log('✅ Berhasil terhubung ke 4 Database (Fuel, Potency, Power, Temp)!');
  } catch (error) {
    console.error('❌ Gagal terhubung ke database:', error);
  }
};

testConnections();

app.get('/', (req, res) => {
  res.send('TTC Sudiang Backend API is Running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server berjalan di http://localhost:${PORT}`);
});