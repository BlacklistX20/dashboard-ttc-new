<template>
  <div class="p-4 bg-slate-300 min-h-screen relative">

    <ConnectionNotif ref="notifRef" />
    
    <!-- HEADER & TAB NAVIGATION + KONTROL -->
    <div class="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-800 mb-1">Monitoring Suhu Ruangan</h1>
        <p class="text-slate-500 text-xs">Pemantauan suhu ruangan per lantai di gedung TTC Sudiang.</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- TAB BUTTONS -->
        <div class="flex space-x-1 bg-slate-200/60 p-1 rounded-xl">
          <button 
            v-for="tab in tabs" :key="tab.id"
            @click="activeTab = tab.id"
            class="py-2 px-3 text-sm font-semibold rounded-lg transition-all"
            :class="activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- TOMBOL DOWNLOAD DATA -->
        <button 
          @click="isDownloadModalOpen = true"
          class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
        >
          <Download class="w-4 h-4" />
          <span class="hidden sm:inline">Download Data</span>
        </button>
      </div>
    </div>

    <!-- KONTEN TAB (Grid Kartu Suhu) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in">
      
      <!-- Looping data ruangan berdasarkan tab yang aktif -->
      <Card 
        v-for="(room, index) in roomData[activeTab]" 
        :key="index" 
        :title="room.name"
        bodyClass="p-4"
        class="border-t-4 transition-all relative"
        :class="[getTempStatus(room.avgTemp).borderClass, getTempStatus(room.avgTemp).cardBg]"
      >
        <!-- BADGE: Muncul jika koneksi ke modul suhu ruangan ini terputus (status != 'C') -->
        <div 
          v-if="!room.isConnected"
          class="absolute top-2 right-2 flex items-center gap-1 bg-red-600 text-white text-[9px] font-bold px-2 py-1 rounded-full shadow z-10"
        >
          <WifiOff class="w-3 h-3" />
          <span>TERPUTUS</span>
        </div>

        <!-- BODY KARTU: Menampilkan Rata-Rata Suhu -->
        <div class="flex flex-col items-center justify-center py-4">
          <p class="font-extrabold mb-1" :class="[apiError || room.avgTemp === null ? 'text-2xl italic mt-3' : 'text-5xl', getTempStatus(room.avgTemp).textClass]">
            {{ apiError ? 'Offline' : (room.avgTemp !== null ? room.avgTemp : 'No Data') }}
            <span v-if="!apiError && room.avgTemp !== null" class="text-2xl font-bold opacity-60 ml-1">°C</span>
          </p>
          
          <!-- Label Status (Dingin, Normal, Hangat, Panas, dll) -->
          <span 
            class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 border"
            :class="[getTempStatus(room.avgTemp).badgeBg, getTempStatus(room.avgTemp).badgeText, getTempStatus(room.avgTemp).badgeBorder]"
          >
            {{ getTempStatus(room.avgTemp).label }}
          </span>
        </div>

        <!-- FOOTER KARTU: Tgl Update & Tombol Detail -->
        <template #footer>
          <div class="flex justify-between items-center w-full">
            <span class="text-[10px] text-slate-400 font-medium">{{ lastUpdated }}</span>
            <button 
              @click="openModal(room)"
              class="text-white text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors shadow-sm"
              :class="getTempStatus(room.avgTemp).btnClass"
            >
              Detail
            </button>
          </div>
        </template>
      </Card>

    </div>

    <!-- ================= MODAL / WINDOW POP-UP DETAIL ================= -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
      
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-zoom-in">
        
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 class="text-lg font-bold text-slate-800">{{ selectedRoom.name }}</h2>
            <p class="text-xs text-slate-500">Detail Pembacaan Sensor</p>
          </div>
          <button @click="closeModal" class="p-1.5 bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Modal (Daftar Sensor Suhu) -->
        <div class="p-5 max-h-[60vh] overflow-y-auto">
          <div class="flex flex-col gap-3">
            <div 
              v-for="(sensor, idx) in selectedRoom.sensors" 
              :key="idx"
              class="flex justify-between items-center p-3 rounded-xl border-l-4"
              :class="[getTempStatus(sensor.temp).cardBg, getTempStatus(sensor.temp).borderClass]"
            >
              <div class="flex items-center gap-3">
                <Thermometer class="w-5 h-5" :class="getTempStatus(sensor.temp).textClass" />
                <span class="font-medium text-slate-700 text-sm">{{ sensor.name }}</span>
              </div>
              <div class="font-bold" :class="[apiError || sensor.temp === null ? 'text-sm italic' : 'text-lg', getTempStatus(sensor.temp).textClass]">
                {{ apiError ? 'Offline' : (sensor.temp !== null ? sensor.temp : 'No Data') }}
                <span v-if="!apiError && sensor.temp !== null" class="text-sm opacity-60 ml-1">°C</span>
              </div>
            </div>
          </div>
        </div>

        <div class="px-5 py-3 border-t border-slate-100 bg-slate-50 text-right">
          <button @click="closeModal" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
            Tutup
          </button>
        </div>

      </div>
    </div>

    <!-- ================= MODAL DOWNLOAD ================= -->
    <div v-if="isDownloadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isDownloadModalOpen = false"></div>
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-zoom-in">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 class="text-base font-bold text-slate-800">Download Data Suhu</h2>
            <p class="text-xs text-slate-500">Pilih ruangan, format, dan rentang tanggal</p>
          </div>
          <button @click="isDownloadModalOpen = false" class="p-1.5 bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"><X class="w-4 h-4" /></button>
        </div>
        <form @submit.prevent="handleDownload" class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Pilih Ruangan</label>
            <select v-model="downloadForm.room" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500">
              <optgroup v-for="grp in roomOptions" :key="grp.floor" :label="grp.floor">
                <option v-for="r in grp.rooms" :key="r.key" :value="r.key">{{ r.label }}</option>
              </optgroup>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Format File</label>
            <select v-model="downloadForm.format" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500">
              <option v-for="opt in formatOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
            </select>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="block text-xs font-bold text-slate-600 mb-1">Start Date</label><input v-model="downloadForm.startDate" type="date" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500"></div>
            <div><label class="block text-xs font-bold text-slate-600 mb-1">End Date</label><input v-model="downloadForm.endDate" type="date" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500"></div>
          </div>
          <div class="mt-4 flex justify-end gap-2">
            <button type="button" @click="isDownloadModalOpen = false" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg">Batal</button>
            <button type="submit" :disabled="isDownloading" class="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow">
              <Loader2 v-if="isDownloading" class="w-4 h-4 animate-spin" />
              <span>{{ isDownloading ? 'Mengunduh...' : 'Unduh File' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Card from '@/components/Card.vue'
import ConnectionNotif from '@/components/ConnectionNotif.vue'
import api from '@/services/api'
import { X, Thermometer, Download, Loader2, WifiOff } from '@lucide/vue'

const apiError = ref(false)
const notifRef = ref(null)

// --- LOGIKA STATUS WARNA (CORE LOGIC) ---
const getTempStatus = (temp) => {
  if (apiError.value) {
    return { label: 'OFFLINE', textClass: 'text-slate-400', borderClass: 'border-t-slate-400', cardBg: 'bg-slate-50/50 border-slate-200', badgeBg: 'bg-slate-200', badgeText: 'text-slate-600', badgeBorder: 'border-slate-300', btnClass: 'bg-slate-400 hover:bg-slate-500' }
  } else if (temp === null) {
    return { label: 'NO DATA', textClass: 'text-slate-400', borderClass: 'border-t-slate-300', cardBg: 'bg-slate-50/50 border-slate-200', badgeBg: 'bg-slate-100', badgeText: 'text-slate-500', badgeBorder: 'border-slate-200', btnClass: 'bg-slate-400 hover:bg-slate-500' }
  } else if (temp <= 18) {
    return { label: 'DINGIN', textClass: 'text-blue-600', borderClass: 'border-t-blue-500', cardBg: 'bg-blue-50/30 border-blue-100', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', badgeBorder: 'border-blue-200', btnClass: 'bg-blue-600 hover:bg-blue-700' }
  } else if (temp > 18 && temp <= 24) {
    return { label: 'NORMAL', textClass: 'text-emerald-600', borderClass: 'border-t-emerald-500', cardBg: 'bg-emerald-50/30 border-emerald-100', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200', btnClass: 'bg-emerald-600 hover:bg-emerald-700' }
  } else if (temp > 24 && temp <= 29) {
    return { label: 'HANGAT', textClass: 'text-amber-500', borderClass: 'border-t-amber-400', cardBg: 'bg-amber-50/30 border-amber-100', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200', btnClass: 'bg-amber-500 hover:bg-amber-600' }
  } else {
    return { label: 'PANAS / BAHAYA', textClass: 'text-red-600', borderClass: 'border-t-red-500', cardBg: 'bg-red-50/30 border-red-100', badgeBg: 'bg-red-100', badgeText: 'text-red-700', badgeBorder: 'border-red-200', btnClass: 'bg-red-600 hover:bg-red-700' }
  }
}

// --- KONTROL TAB ---
const activeTab = ref('lt1')
const tabs = ref([
  { id: 'lt1', label: 'Lantai 1' },
  { id: 'lt2', label: 'Lantai 2' },
  { id: 'lt3', label: 'Lantai 3' },
  { id: 'lt4', label: 'Lantai 4' },
  { id: 'lt5', label: 'Lantai 5' }
])

const isModalOpen = ref(false)
const selectedRoom = ref(null)

const openModal = (room) => {
  selectedRoom.value = room
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => { selectedRoom.value = null }, 200) 
}

// --- WAKTU UPDATE ---
const lastUpdated = ref('')
let timer = null
const updateTime = () => {
  const now = new Date()
  const pad = (num) => num.toString().padStart(2, '0')
  lastUpdated.value = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

// --- INISIALISASI STRUKTUR DATA BAWAAN (FALLBACK DENGAN NULL) ---
const defaultRooms = {
  lt1: ['Ruang Trafo', 'Ruang Genset'],
  lt2: ['Ruang Baterai', 'Ruang Recti', 'Ruang MSC', 'Ruang CSPS'],
  lt3: ['Ruang Baterai', 'Ruang Recti', 'Ruang INVAS', 'Ruang Core', 'Ruang MKios', 'Ruang OCS'],
  lt4: ['Ruang Baterai', 'Ruang Recti', 'Ruang BSS', 'Ruang Interkoneksi', 'Ruang Transmisi'],
  lt5: ['Ruang Utility A', 'Ruang Utility B', 'Ruang Data Center', 'Ruang Pengembangan', 'Ruang Containment']
}

const getDefaultRoomData = () => {
  const data = {}
  for (const [floor, rooms] of Object.entries(defaultRooms)) {
    data[floor] = rooms.map(name => ({
      name,
      avgTemp: null,
      avgHum: null,
      isConnected: false, 
      sensors: [{ name: 'Sensor 1', temp: null }, { name: 'Sensor 2', temp: null }]
    }))
  }
  return data
}

// Mengisi data bawaan agar kartu tetap ter-render saat awal halaman dimuat
const roomData = ref(getDefaultRoomData())

// --- FETCH DATA API ---
const fetchRealtime = async () => {
  try {
    const res = await api.get('/suhu')
    if (apiError.value) {
      apiError.value = false
      notifRef.value?.showSuccess('Koneksi Tersambung Kembali', 'Data suhu berhasil dimuat ulang.')
    }
    roomData.value = res.data
  } catch (err) {
    handleApiError()
  }
}

// --- LOGIKA ERROR ---
const handleApiError = () => {
  if (!apiError.value) {
    apiError.value = true
    notifRef.value?.showError('Koneksi Backend Terputus!', 'Gagal mengambil data. Menampilkan status offline...')
  }

  Object.keys(roomData.value).forEach(floor => {
    roomData.value[floor] = roomData.value[floor].map(room => ({
      ...room,
      avgTemp: null,
      avgHum: null,
      isConnected: false,
      sensors: room.sensors.map(s => ({ ...s, temp: null }))
    }))
  })
}

// --- LOGIKA MODAL DOWNLOAD ---
const isDownloadModalOpen = ref(false)
const isDownloading = ref(false)
const formatOptions = [
  { value: 'excel', label: 'Excel (.xlsx)' },
  { value: 'pdf', label: 'PDF (.pdf)' }
]

const roomOptions = [
  { floor: 'Lantai 1', rooms: [ { key: 'trafo', label: 'Ruang Trafo' }, { key: 'genset', label: 'Ruang Genset' } ]},
  { floor: 'Lantai 2', rooms: [ { key: 'battery2', label: 'Ruang Baterai' }, { key: 'recti2', label: 'Ruang Recti' }, { key: 'msc2', label: 'Ruang MSC' }, { key: 'csps2', label: 'Ruang CSPS' } ]},
  { floor: 'Lantai 3', rooms: [ { key: 'battery3', label: 'Ruang Baterai' }, { key: 'recti3', label: 'Ruang Recti' }, { key: 'invas3', label: 'Ruang INVAS' }, { key: 'core3', label: 'Ruang Core' }, { key: 'mkios3', label: 'Ruang MKios' }, { key: 'ocs3', label: 'Ruang OCS' } ]},
  { floor: 'Lantai 4', rooms: [ { key: 'battery4', label: 'Ruang Baterai' }, { key: 'recti4', label: 'Ruang Recti' }, { key: 'bss4', label: 'Ruang BSS' }, { key: 'interkoneksi4', label: 'Ruang Interkoneksi' }, { key: 'transmisi4', label: 'Ruang Transmisi' } ]},
  { floor: 'Lantai 5', rooms: [ { key: 'utilityA5', label: 'Ruang Utility A' }, { key: 'utilityB5', label: 'Ruang Utility B' }, { key: 'dataCenter5', label: 'Ruang Data Center' }, { key: 'pengembangan5', label: 'Ruang Pengembangan' }, { key: 'containment5', label: 'Ruang Containment' } ]}
]
const downloadForm = ref({ room: 'trafo', format: 'excel', startDate: '', endDate: '' })

const handleDownload = async () => {
  isDownloading.value = true
  try {
    const response = await api.get('/suhu/export', { params: downloadForm.value, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const ext = downloadForm.value.format === 'pdf' ? 'pdf' : 'xlsx'
    link.setAttribute('download', `Suhu_${downloadForm.value.room}_${downloadForm.value.startDate}_${downloadForm.value.endDate}.${ext}`)
    document.body.appendChild(link); link.click(); link.remove()
    isDownloadModalOpen.value = false
  } catch (error) {
    alert('Gagal menghubungi server untuk download. Pastikan backend aktif.')
  } finally {
    isDownloading.value = false
  }
}

onMounted(() => {
  updateTime()
  fetchRealtime()
  timer = setInterval(() => {
    updateTime()
    fetchRealtime()
  }, 1000) // Catatan: Polling 1 detik mungkin memberatkan server jika banyak user
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.animate-zoom-in { animation: zoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>