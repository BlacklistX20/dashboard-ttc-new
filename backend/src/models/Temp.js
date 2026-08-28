const { DataTypes } = require('sequelize');
const { dbTemp } = require('../config/database');

// =========================================================================
// 1. FUNGSI GENERATOR ATRIBUT SENSOR (Untuk menghemat ratusan baris kode)
// =========================================================================
const generateSensorAttributes = (sensorCount) => {
  const attributes = {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    t_avg: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
    h_avg: { type: DataTypes.DECIMAL(15, 2), allowNull: false }
  };

  // Looping untuk membuat kolom t1, h1, t2, h2, ... dst secara otomatis
  for (let i = 1; i <= sensorCount; i++) {
    attributes[`t${i}`] = { type: DataTypes.DECIMAL(15, 2), allowNull: false };
    attributes[`h${i}`] = { type: DataTypes.DECIMAL(15, 2), allowNull: false };
  }

  return attributes;
};

// Pengaturan standar untuk memetakan nama tabel & waktu 'updated_at'
const standardOptions = (tableName) => ({
  tableName: tableName,
  timestamps: true,
  createdAt: false,
  updatedAt: 'updated_at'
});


// =========================================================================
// 2. MODEL RUANGAN DENGAN 2 SENSOR
// =========================================================================
const attr2Sensors = generateSensorAttributes(2);
const Battery2 = dbTemp.define('Battery2', attr2Sensors, standardOptions('battery2'));
const Battery3 = dbTemp.define('Battery3', attr2Sensors, standardOptions('battery3'));
const Battery4 = dbTemp.define('Battery4', attr2Sensors, standardOptions('battery4'));
const Containment5 = dbTemp.define('Containment5', attr2Sensors, standardOptions('containment5'));
const Genset = dbTemp.define('Genset', attr2Sensors, standardOptions('genset'));
const Mkios3 = dbTemp.define('Mkios3', attr2Sensors, standardOptions('mkios3'));
const Ocs3 = dbTemp.define('Ocs3', attr2Sensors, standardOptions('ocs3'));
const Pengembangan5 = dbTemp.define('Pengembangan5', attr2Sensors, standardOptions('pengembangan5'));
const UtilityA5 = dbTemp.define('UtilityA5', attr2Sensors, standardOptions('utility_a5'));
const UtilityB5 = dbTemp.define('UtilityB5', attr2Sensors, standardOptions('utility_b5'));


// =========================================================================
// 3. MODEL RUANGAN DENGAN 3 SENSOR
// =========================================================================
const attr3Sensors = generateSensorAttributes(3);
const Recti2 = dbTemp.define('Recti2', attr3Sensors, standardOptions('recti2'));
const Recti3 = dbTemp.define('Recti3', attr3Sensors, standardOptions('recti3'));
const Recti4 = dbTemp.define('Recti4', attr3Sensors, standardOptions('recti4'));
const Trafo = dbTemp.define('Trafo', attr3Sensors, standardOptions('trafo'));


// =========================================================================
// 4. MODEL RUANGAN DENGAN 4 SENSOR
// =========================================================================
const attr4Sensors = generateSensorAttributes(4);
const Bss4 = dbTemp.define('Bss4', attr4Sensors, standardOptions('bss4'));
const Core3 = dbTemp.define('Core3', attr4Sensors, standardOptions('core3'));
const Csps2 = dbTemp.define('Csps2', attr4Sensors, standardOptions('csps2'));
const Interkoneksi4 = dbTemp.define('Interkoneksi4', attr4Sensors, standardOptions('interkoneksi4'));


// =========================================================================
// 5. MODEL RUANGAN DENGAN 6 SENSOR
// =========================================================================
const attr6Sensors = generateSensorAttributes(6);
const DataCenter5 = dbTemp.define('DataCenter5', attr6Sensors, standardOptions('data_center5'));
const Invas3 = dbTemp.define('Invas3', attr6Sensors, standardOptions('invas3'));
const Msc2 = dbTemp.define('Msc2', attr6Sensors, standardOptions('msc2'));
const Transmisi4 = dbTemp.define('Transmisi4', attr6Sensors, standardOptions('transmisi4'));


// =========================================================================
// 6. MODEL KHUSUS: TABEL 'per_second' (Struktur Berbeda)
// =========================================================================
const TempPerSecond = dbTemp.define('TempPerSecond', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING(15), allowNull: false },
  temp: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  hum: { type: DataTypes.DECIMAL(15, 2), allowNull: false },
  status: { type: DataTypes.STRING(1), allowNull: false }
}, {
  tableName: 'per_second',
  timestamps: true,
  createdAt: false,
  updatedAt: 'last_update' // Menggunakan last_update sesuai SQL
});


// =========================================================================
// EXPORT SEMUA MODEL UNTUK DIGUNAKAN DI CONTROLLER
// =========================================================================
module.exports = {
  // 2 Sensors
  Battery2, Battery3, Battery4, Containment5, Genset, Mkios3, Ocs3, Pengembangan5, UtilityA5, UtilityB5,
  // 3 Sensors
  Recti2, Recti3, Recti4, Trafo,
  // 4 Sensors
  Bss4, Core3, Csps2, Interkoneksi4,
  // 6 Sensors
  DataCenter5, Invas3, Msc2, Transmisi4,
  // Others
  TempPerSecond
};