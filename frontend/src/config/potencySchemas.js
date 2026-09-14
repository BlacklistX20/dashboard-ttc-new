// Opsi Standar Dropdown
const conditionOptions = [
  { label: 'Baik', value: 'Baik' }, 
  { label: 'Rusak', value: 'Rusak' },
  { label: 'Perbaikan', value: 'Perbaikan' }
];

const statusOptions = [
  { label: 'Aktif / ON', value: 'ON' }, 
  { label: 'Maintenance', value: 'MNT' }, 
  { label: 'Mati / OFF', value: 'OFF' },
  { label: 'Standby', value: 'STB' }
];

// Opsi Kategori Standar (Bisa disesuaikan jika ingin dilimit)
const categoryOptions = [
  { label: 'Utama', value: 'Utama' },
  { label: 'Cadangan', value: 'Cadangan' },
  { label: 'Umum', value: 'Umum' }
];

export const potencySchemas = {
  // 1. POWER SYSTEM (Tabel: PowerAsset / power)
  'power-system': {
    tableName: 'power',
    title: 'Power System (Kelistrikan)',
    fields: [
      { key: 'name', label: 'Nama Perangkat', type: 'text', inTable: true },
      { key: 'sn', label: 'Serial Number', type: 'text', inTable: true },
      { key: 'barcode', label: 'Barcode', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'category', label: 'Kategori', type: 'text', inTable: true },
      { key: 'brand', label: 'Merk / Brand', type: 'text', inTable: true },
      { key: 'type', label: 'Tipe', type: 'text', inTable: true },
      { key: 'condition', label: 'Kondisi Fisik', type: 'select', options: conditionOptions, inTable: true },
      // Detail Only
      { key: 'status', label: 'Status', type: 'select', options: statusOptions, inTable: false },
      { key: 'capacity', label: 'Kapasitas', type: 'number', inTable: false },
      { key: 'vendor', label: 'Vendor', type: 'text', inTable: false },
      { key: 'modul', label: 'Jumlah Modul', type: 'number', inTable: false },
      { key: 'modul_capacity', label: 'Kapasitas Modul', type: 'number', inTable: false },
      { key: 'occupancy', label: 'Okupansi (%)', type: 'number', inTable: false },
      { key: 'aging', label: 'Aging', type: 'text', inTable: false },
      { key: 'battery', label: 'Tipe Baterai', type: 'text', inTable: false },
      { key: 'battery_qty', label: 'Jumlah Baterai', type: 'number', inTable: false },
      { key: 'source_a', label: 'Source A', type: 'text', inTable: false },
      { key: 'source_b', label: 'Source B', type: 'text', inTable: false },
      { key: 'install', label: 'Waktu Install', type: 'text', inTable: false },
      { key: 'maintanance', label: 'Maintenance Terakhir', type: 'text', inTable: false },
      { key: 'info', label: 'Keterangan Tambahan', type: 'text', inTable: false }
    ]
  },

  // 2. COOLING SYSTEM (Tabel: Cool / cool)
  'cooling-system': {
    tableName: 'cool',
    title: 'Cooling System (PAC & AC)',
    fields: [
      { key: 'name', label: 'Nama Perangkat', type: 'text', inTable: true },
      { key: 'barcode', label: 'Barcode', type: 'text', inTable: true },
      { key: 'brand', label: 'Merk / Brand', type: 'text', inTable: true },
      { key: 'type', label: 'Tipe', type: 'text', inTable: true },
      { key: 'category', label: 'Kategori', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'status', label: 'Status', type: 'select', options: statusOptions, inTable: true },
      { key: 'condition', label: 'Kondisi Fisik', type: 'select', options: conditionOptions, inTable: true },
      { key: 'info', label: 'Info Tambahan', type: 'text', inTable: true },
      // Detail Only
      { key: 'capacity', label: 'Kapasitas', type: 'number', inTable: false },
      { key: 'vendor', label: 'Vendor', type: 'text', inTable: false },
      { key: 'compressor', label: 'Kompresor', type: 'text', inTable: false },
      { key: 'flow', label: 'Arah Flow', type: 'text', inTable: false },
      { key: 'aging', label: 'Aging', type: 'text', inTable: false },
      { key: 'install', label: 'Waktu Install', type: 'text', inTable: false },
      { key: 'maintanance', label: 'Maintenance Terakhir', type: 'text', inTable: false }
    ]
  },

  // 3. PERANGKAT USER (Tabel: Rack / rack)
  'perangkat-user': {
    tableName: 'rack',
    title: 'Perangkat User (Rack Data Center)',
    fields: [
      { key: 'name', label: 'Nama Rak', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'category', label: 'Kategori', type: 'text', inTable: true },
      { key: 'status', label: 'Status', type: 'select', options: statusOptions, inTable: true },
      { key: 'barcode', label: 'Barcode', type: 'text', inTable: true },
      { key: 'source_a', label: 'Power Source A', type: 'text', inTable: true },
      { key: 'source_b', label: 'Power Source B', type: 'text', inTable: true },
      { key: 'info', label: 'Info Tambahan', type: 'text', inTable: true }
    ]
  },

  // 4. PEMADAM API (Tabel: Fire / fire)
  'pemadam-api': {
    tableName: 'fire',
    title: 'Sistem Pemadam Api (Fire Extinguisher)',
    fields: [
      { key: 'name', label: 'Nama Perangkat', type: 'text', inTable: true },
      { key: 'barcode', label: 'Barcode', type: 'text', inTable: true },
      { key: 'brand', label: 'Merk / Brand', type: 'text', inTable: true },
      { key: 'type', label: 'Tipe', type: 'text', inTable: true },
      { key: 'category', label: 'Kategori', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'condition', label: 'Kondisi', type: 'select', options: conditionOptions, inTable: true },
      { key: 'info', label: 'Info Tambahan', type: 'text', inTable: true },
      // Detail Only
      { key: 'quantity', label: 'Jumlah', type: 'number', inTable: true },
      { key: 'vendor', label: 'Vendor', type: 'text', inTable: false },
      { key: 'install', label: 'Tahun Install', type: 'number', inTable: false },
      { key: 'maintanance', label: 'Maintenance Terakhir', type: 'text', inTable: false }
    ]
  },

  // 5. TANGKI CAIRAN (Tabel: Tank / tank)
  'tangki-cairan': {
    tableName: 'tank',
    title: 'Tangki Cairan (BBM / Air)',
    fields: [
      { key: 'name', label: 'Nama Tangki', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'capacity', label: 'Kapasitas (L)', type: 'number', inTable: true },
      { key: 'refil', label: 'Tgl Pengisian Terakhir', type: 'date', inTable: true },
      { key: 'condition', label: 'Kondisi', type: 'select', options: conditionOptions, inTable: true },
      { key: 'info', label: 'Info Tambahan', type: 'text', inTable: true }
    ]
  },

  // 6. KEAMANAN GEDUNG (Tabel: Security / security)
  'keamanan-gedung': {
    tableName: 'security',
    title: 'Keamanan Gedung (CCTV / Akses)',
    fields: [
      { key: 'type', label: 'Tipe / Jenis', type: 'text', inTable: true },
      { key: 'brand', label: 'Merk / Brand', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'quantity', label: 'Jumlah', type: 'number', inTable: true },
      { key: 'vendor', label: 'Vendor', type: 'text', inTable: true },
      { key: 'status', label: 'Status', type: 'select', options: statusOptions, inTable: true },
      { key: 'condition', label: 'Kondisi Fisik', type: 'select', options: conditionOptions, inTable: true },
      { key: 'install', label: 'Tahun Install', type: 'number', inTable: true },
      { key: 'maintanance', label: 'Maintenance Terakhir', type: 'text', inTable: true },
      { key: 'info', label: 'Info Tambahan', type: 'text', inTable: true }
    ]
  },

  // 7. PENCAHAYAAN GEDUNG (Tabel: Light / light)
  'pencahayaan-gedung': {
    tableName: 'light',
    title: 'Pencahayaan Gedung (Lampu)',
    fields: [
      { key: 'type', label: 'Tipe Lampu', type: 'text', inTable: true },
      { key: 'brand', label: 'Merk / Brand', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'watt', label: 'Daya (Watt)', type: 'number', inTable: true },
      { key: 'quantity', label: 'Jumlah', type: 'number', inTable: true },
      { key: 'condition', label: 'Kondisi', type: 'select', options: conditionOptions, inTable: true },
      { key: 'info', label: 'Info Tambahan', type: 'text', inTable: true }
    ]
  },

  // 8. POMPA GEDUNG (Tabel: Pump / pump)
  'pompa-gedung': {
    tableName: 'pump',
    title: 'Sistem Pompa Gedung',
    fields: [
      { key: 'name', label: 'Nama Pompa', type: 'text', inTable: true },
      { key: 'brand', label: 'Merk / Brand', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'type', label: 'Tipe', type: 'text', inTable: true },
      { key: 'condition', label: 'Kondisi', type: 'select', options: conditionOptions, inTable: true },
      { key: 'vendor', label: 'Vendor', type: 'text', inTable: true },
      { key: 'install', label: 'Tahun Install', type: 'number', inTable: true },
      { key: 'info', label: 'Info Tambahan', type: 'text', inTable: true }
    ]
  },

  // 9. FURNITURE (Tabel: Furniture / furniture)
  'furniture': {
    tableName: 'furniture',
    title: 'Aset Furniture',
    fields: [
      { key: 'name', label: 'Nama Furniture', type: 'text', inTable: true },
      { key: 'brand', label: 'Merk / Brand', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'kondisi', label: 'Kondisi', type: 'select', options: conditionOptions, inTable: true },
      // Detail Only
      { key: 'category', label: 'Kategori', type: 'text', inTable: false },
      { key: 'vendor', label: 'Vendor', type: 'text', inTable: false },
      { key: 'type', label: 'Tipe / Spesifikasi', type: 'text', inTable: false },
      { key: 'install', label: 'Tanggal Pembelian', type: 'date', inTable: false },
      { key: 'maintanance', label: 'Maintenance', type: 'text', inTable: false },
      { key: 'ket', label: 'Keterangan (Info)', type: 'text', inTable: false }
    ]
  },

  // 10. FINISHING (Tabel: Finishing / finishing)
  'finishing': {
    tableName: 'finishing',
    title: 'Pekerjaan Finishing (Interior/Sipil)',
    fields: [
      { key: 'ne_id', label: 'NE ID', type: 'text', inTable: true },
      { key: 'name', label: 'Nama Pekerjaan', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'kondisi', label: 'Kondisi', type: 'select', options: conditionOptions, inTable: true },
      // Detail Only
      { key: 'category', label: 'Kategori', type: 'text', inTable: false },
      { key: 'vendor', label: 'Vendor', type: 'text', inTable: false },
      { key: 'brand', label: 'Merk Material', type: 'text', inTable: false },
      { key: 'type', label: 'Tipe', type: 'text', inTable: false },
      { key: 'install', label: 'Tanggal Pengerjaan', type: 'date', inTable: false },
      { key: 'maintanance', label: 'Maintenance Terakhir', type: 'text', inTable: false },
      { key: 'ket', label: 'Keterangan', type: 'text', inTable: false }
    ]
  },

  // 11. SAFETY (Tabel: Safety / safety)
  'safety': {
    tableName: 'safety',
    title: 'Aset Safety (K3)',
    fields: [
      { key: 'ne_id', label: 'NE ID', type: 'text', inTable: true },
      { key: 'name', label: 'Nama Alat Safety', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan', type: 'text', inTable: true },
      { key: 'kondisi', label: 'Kondisi', type: 'select', options: conditionOptions, inTable: true },
      // Detail Only
      { key: 'category', label: 'Kategori', type: 'text', inTable: false },
      { key: 'vendor', label: 'Vendor', type: 'text', inTable: false },
      { key: 'brand', label: 'Merk', type: 'text', inTable: false },
      { key: 'type', label: 'Tipe', type: 'text', inTable: false },
      { key: 'install', label: 'Tanggal Tersedia', type: 'date', inTable: false },
      { key: 'maintanance', label: 'Maintenance', type: 'text', inTable: false },
      { key: 'ket', label: 'Keterangan', type: 'text', inTable: false }
    ]
  },

  // 12. TRANSPORT (Tabel: Transport / transport)
  'transport': {
    tableName: 'transport',
    title: 'Aset Transport & Lift',
    fields: [
      { key: 'ne_id', label: 'NE ID', type: 'text', inTable: true },
      { key: 'name', label: 'Nama Kendaraan/Alat', type: 'text', inTable: true },
      { key: 'floor', label: 'Lantai', type: 'text', inTable: true },
      { key: 'room', label: 'Ruangan/Area', type: 'text', inTable: true },
      { key: 'kondisi', label: 'Kondisi', type: 'select', options: conditionOptions, inTable: true },
      // Detail Only
      { key: 'category', label: 'Kategori', type: 'text', inTable: false },
      { key: 'vendor', label: 'Vendor', type: 'text', inTable: false },
      { key: 'brand', label: 'Merk', type: 'text', inTable: false },
      { key: 'type', label: 'Tipe', type: 'text', inTable: false },
      { key: 'install', label: 'Tanggal Serah Terima', type: 'date', inTable: false },
      { key: 'maintanance', label: 'Maintenance', type: 'text', inTable: false },
      { key: 'ket', label: 'Keterangan', type: 'text', inTable: false }
    ]
  }
};