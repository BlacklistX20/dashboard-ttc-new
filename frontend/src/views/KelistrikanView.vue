<template>
  <div class="p-4 bg-slate-300 min-h-screen relative">
    
    <ConnectionNotif ref="notifRef" />

    <!-- HEADER & TAB NAVIGATION + KONTROL -->
    <div class="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-800 mb-1">Kelistrikan Gedung</h1>
        <p class="text-slate-500 text-xs">Monitoring Real-time Parameter Kelistrikan TTC Sudiang</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
        <!-- TAB BUTTONS -->
        <div class="flex space-x-1 bg-slate-200/60 p-1 rounded-xl">
          <button 
            v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id"
            class="py-2 px-3 text-xs font-semibold rounded-lg transition-all"
            :class="activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- RANGE WAKTU GRAFIK -->
        <div class="flex items-center bg-white border border-slate-200 p-1 rounded-xl shadow-sm">
          <button 
            v-for="range in ranges" :key="range.value" @click="changeRange(range.value)"
            class="py-1.5 px-3 text-xs font-bold rounded-lg transition-colors"
            :class="selectedRange === range.value ? 'bg-sky-100 text-sky-700' : 'text-slate-400 hover:text-slate-600'"
          >
            {{ range.label }}
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

    <!-- ================= TAB 1: PANEL UTAMA ================= -->
    <div v-if="activeTab === 'panel'" class="flex flex-col gap-4 animate-fade-in">
      <!-- Baris 1: PUE -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card title="PUE Realtime" bodyClass="p-3" class="lg:col-span-1">
          <p class="font-bold text-center py-2" :class="apiError || pueValue === null ? 'text-xl text-slate-400 italic mt-1' : 'text-3xl text-slate-700'">
            {{ apiError ? 'Offline' : (pueValue !== null ? pueValue : 'No Data') }}
          </p>
          <template #footer><div class="flex justify-between items-center text-[9px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
        <Card title="Tren PUE" bodyClass="px-2 pt-2" class="lg:col-span-3">
          <apexchart type="area" height="150" :options="chartOptionsSingle" :series="chartPueSeries"></apexchart>
        </Card>
      </div>

      <!-- Baris 2: LVMDP -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card title="LVMDP Realtime" bodyClass="p-3" class="lg:col-span-1">
          <div class="text-center py-1 border-b border-slate-100 mb-2 pb-2">
            <span class="font-bold" :class="apiError || lvmdp.kva === null ? 'text-lg text-slate-400 italic' : 'text-2xl text-sky-600'">
              {{ apiError ? 'Offline' : (lvmdp.kva !== null ? lvmdp.kva : 'No Data') }}
            </span>
            <span v-if="!apiError && lvmdp.kva !== null" class="text-xs text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="grid grid-cols-3 text-center gap-1">
            <div><p class="text-[9px] text-slate-400 font-bold">V</p><p class="text-sm font-bold" :class="apiError || lvmdp.voltage === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || lvmdp.voltage === null ? '-' : lvmdp.voltage }}</p></div>
            <div class="border-l border-r border-slate-100"><p class="text-[9px] text-slate-400 font-bold">A</p><p class="text-sm font-bold" :class="apiError || lvmdp.current === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || lvmdp.current === null ? '-' : lvmdp.current }}</p></div>
            <div><p class="text-[9px] text-slate-400 font-bold">Hz</p><p class="text-sm font-bold" :class="apiError || lvmdp.freq === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || lvmdp.freq === null ? '-' : lvmdp.freq }}</p></div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[9px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
        <Card title="Tren LVMDP (kVA)" bodyClass="px-2 pt-2" class="lg:col-span-3">
          <apexchart type="area" height="150" :options="chartOptionsSingle" :series="chartLvmdpSeries"></apexchart>
        </Card>
      </div>

      <!-- Baris 3: IT Load -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card title="IT Load Realtime" bodyClass="p-3" class="lg:col-span-1">
          <div class="text-center py-1 border-b border-slate-100 mb-2 pb-2">
            <span class="font-bold" :class="apiError || itLoad.kva === null ? 'text-lg text-slate-400 italic' : 'text-2xl text-sky-600'">
              {{ apiError ? 'Offline' : (itLoad.kva !== null ? itLoad.kva : 'No Data') }}
            </span>
            <span v-if="!apiError && itLoad.kva !== null" class="text-xs text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="grid grid-cols-3 text-center gap-1">
            <div><p class="text-[9px] text-slate-400 font-bold">V</p><p class="text-sm font-bold" :class="apiError || itLoad.voltage === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || itLoad.voltage === null ? '-' : itLoad.voltage }}</p></div>
            <div class="border-l border-r border-slate-100"><p class="text-[9px] text-slate-400 font-bold">A</p><p class="text-sm font-bold" :class="apiError || itLoad.current === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || itLoad.current === null ? '-' : itLoad.current }}</p></div>
            <div><p class="text-[9px] text-slate-400 font-bold">Hz</p><p class="text-sm font-bold" :class="apiError || itLoad.freq === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || itLoad.freq === null ? '-' : itLoad.freq }}</p></div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[9px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
        <Card title="Tren IT Load (kVA)" bodyClass="px-2 pt-2" class="lg:col-span-3">
          <apexchart type="area" height="150" :options="chartOptionsSingle" :series="chartItLoadSeries"></apexchart>
        </Card>
      </div>
    </div>

    <!-- ================= TAB 2: SISTEM UPS ================= -->
    <div v-if="activeTab === 'ups'" class="flex flex-col gap-4 animate-fade-in">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-stretch">
        
        <!-- Total UPS Load -->
        <Card title="Total UPS Load" class="lg:col-span-1 border-l-4 border-l-sky-500" bodyClass="flex flex-col justify-center h-full p-4">
          <div class="text-center py-4 border-b border-slate-100 mb-6 pb-6">
            <span class="font-bold inline-block" :class="apiError || totalUps.kva === null ? 'text-2xl text-slate-400 italic mt-3' : 'text-5xl text-sky-600'">
              {{ apiError ? 'Offline' : (totalUps.kva !== null ? totalUps.kva : 'No Data') }}
            </span>
            <span v-if="!apiError && totalUps.kva !== null" class="text-sm text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="grid grid-cols-3 text-center gap-1">
            <div><p class="text-xs text-slate-400 font-bold">V</p><p class="text-xl font-bold" :class="apiError || totalUps.voltage === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || totalUps.voltage === null ? '-' : totalUps.voltage }}</p></div>
            <div class="border-l border-r border-slate-100"><p class="text-xs text-slate-400 font-bold">A</p><p class="text-xl font-bold" :class="apiError || totalUps.current === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || totalUps.current === null ? '-' : totalUps.current }}</p></div>
            <div><p class="text-xs text-slate-400 font-bold">Hz</p><p class="text-xl font-bold" :class="apiError || totalUps.freq === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || totalUps.freq === null ? '-' : totalUps.freq }}</p></div>
          </div>
        </Card>

        <!-- Kartu UPS Individual -->
        <div class="lg:col-span-3 grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card v-for="ups in upsList" :key="ups.name" :title="ups.name" bodyClass="p-4 flex flex-col justify-center">
            <div class="text-center mb-4">
              <span class="font-bold" :class="apiError || ups.kva === null ? 'text-lg text-slate-400 italic' : 'text-2xl text-slate-700'">
                {{ apiError ? 'Offline' : (ups.kva !== null ? ups.kva : 'No Data') }}
              </span>
              <span v-if="!apiError && ups.kva !== null" class="text-xs text-slate-500 ml-1">kVA</span>
            </div>
            <div class="flex justify-between border-t border-slate-50 pt-3 text-center">
              <div class="w-1/3"><p class="text-[10px] text-slate-400 font-bold">V</p><p class="text-sm font-bold" :class="apiError || ups.v === null ? 'text-slate-400' : 'text-slate-600'">{{ apiError || ups.v === null ? '-' : ups.v }}</p></div>
              <div class="w-1/3 border-l border-r border-slate-100"><p class="text-[10px] text-slate-400 font-bold">A</p><p class="text-sm font-bold" :class="apiError || ups.a === null ? 'text-slate-400' : 'text-slate-600'">{{ apiError || ups.a === null ? '-' : ups.a }}</p></div>
              <div class="w-1/3"><p class="text-[10px] text-slate-400 font-bold">Hz</p><p class="text-sm font-bold" :class="apiError || ups.hz === null ? 'text-slate-400' : 'text-slate-600'">{{ apiError || ups.hz === null ? '-' : ups.hz }}</p></div>
            </div>
          </Card>
        </div>
      </div>
      
      <!-- GRAFIK TREN UPS -->
      <Card title="Tren Beban Sistem UPS (kVA)">
        <apexchart type="area" height="280" :options="chartOptionsMulti" :series="chartUpsSeries"></apexchart>
      </Card>
    </div>

    <!-- ================= TAB 3: SISTEM RECTIFIER ================= -->
    <div v-if="activeTab === 'rectifier'" class="flex flex-col gap-4 animate-fade-in">
      
      <!-- Grid Utama: 3 Kolom. -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch">
        
        <!-- Kartu 1: Total Rectifier -->
        <Card title="Total Rectifier Load" class="border-l-4 border-l-sky-500 shadow-md" bodyClass="p-4 flex flex-col justify-center h-full bg-sky-50/30">
          <div class="text-center mb-4">
            <span class="font-bold inline-block" :class="apiError || totalRecti.kva === null ? 'text-2xl text-slate-400 italic mt-2' : 'text-4xl text-sky-600'">
              {{ apiError ? 'Offline' : (totalRecti.kva !== null ? totalRecti.kva : 'No Data') }}
            </span>
            <span v-if="!apiError && totalRecti.kva !== null" class="text-xs text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="flex justify-between border-t border-sky-100 pt-3 text-center">
            <div class="w-1/3"><p class="text-[10px] text-slate-400 font-bold">V</p><p class="text-base font-bold" :class="apiError || totalRecti.voltage === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || totalRecti.voltage === null ? '-' : totalRecti.voltage }}</p></div>
            <div class="w-1/3 border-l border-r border-sky-100"><p class="text-[10px] text-slate-400 font-bold">A</p><p class="text-base font-bold" :class="apiError || totalRecti.current === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || totalRecti.current === null ? '-' : totalRecti.current }}</p></div>
            <div class="w-1/3"><p class="text-[10px] text-slate-400 font-bold">Hz</p><p class="text-base font-bold" :class="apiError || totalRecti.freq === null ? 'text-slate-400' : 'text-slate-700'">{{ apiError || totalRecti.freq === null ? '-' : totalRecti.freq }}</p></div>
          </div>
        </Card>

        <!-- Kartu 2-6: Individual Panel -->
        <Card v-for="recti in rectiList" :key="recti.name" :title="recti.name" bodyClass="p-4 flex flex-col justify-center h-full">
          <div class="text-center mb-4">
            <span class="font-bold" :class="apiError || recti.kva === null ? 'text-lg text-slate-400 italic' : 'text-2xl text-slate-700'">
              {{ apiError ? 'Offline' : (recti.kva !== null ? recti.kva : 'No Data') }}
            </span>
            <span v-if="!apiError && recti.kva !== null" class="text-[10px] text-slate-500 ml-1">kVA</span>
          </div>
          <div class="flex justify-between border-t border-slate-50 pt-3 text-center">
            <div class="w-1/3"><p class="text-[10px] text-slate-400 font-bold">V</p><p class="text-sm font-bold" :class="apiError || recti.v === null ? 'text-slate-400' : 'text-slate-600'">{{ apiError || recti.v === null ? '-' : recti.v }}</p></div>
            <div class="w-1/3 border-l border-r border-slate-100"><p class="text-[10px] text-slate-400 font-bold">A</p><p class="text-sm font-bold" :class="apiError || recti.a === null ? 'text-slate-400' : 'text-slate-600'">{{ apiError || recti.a === null ? '-' : recti.a }}</p></div>
            <div class="w-1/3"><p class="text-[10px] text-slate-400 font-bold">Hz</p><p class="text-sm font-bold" :class="apiError || recti.hz === null ? 'text-slate-400' : 'text-slate-600'">{{ apiError || recti.hz === null ? '-' : recti.hz }}</p></div>
          </div>
        </Card>
      </div>

      <!-- GRAFIK TREN RECTIFIER -->
      <Card title="Tren Beban Sistem Rectifier (kVA)">
        <apexchart type="line" height="280" :options="chartOptionsMultiLine" :series="chartRectiSeries"></apexchart>
      </Card>
    </div>

    <!-- ================= MODAL DOWNLOAD ================= -->
    <div v-if="isDownloadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isDownloadModalOpen = false"></div>
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-zoom-in">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 class="text-base font-bold text-slate-800">Download Data Kelistrikan</h2>
            <p class="text-xs text-slate-500">Pilih parameter dan rentang tanggal</p>
          </div>
          <button @click="isDownloadModalOpen = false" class="p-1.5 bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"><X class="w-4 h-4" /></button>
        </div>
        <form @submit.prevent="handleDownload" class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Pilih Data / Tabel</label>
            <select v-model="downloadForm.tableType" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500">
              <option v-for="option in downloadOptions" :key="option" :value="option">{{ option }}</option>
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
import { Download, X, Loader2 } from '@lucide/vue'

// --- STATE NAVIGASI & NOTIFIKASI ---
const activeTab = ref('panel')
const tabs = ref([
  { id: 'panel', label: 'Main Panel & PUE' }, 
  { id: 'ups', label: 'Sistem UPS' }, 
  { id: 'rectifier', label: 'Sistem Rectifier' }
])

const selectedRange = ref('1h')
const ranges = ref([
  { label: '1 Jam', value: '1h' }, 
  { label: '1 Hari', value: '1d' }, 
  { label: '1 Minggu', value: '1w' }
])

const apiError = ref(false)
const notifRef = ref(null)

// --- STATE DATA REALTIME (Diinisialisasi null) ---
const pueValue = ref(null)
const lvmdp = ref({ kva: null, voltage: null, current: null, freq: null })
const itLoad = ref({ kva: null, voltage: null, current: null, freq: null })
const totalUps = ref({ kva: null, voltage: null, current: null, freq: null })
const totalRecti = ref({ kva: null, voltage: null, current: null, freq: null })

const defaultUpsList = () => [
  { name: 'UPS 2.02', kva: null, v: null, a: null, hz: null },
  { name: 'UPS 2.03', kva: null, v: null, a: null, hz: null },
  { name: 'UPS 3.01', kva: null, v: null, a: null, hz: null },
  { name: 'UPS 3.02', kva: null, v: null, a: null, hz: null },
  { name: 'UPS 5.01', kva: null, v: null, a: null, hz: null },
  { name: 'UPS 5.02', kva: null, v: null, a: null, hz: null }
]

const defaultRectiList = () => [
  { name: 'Panel 2.05', kva: null, v: null, a: null, hz: null },
  { name: 'Panel 2.36', kva: null, v: null, a: null, hz: null },
  { name: 'Panel 3.05', kva: null, v: null, a: null, hz: null },
  { name: 'Panel 3.10', kva: null, v: null, a: null, hz: null },
  { name: 'Panel 4.29', kva: null, v: null, a: null, hz: null }
]

const upsList = ref(defaultUpsList())
const rectiList = ref(defaultRectiList())

// --- STATE DATA GRAFIK ---
const chartPueSeries = ref([])
const chartLvmdpSeries = ref([])
const chartItLoadSeries = ref([])
const chartUpsSeries = ref([])
const chartRectiSeries = ref([])


// --- FUNGSI UPDATE TEXT GRAFIK KOSONG ---
const updateChartNoDataText = (text) => {
  chartOptionsSingle.value = { ...chartOptionsSingle.value, noData: { ...chartOptionsSingle.value.noData, text } }
  chartOptionsMulti.value = { ...chartOptionsMulti.value, noData: { ...chartOptionsMulti.value.noData, text } }
  chartOptionsMultiLine.value = { ...chartOptionsMultiLine.value, noData: { ...chartOptionsMultiLine.value.noData, text } }
}

// --- FETCH API REALTIME ---
const fetchRealtime = async () => {
  try {
    const res = await api.get('/kelistrikan')
    if (apiError.value) {
      apiError.value = false
      notifRef.value?.showSuccess('Koneksi Tersambung Kembali', 'Data kelistrikan berhasil dimuat ulang.')
    }
    
    updateChartNoDataText('Tidak ada data') // Set default tulisan grafik ke Tidak ada data jika kosong

    pueValue.value = res.data.pue
    lvmdp.value = res.data.lvmdp
    itLoad.value = res.data.itLoad
    totalUps.value = res.data.totalUps
    totalRecti.value = res.data.totalRecti
    upsList.value = res.data.upsList
    rectiList.value = res.data.rectiList
  } catch (err) {
    handleApiError()
  }
}

// --- FETCH API TREN (GRAFIK) ---
const fetchTrends = async () => {
  try {
    const range = selectedRange.value
    // 1. Fetch Main (PUE, LVMDP, IT)
    const resMain = await api.get(`/kelistrikan/trend/main?range=${range}`)
    chartPueSeries.value = [{ name: 'PUE', data: resMain.data.pue }]
    chartLvmdpSeries.value = [{ name: 'LVMDP', data: resMain.data.lvmdp }]
    chartItLoadSeries.value = [{ name: 'IT Load', data: resMain.data.it }]

    // 2. Fetch Rectifier
    const resRecti = await api.get(`/kelistrikan/trend/rectifiers?range=${range}`)
    chartRectiSeries.value = resRecti.data

    // 3. Fetch UPS
    const resUps = await api.get(`/kelistrikan/trend/ups?range=${range}`)
    chartUpsSeries.value = resUps.data

  } catch (err) {
    handleApiError()
  }
}

// Pantau perubahan filter range waktu agar grafik otomatis dimuat ulang
const changeRange = (val) => {
  selectedRange.value = val
  fetchTrends()
}

// --- LOGIKA ERROR (RESET ke NULL/OFFLINE) ---
const handleApiError = () => {
  if (!apiError.value) {
    apiError.value = true
    notifRef.value?.showError('Koneksi Backend Terputus!', 'Gagal mengambil data. Menampilkan status offline...')
  }
  
  updateChartNoDataText('Offline')

  // Reset Semua Angka ke null beserta fallback panel
  pueValue.value = null
  lvmdp.value = { kva: null, voltage: null, current: null, freq: null }
  itLoad.value = { kva: null, voltage: null, current: null, freq: null }
  totalUps.value = { kva: null, voltage: null, current: null, freq: null }
  totalRecti.value = { kva: null, voltage: null, current: null, freq: null }
  upsList.value = defaultUpsList()
  rectiList.value = defaultRectiList()

  // Kosongkan Grafik
  chartPueSeries.value = []
  chartLvmdpSeries.value = []
  chartItLoadSeries.value = []
  chartUpsSeries.value = []
  chartRectiSeries.value = []
}

// --- KONFIGURASI GRAFIK APEXCHARTS ---
const commonChartOptions = {
  fontFamily: 'inherit',
  xaxis: { type: 'datetime', axisBorder: { show: false }, tooltip: { enabled: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  dataLabels: { enabled: false },
  markers: { size: 0 }, 
  tooltip: { x: { format: 'dd MMM yyyy, HH:mm' } },
  noData: { text: 'Tidak ada data', align: 'center', verticalAlign: 'middle', style: { color: '#94a3b8', fontSize: '14px', fontFamily: 'inherit' } }
}

const chartOptionsSingle = ref({
  ...commonChartOptions,
  chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } },
  colors: ['#0284c7'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  stroke: { curve: 'smooth', width: 2 }
})

const chartOptionsMulti = ref({
  ...commonChartOptions,
  chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } },
  colors: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#bae6fd', '#0369a1'],
  fill: { type: 'solid', opacity: 0.15 }, 
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'top', horizontalAlign: 'right' }
})

const chartOptionsMultiLine = ref({
  ...commonChartOptions,
  chart: { type: 'line', toolbar: { show: false }, animations: { enabled: false } },
  colors: ['#0284c7', '#0ea5e9', '#38bdf8', '#7dd3fc', '#0369a1'],
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'top', horizontalAlign: 'right' }
})


// --- WAKTU UPDATE & POLLING ---
const lastUpdated = ref('')
let timer = null
const updateTime = () => {
  const now = new Date()
  const pad = (n) => n.toString().padStart(2, '0')
  lastUpdated.value = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

onMounted(() => {
  updateTime()
  fetchRealtime()
  fetchTrends()
  
  timer = setInterval(() => {
    updateTime()
    fetchRealtime()
    fetchTrends()
  }, 5000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// --- LOGIKA MODAL DOWNLOAD ---
const isDownloadModalOpen = ref(false)
const isDownloading = ref(false)
const downloadOptions = [
  'PUE', 'Rectifier', 'UPS', 
  'Panel 2.05', 'Panel 2.36', 'Panel 3.05', 'Panel 3.10', 'Panel 4.29', 
  'UPS 2.02', 'UPS 2.03', 'UPS 3.01', 'UPS 3.02', 'UPS 5.01', 'UPS 5.02', 
  'All Load'
]
const formatOptions = [
  { value: 'excel', label: 'Excel (.xlsx)' },
  { value: 'pdf', label: 'PDF (.pdf)' }
]
const downloadForm = ref({ tableType: 'PUE', format: 'excel', startDate: '', endDate: '' })

const handleDownload = async () => {
  isDownloading.value = true
  try {
    const response = await api.get('/kelistrikan/export', { params: downloadForm.value, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const ext = downloadForm.value.format === 'pdf' ? 'pdf' : 'xlsx'
    link.setAttribute('download', `Kelistrikan_${downloadForm.value.tableType}_${downloadForm.value.startDate}_${downloadForm.value.endDate}.${ext}`)
    document.body.appendChild(link); link.click(); link.remove()
    isDownloadModalOpen.value = false
  } catch (error) {
    alert(`Gagal menghubungi server untuk download. Pastikan backend aktif.`)
    isDownloadModalOpen.value = false
  } finally {
    isDownloading.value = false
  }
}
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.animate-zoom-in { animation: zoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>