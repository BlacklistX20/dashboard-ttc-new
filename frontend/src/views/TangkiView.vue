<template>
  <div class="p-4 bg-slate-50 min-h-screen relative">
    
    <!-- NOTIFIKASI KONEKSI -->
    <ConnectionNotif ref="notifRef" />

    <!-- HEADER & TOMBOL DOWNLOAD -->
    <div class="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-800 mb-1">Monitoring Tangki BBM</h1>
        <p class="text-slate-500 text-xs">Status dan kapasitas bahan bakar minyak TTC Sudiang secara realtime.</p>
      </div>
      
      <button 
        @click="isDownloadModalOpen = true"
        class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm w-fit"
      >
        <Download class="w-4 h-4" />
        <span class="hidden sm:inline">Download Data</span>
      </button>
    </div>

    <!-- 1 BARIS (KARTU TANGKI HARIAN & BULANAN) -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      
      <!-- ================= KARTU TANGKI HARIAN (2 Kolom) ================= -->
      <Card title="Kapasitas Tangki Harian" class="lg:col-span-2" bodyClass="p-3">
        <div class="grid grid-cols-2 gap-2 h-full">
          <div v-for="(tank, index) in tanksHarian" :key="index" class="flex flex-col items-center">
            <div class="text-center mb-3 w-full">
              <h3 class="text-base font-bold text-slate-800 mb-1">{{ tank.name }}</h3>
              <div class="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                <p class="text-xl font-extrabold text-amber-600 leading-none mb-1 transition-all duration-500">
                  {{ formatNumber(tank.animatedVolume) }} <span class="text-[10px] text-slate-500 font-semibold">L</span>
                </p>
                <p class="text-[9px] font-bold text-slate-400 uppercase border-t border-slate-200 pt-1 mt-1">
                  Kapasitas: {{ formatNumber(tank.capacity) }} L
                </p>
              </div>
            </div>
            <!-- Silinder Tangki -->
            <div class="relative w-40 h-80 bg-slate-200 rounded-[2.5rem] overflow-hidden border-[6px] border-slate-300 shadow-inner flex-shrink-0">
              <div class="absolute bottom-0 left-0 right-0 transition-all ease-in-out bg-[#f59e0b]" style="transition-duration: 2500ms;" :style="{ height: tank.animatedPercentage + '%' }">
                <div class="wave-base wave-amber-back absolute left-0 w-[200%] h-16 -top-7"></div>
                <div class="wave-base wave-amber-front absolute left-0 w-[200%] h-16 -top-7"></div>
              </div>
              <div class="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none">
                <span class="text-3xl font-extrabold text-white/90 transition-all duration-500">{{ Math.round(tank.animatedPercentage) }}%</span>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-between items-center text-[10px] text-slate-400">
            <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
          </div>
        </template>
      </Card>

      <!-- ================= KARTU TANGKI BULANAN (3 Kolom) ================= -->
      <Card title="Kapasitas Tangki Bulanan" class="lg:col-span-3" bodyClass="p-3">
        <div class="grid grid-cols-3 gap-2 h-full">
          <div v-for="(tank, index) in tanksBulanan" :key="index" class="flex flex-col items-center">
            <div class="text-center mb-3 w-full">
              <h3 class="text-base font-bold text-slate-800 mb-1">{{ tank.name }}</h3>
              <div class="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                <p class="text-xl font-extrabold text-emerald-600 leading-none mb-1 transition-all duration-500">
                  {{ formatNumber(tank.animatedVolume) }} <span class="text-[10px] text-slate-500 font-semibold">L</span>
                </p>
                <p class="text-[9px] font-bold text-slate-400 uppercase border-t border-slate-200 pt-1 mt-1">
                  Kapasitas: {{ formatNumber(tank.capacity) }} L
                </p>
              </div>
            </div>
            <!-- Silinder Tangki -->
            <div class="relative w-40 h-80 bg-slate-200 rounded-[2.5rem] overflow-hidden border-[6px] border-slate-300 shadow-inner flex-shrink-0">
              <div class="absolute bottom-0 left-0 right-0 transition-all ease-in-out bg-[#10b981]" style="transition-duration: 2500ms;" :style="{ height: tank.animatedPercentage + '%' }">
                <div class="wave-base wave-emerald-back absolute left-0 w-[200%] h-16 -top-7"></div>
                <div class="wave-base wave-emerald-front absolute left-0 w-[200%] h-16 -top-7"></div>
              </div>
              <div class="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none">
                <span class="text-3xl font-extrabold text-white/90 transition-all duration-500">{{ Math.round(tank.animatedPercentage) }}%</span>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-between items-center text-[10px] text-slate-400">
            <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
          </div>
        </template>
      </Card>
    </div>

    <!-- ================= MODAL DOWNLOAD ================= -->
    <div v-if="isDownloadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isDownloadModalOpen = false"></div>
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 class="text-base font-bold text-slate-800">Download Data Tangki</h2>
            <p class="text-xs text-slate-500">Pilih format dan rentang tanggal</p>
          </div>
          <button @click="isDownloadModalOpen = false" class="p-1.5 bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"><X class="w-4 h-4" /></button>
        </div>
        <form @submit.prevent="handleDownload" class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Kategori Tangki</label>
            <select v-model="downloadForm.kategori" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500">
              <option value="harian">Tangki Harian</option>
              <option value="bulanan">Tangki Bulanan</option>
            </select>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Format File</label>
            <select v-model="downloadForm.format" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500">
              <option value="excel">Excel (.xlsx)</option>
              <option value="pdf">PDF (.pdf)</option>
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
import ConnectionNotif from '@/components/ConnectionNotif.vue' // Tambahan komponen Notifikasi
import { Download, Loader2, X } from '@lucide/vue'
import api from '@/services/api'

// --- NOTIFIKASI ERROR/RECONNECT KONEKSI ---
const apiError = ref(false)
const notifRef = ref(null)

// --- SETUP WAKTU UPDATE & FETCH ---
const lastUpdated = ref('')
let timerClock = null // Cukup gunakan satu timer

const updateTime = () => {
  const now = new Date()
  const pad = (num) => num.toString().padStart(2, '0')
  lastUpdated.value = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

const formatNumber = (num) => Math.round(num).toLocaleString('id-ID')

// --- DATA TANGKI (Default kosong) ---
const tanksHarian = ref([
  { name: 'Harian 1', capacity: 1500, currentVolume: 0, animatedVolume: 0, animatedPercentage: 0 },
  { name: 'Harian 2', capacity: 1500, currentVolume: 0, animatedVolume: 0, animatedPercentage: 0 }
])
const tanksBulanan = ref([
  { name: 'Bulanan 1', capacity: 11662, currentVolume: 0, animatedVolume: 0, animatedPercentage: 0 },
  { name: 'Bulanan 2', capacity: 10000, currentVolume: 0, animatedVolume: 0, animatedPercentage: 0 },
  { name: 'Bulanan 3', capacity: 10000, currentVolume: 0, animatedVolume: 0, animatedPercentage: 0 }
])

// --- LOGIKA ERROR: Tampilkan notifikasi & reset ke 0 ---
const handleApiError = () => {
  if (!apiError.value) {
    apiError.value = true
    notifRef.value?.showError('Koneksi Backend Terputus!', 'Gagal mengambil data tangki. Mereset sistem ke nilai 0...')
  }

  // Animasi turun ke 0
  tanksHarian.value.forEach(tank => {
    tank.currentVolume = 0
    tank.animatedVolume = 0
    tank.animatedPercentage = 0
  })
  
  tanksBulanan.value.forEach(tank => {
    tank.currentVolume = 0
    tank.animatedVolume = 0
    tank.animatedPercentage = 0
  })
}

// --- FETCH API REALTIME ---
const fetchRealtime = async () => {
  try {
    const res = await api.get('/tangki/latest')
    
    // Logika Reconnect
    if (apiError.value) {
      apiError.value = false
      notifRef.value?.showSuccess('Koneksi Tersambung Kembali', 'Data tangki berhasil dimuat ulang.')
    }

    tanksHarian.value = res.data.tanksHarian
    tanksBulanan.value = res.data.tanksBulanan

    tanksHarian.value.forEach(tank => {
      tank.animatedVolume = tank.currentVolume
      tank.animatedPercentage = (tank.currentVolume / tank.capacity) * 100
    })
    
    tanksBulanan.value.forEach(tank => {
      tank.animatedVolume = tank.currentVolume
      tank.animatedPercentage = (tank.currentVolume / tank.capacity) * 100
    })
  } catch (error) {
    handleApiError()
  }
}

// --- LOGIKA MODAL DOWNLOAD ---
const isDownloadModalOpen = ref(false)
const isDownloading = ref(false)
const downloadForm = ref({ kategori: 'harian', format: 'excel', startDate: '', endDate: '' })

const handleDownload = async () => {
  isDownloading.value = true
  try {
    const response = await api.get('/tangki/export', { params: downloadForm.value, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const ext = downloadForm.value.format === 'pdf' ? 'pdf' : 'xlsx'
    link.setAttribute('download', `Tangki_${downloadForm.value.kategori}_${downloadForm.value.startDate}_${downloadForm.value.endDate}.${ext}`)
    document.body.appendChild(link); link.click(); link.remove()
    isDownloadModalOpen.value = false
  } catch (error) {
    alert('Gagal menghubungi server untuk download.')
  } finally {
    isDownloading.value = false
  }
}

// --- SIKLUS HIDUP KOMPONEN ---
onMounted(() => {
  updateTime()
  fetchRealtime()
  
  // Update jam dan panggil API realtime setiap 1 detik (1000 ms)
  timerClock = setInterval(() => {
    updateTime()
    fetchRealtime()
  }, 10000)
})

onUnmounted(() => { 
  if (timerClock) clearInterval(timerClock) 
})
</script>

<style scoped>
/* STYLE OMBAK TETAP SAMA SEPERTI SEBELUMNYA */
.wave-base { background-size: 50% 100%; background-position: bottom center; background-repeat: repeat-x; animation: wave-animation 3s linear infinite; }
.wave-amber-front { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M0 56.9c155.5 0 204.9-50 405.5-49.9 200 0 250 49.9 394.5 49.9v31.8H0v-.2-31.6z' fill='%23f59e0b'/%3E%3C/svg%3E"); }
.wave-amber-back { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M0 56.9c155.5 0 204.9-50 405.5-49.9 200 0 250 49.9 394.5 49.9v31.8H0v-.2-31.6z' fill='%23fbbf24'/%3E%3C/svg%3E"); animation-duration: 4s; animation-direction: reverse; }
.wave-emerald-front { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M0 56.9c155.5 0 204.9-50 405.5-49.9 200 0 250 49.9 394.5 49.9v31.8H0v-.2-31.6z' fill='%2310b981'/%3E%3C/svg%3E"); }
.wave-emerald-back { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M0 56.9c155.5 0 204.9-50 405.5-49.9 200 0 250 49.9 394.5 49.9v31.8H0v-.2-31.6z' fill='%2334d399'/%3E%3C/svg%3E"); animation-duration: 4s; animation-direction: reverse; }
@keyframes wave-animation { 0% { background-position: 100% bottom; } 100% { background-position: 0 bottom; } }
</style>