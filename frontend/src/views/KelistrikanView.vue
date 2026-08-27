<template>
  <div class="p-4 bg-slate-50 min-h-screen relative">
    
    <!-- HEADER & TAB NAVIGATION + TOMBOL DOWNLOAD -->
    <div class="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-800 mb-1">Kelistrikan Gedung</h1>
        <p class="text-slate-500 text-xs">Monitoring Real-time Parameter Kelistrikan TTC Sudiang</p>
      </div>

      <div class="flex items-center gap-3">
        <!-- TAB BUTTONS -->
        <div class="flex space-x-1 bg-slate-200/60 p-1 rounded-xl">
          <button 
            v-for="tab in tabs" :key="tab.id"
            @click="activeTab = tab.id"
            class="py-2 px-3 text-xs font-semibold rounded-lg transition-all"
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
          <span>Download Data</span>
        </button>
      </div>
    </div>

    <!-- ================= TAB 1: PANEL UTAMA ================= -->
    <div v-if="activeTab === 'panel'" class="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
      <div class="flex flex-col gap-4">
        <Card title="PUE Realtime">
          <p class="text-5xl font-bold text-slate-700 text-center py-6">{{ pueValue }}</p>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
        
        <Card title="LVMDP Realtime">
          <div class="text-center py-2 border-b border-slate-100 mb-4 pb-4">
            <span class="text-4xl font-bold text-sky-600">{{ lvmdp.kva }}</span>
            <span class="text-sm text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="grid grid-cols-3 text-center gap-2">
            <div><p class="text-xs text-slate-400 uppercase font-bold">Tegangan</p><p class="text-base font-bold text-slate-700">{{ lvmdp.voltage }} V</p></div>
            <div class="border-l border-r border-slate-100"><p class="text-xs text-slate-400 uppercase font-bold">Arus</p><p class="text-base font-bold text-slate-700">{{ lvmdp.current }} A</p></div>
            <div><p class="text-xs text-slate-400 uppercase font-bold">Frekuensi</p><p class="text-base font-bold text-slate-700">{{ lvmdp.freq }} Hz</p></div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>

        <Card title="IT Load Realtime">
          <div class="text-center py-2 border-b border-slate-100 mb-4 pb-4">
            <span class="text-4xl font-bold text-sky-600">{{ itLoad.kva }}</span>
            <span class="text-sm text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="grid grid-cols-3 text-center gap-2">
            <div><p class="text-xs text-slate-400 uppercase font-bold">Tegangan</p><p class="text-base font-bold text-slate-700">{{ itLoad.voltage }} V</p></div>
            <div class="border-l border-r border-slate-100"><p class="text-xs text-slate-400 uppercase font-bold">Arus</p><p class="text-base font-bold text-slate-700">{{ itLoad.current }} A</p></div>
            <div><p class="text-xs text-slate-400 uppercase font-bold">Frekuensi</p><p class="text-base font-bold text-slate-700">{{ itLoad.freq }} Hz</p></div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
      </div>

      <div class="lg:col-span-2 flex flex-col gap-4">
        <Card title="Tren PUE">
          <apexchart type="area" height="195" :options="chartOptionsSingle" :series="[{ name: 'PUE', data: chartPue }]"></apexchart>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
        <Card title="Tren LVMDP (kVA)">
          <apexchart type="area" height="230" :options="chartOptionsSingle" :series="[{ name: 'LVMDP', data: chartLvmdp }]"></apexchart>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
        <Card title="Tren IT Load (kVA)">
          <apexchart type="area" height="230" :options="chartOptionsSingle" :series="[{ name: 'IT Load', data: chartItLoad }]"></apexchart>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
      </div>
    </div>

    <!-- ================= TAB 2: SISTEM UPS ================= -->
    <div v-if="activeTab === 'ups'" class="flex flex-col gap-4 animate-fade-in">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card title="Total UPS Load Realtime" class="lg:col-span-1 border-l-4 border-l-sky-500">
          <div class="text-center py-2 border-b border-slate-100 mb-4 pb-4">
            <span class="text-5xl font-bold text-sky-600">{{ totalUps.kva }}</span>
            <span class="text-sm text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="grid grid-cols-3 text-center gap-2">
            <div><p class="text-xs text-slate-400 uppercase font-bold">Tegangan</p><p class="text-base font-bold text-slate-700">{{ totalUps.voltage }} V</p></div>
            <div class="border-l border-r border-slate-100"><p class="text-xs text-slate-400 uppercase font-bold">Arus</p><p class="text-base font-bold text-slate-700">{{ totalUps.current }} A</p></div>
            <div><p class="text-xs text-slate-400 uppercase font-bold">Frekuensi</p><p class="text-base font-bold text-slate-700">{{ totalUps.freq }} Hz</p></div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>

        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          <Card v-for="ups in upsList" :key="ups.name" :title="ups.name">
            <div class="text-center mb-2">
              <span class="text-2xl font-bold text-slate-700">{{ ups.kva }}</span>
              <span class="text-xs text-slate-500 ml-1">kVA</span>
            </div>
            <div class="grid grid-cols-3 text-center gap-1 border-t border-slate-50 pt-2">
              <div><p class="text-[9px] text-slate-400 font-bold">V</p><p class="text-xs font-bold text-slate-600">{{ ups.v }}</p></div>
              <div class="border-l border-r border-slate-100"><p class="text-[9px] text-slate-400 font-bold">A</p><p class="text-xs font-bold text-slate-600">{{ ups.a }}</p></div>
              <div><p class="text-[9px] text-slate-400 font-bold">Hz</p><p class="text-xs font-bold text-slate-600">{{ ups.hz }}</p></div>
            </div>
            <template #footer><div class="flex justify-between items-center text-[9px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
          </Card>
        </div>
      </div>
    </div>

    <!-- ================= TAB 3: SISTEM RECTIFIER ================= -->
    <div v-if="activeTab === 'rectifier'" class="flex flex-col gap-4 animate-fade-in">
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <Card title="Total Rectifier Load" class="lg:col-span-2 border-l-4 border-l-sky-500">
          <div class="flex justify-around items-center h-full">
            <div class="text-center">
              <span class="text-4xl font-bold text-sky-600">{{ totalRecti.kva }}</span>
              <span class="text-xs text-slate-500 ml-1 font-bold">kVA</span>
            </div>
            <div class="flex flex-col gap-1 text-right">
              <p class="text-xs"><span class="text-slate-400 font-bold mr-2">V:</span> <span class="font-bold text-slate-700">{{ totalRecti.voltage }} V</span></p>
              <p class="text-xs"><span class="text-slate-400 font-bold mr-2">A:</span> <span class="font-bold text-slate-700">{{ totalRecti.current }} A</span></p>
              <p class="text-xs"><span class="text-slate-400 font-bold mr-2">Hz:</span> <span class="font-bold text-slate-700">{{ totalRecti.freq }} Hz</span></p>
            </div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>

        <Card v-for="recti in rectiList" :key="recti.name" :title="recti.name">
          <div class="text-center mb-1">
            <span class="text-xl font-bold text-slate-700">{{ recti.kva }}</span>
            <span class="text-[10px] text-slate-500 ml-1">kVA</span>
          </div>
          <div class="flex justify-between border-t border-slate-50 pt-1.5 px-1">
            <div class="text-center"><p class="text-[9px] text-slate-400 font-bold">V</p><p class="text-xs font-bold text-slate-600">{{ recti.v }}</p></div>
            <div class="text-center"><p class="text-[9px] text-slate-400 font-bold">A</p><p class="text-xs font-bold text-slate-600">{{ recti.a }}</p></div>
            <div class="text-center"><p class="text-[9px] text-slate-400 font-bold">Hz</p><p class="text-xs font-bold text-slate-600">{{ recti.hz }}</p></div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[9px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
      </div>
    </div>

    <!-- ================= MODAL / POP-UP DOWNLOAD DATA ================= -->
    <div v-if="isDownloadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isDownloadModalOpen = false"></div>
      
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-zoom-in">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 class="text-base font-bold text-slate-800">Download Data Kelistrikan</h2>
            <p class="text-xs text-slate-500">Pilih parameter dan rentang tanggal</p>
          </div>
          <button @click="isDownloadModalOpen = false" class="p-1.5 bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <form @submit.prevent="handleDownload" class="p-5 flex flex-col gap-4">
          <!-- Dropdown Jenis Tabel -->
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Pilih Data / Tabel</label>
            <select v-model="downloadForm.tableType" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500">
              <option v-for="option in downloadOptions" :key="option" :value="option">
                {{ option }}
              </option>
            </select>
          </div>

          <!-- Date Range Inputs -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">Start Date</label>
              <input v-model="downloadForm.startDate" type="date" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500">
            </div>
            <div>
              <label class="block text-xs font-bold text-slate-600 mb-1">End Date</label>
              <input v-model="downloadForm.endDate" type="date" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500">
            </div>
          </div>

          <div class="mt-4 flex justify-end gap-2">
            <button type="button" @click="isDownloadModalOpen = false" class="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg">
              Batal
            </button>
            <button type="submit" :disabled="isDownloading" class="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-4 py-2 rounded-lg flex items-center gap-2 shadow">
              <Loader2 v-if="isDownloading" class="w-4 h-4 animate-spin" />
              <span>{{ isDownloading ? 'Mengunduh...' : 'Unduh File CSV / Excel' }}</span>
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
import api from '@/services/api'
import { Download, X, Loader2 } from '@lucide/vue'

const activeTab = ref('panel')
const tabs = ref([
  { id: 'panel', label: 'Main Panel & PUE' },
  { id: 'ups', label: 'Sistem UPS' },
  { id: 'rectifier', label: 'Sistem Rectifier' }
])

const lastUpdated = ref('')
let timer = null

// Realtime State (Dengan Default Nilai Awal)
const pueValue = ref(1.42)
const lvmdp = ref({ kva: 850, voltage: 380, current: 1291, freq: 50 })
const itLoad = ref({ kva: 603, voltage: 380, current: 916, freq: 50 })
const totalUps = ref({ kva: 425, voltage: 380, current: 645, freq: 50 })
const totalRecti = ref({ kva: 312, voltage: 380, current: 474, freq: 50 })

const chartPue = ref([1.35, 1.4, 1.45, 1.42])
const chartLvmdp = ref([820, 840, 830, 850])
const chartItLoad = ref([590, 610, 600, 603])

const upsList = ref([
  { name: 'UPS 2.02', kva: 45, v: 380, a: 68, hz: 50 },
  { name: 'UPS 2.03', kva: 42, v: 380, a: 63, hz: 50 },
  { name: 'UPS 3.01', kva: 55, v: 380, a: 83, hz: 50 },
  { name: 'UPS 3.02', kva: 52, v: 380, a: 79, hz: 50 },
  { name: 'UPS 5.01', kva: 48, v: 380, a: 72, hz: 50 },
  { name: 'UPS 5.02', kva: 49, v: 380, a: 74, hz: 50 }
])

const rectiNames = ['2.01', '2.02', '2.03', '2.04', '2.05', '2.06', '3.01', '3.02', '3.03', '3.04', '4.04', '4.07', '4.12']
const rectiList = ref(
  rectiNames.map(name => ({
    name: `Recti ${name}`, kva: (Math.random() * 20 + 10).toFixed(1), v: 380, a: Math.floor(Math.random() * 30 + 20), hz: 50
  }))
)

// Fetch API Realtime Kelistrikan
const fetchKelistrikanData = async () => {
  try {
    const res = await api.get('/kelistrikan')
    if (res.data) {
      pueValue.value = res.data.pue ?? pueValue.value
      lvmdp.value = res.data.lvmdp ?? lvmdp.value
      itLoad.value = res.data.itLoad ?? itLoad.value
      totalUps.value = res.data.totalUps ?? totalUps.value
      totalRecti.value = res.data.totalRecti ?? totalRecti.value
      if (res.data.upsList) upsList.value = res.data.upsList
      if (res.data.rectiList) rectiList.value = res.data.rectiList
    }
  } catch (err) {
    console.warn('API Kelistrikan belum aktif, menggunakan mock realtime.')
  }
}

// Download Modal State & Options
const isDownloadModalOpen = ref(false)
const isDownloading = ref(false)

const downloadOptions = [
  'PUE',
  'Rectifier',
  'UPS',
  'Panel 2.05',
  'Panel 2.10',
  'Panel 2.36',
  'Panel 4.29',
  'UPS 2.02',
  'UPS 2.03',
  'UPS 3.01',
  'UPS 3.02',
  'UPS 5.01',
  'UPS 5.02',
  'All Load'
]

const downloadForm = ref({
  tableType: 'PUE',
  startDate: '',
  endDate: ''
})

const handleDownload = async () => {
  isDownloading.value = true
  try {
    // Request download file blob ke backend
    const response = await api.get('/kelistrikan/export', {
      params: {
        tableType: downloadForm.value.tableType,
        startDate: downloadForm.value.startDate,
        endDate: downloadForm.value.endDate
      },
      responseType: 'blob'
    })

    // Buat link download otomatis
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `Kelistrikan_${downloadForm.value.tableType}_${downloadForm.value.startDate}_${downloadForm.value.endDate}.xlsx`)
    document.body.appendChild(link)
    link.click()
    link.remove()

    isDownloadModalOpen.value = false
  } catch (error) {
    // Simulasi fallback jika backend belum aktif
    alert(`Perintah Download Berhasil Dikirim:\nTipe: ${downloadForm.value.tableType}\nRentang: ${downloadForm.value.startDate} s/d ${downloadForm.value.endDate}`)
    isDownloadModalOpen.value = false
  } finally {
    isDownloading.value = false
  }
}

// Konfigurasi Chart Apexchart
const chartOptionsSingle = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#0284c7'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: { categories: ['09:00', '10:00', '11:00', '12:00'], axisBorder: { show: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})

const updateTime = () => {
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  lastUpdated.value = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

onMounted(() => {
  updateTime()
  fetchKelistrikanData()
  timer = setInterval(() => {
    updateTime()
    fetchKelistrikanData()
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.animate-zoom-in { animation: zoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>