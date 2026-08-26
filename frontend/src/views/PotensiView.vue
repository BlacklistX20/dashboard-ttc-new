<template>
  <div class="p-4 bg-slate-50 min-h-screen">
    
    <!-- HEADER -->
    <div class="mb-6 flex justify-between items-end">
      <div>
        <h1 class="text-2xl font-bold text-slate-800 mb-1">Data Potensi: {{ activeCategoryName }}</h1>
        <p class="text-slate-500 text-sm">Inventaris dan status aset gedung TTC Sudiang.</p>
      </div>
      <!-- Tombol Tambah Data -->
      <button class="bg-[#ED1C24] hover:bg-red-700 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
        + Tambah Data
      </button>
    </div>

    <!-- KARTU TABEL -->
    <Card class="border-t-4 border-t-slate-800 overflow-hidden" bodyClass="p-0">
      
      <!-- Tabel Wrapper agar responsif di layar kecil -->
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th class="px-6 py-4 font-bold border-b border-slate-200">ID</th>
              <th class="px-6 py-4 font-bold border-b border-slate-200">Nama Perangkat</th>
              <th class="px-6 py-4 font-bold border-b border-slate-200">Merk / Spesifikasi</th>
              <th class="px-6 py-4 font-bold border-b border-slate-200 text-center">Jumlah</th>
              <th class="px-6 py-4 font-bold border-b border-slate-200">Lokasi / Lantai</th>
              <th class="px-6 py-4 font-bold border-b border-slate-200 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="text-sm text-slate-700 divide-y divide-slate-100">
            
            <!-- Jika tidak ada data, munculkan pesan kosong -->
            <tr v-if="currentTableData.length === 0">
              <td colspan="6" class="px-6 py-8 text-center text-slate-400 font-medium">
                Belum ada data inventaris untuk kategori ini.
              </td>
            </tr>

            <!-- Looping Baris Data -->
            <tr v-for="item in currentTableData" :key="item.id" class="hover:bg-slate-50 transition-colors">
              <td class="px-6 py-4 font-bold text-slate-500">{{ item.id }}</td>
              <td class="px-6 py-4 font-bold text-slate-800">{{ item.nama }}</td>
              <td class="px-6 py-4">{{ item.merk }}</td>
              <td class="px-6 py-4 text-center font-bold">{{ item.jumlah }}</td>
              <td class="px-6 py-4">{{ item.lokasi }}</td>
              <td class="px-6 py-4 text-center">
                <span 
                  class="px-3 py-1 text-[10px] font-bold uppercase rounded-full"
                  :class="item.status === 'Aktif' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'"
                >
                  {{ item.status }}
                </span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>

    </Card>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import Card from '@/components/Card.vue'

const route = useRoute()

// Pemetaan Nama Kategori untuk Judul
const categoryNames = {
  'power-system': 'Power System',
  'perangkat-user': 'Perangkat User',
  'cooling-system': 'Cooling System',
  'pemadam-api': 'Pemadam Api Gedung',
  'tangki-cairan': 'Tangki Cairan',
  'keamanan-gedung': 'Keamanan Gedung',
  'pencahayaan-gedung': 'Pencahayaan Gedung',
  'pompa-gedung': 'Pompa Gedung'
}

// Mengambil nama kategori dari URL (otomatis berubah jika menu diklik)
const activeCategoryName = computed(() => {
  return categoryNames[route.params.kategori] || 'Tidak Diketahui'
})

// Database Dummy Sementara untuk Simulasi
const dummyDatabase = {
  'power-system': [
    { id: 'PWR-001', nama: 'Transformator 1', merk: 'Schneider 1000kVA', jumlah: 1, lokasi: 'Lantai 1', status: 'Aktif' },
    { id: 'PWR-002', nama: 'Genset Utama', merk: 'Caterpillar 1500kVA', jumlah: 2, lokasi: 'Lantai 1', status: 'Aktif' },
    { id: 'PWR-003', nama: 'UPS Sistem', merk: 'Liebert 100kVA', jumlah: 4, lokasi: 'Lantai 2', status: 'Aktif' }
  ],
  'cooling-system': [
    { id: 'PAC-001', nama: 'PAC Unit 1', merk: 'Liebert PEX 3', jumlah: 2, lokasi: 'Lantai 2', status: 'Aktif' },
    { id: 'PAC-002', nama: 'PAC Unit 2', merk: 'Liebert PEX 3', jumlah: 2, lokasi: 'Lantai 3', status: 'Maintenance' }
  ],
  'pompa-gedung': [
    { id: 'PMP-001', nama: 'Pompa Air Bersih', merk: 'Grundfos', jumlah: 2, lokasi: 'Ground Floor', status: 'Aktif' },
    { id: 'PMP-002', nama: 'Pompa Hydrant', merk: 'Ebara', jumlah: 1, lokasi: 'Ground Floor', status: 'Aktif' }
  ]
}

// Menarik data berdasarkan kategori yang sedang aktif
const currentTableData = computed(() => {
  return dummyDatabase[route.params.kategori] || []
})
</script>