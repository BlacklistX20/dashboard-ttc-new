<template>
  <div class="p-4 bg-slate-50 min-h-screen relative">
    
    <!-- ================= FLOATING NOTIFICATION ERROR ================= -->
    <!-- Wrapper transparan full-screen agar konten selalu di tengah -->
    <div v-if="showErrorNotif" class="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-6 pointer-events-none">
      <!-- Box Notifikasi -->
      <div class="pointer-events-auto w-[90%] md:w-max max-w-lg bg-red-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 animate-slide-down-center border border-red-500">
        <div class="flex items-center gap-4">
          <div class="bg-red-700 p-2 rounded-lg flex-shrink-0">
            <AlertTriangle class="w-5 h-5 text-red-100" />
          </div>
          <div class="flex flex-col">
            <span class="text-sm font-bold">Koneksi Backend Terputus!</span>
            <span class="text-[10px] text-red-200">Gagal mengambil data. Mereset sistem ke nilai 0...</span>
          </div>
        </div>
        <button @click="closeNotif" class="p-1.5 hover:bg-red-700 rounded-full transition-colors flex-shrink-0">
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- HEADER -->
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-slate-800">Dashboard Utama</h1>
      <p class="text-slate-500 text-sm">Monitoring Kelistrikan, Lingkungan, dan BBM Gedung</p>
    </div>
    
    <div class="flex flex-col gap-4 animate-fade-in">
      
      <!-- ================= SECTION ATAS ================= -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        <!-- KIRI: KELISTRIKAN & SUHU -->
        <div class="lg:col-span-3 flex flex-col gap-4">
          
          <!-- Baris 1: Kartu Statistik PUE -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="PUE Saat Ini">
              <p class="text-4xl font-bold text-slate-700 text-center py-2">{{ pueStats.current }}</p>
              <template #footer><div class="flex justify-between text-[10px] text-slate-400"><span>Update:</span><span class="font-medium">{{ lastUpdated }}</span></div></template>
            </Card>
            <Card title="PUE Minimum (7 Hari)">
              <p class="text-4xl font-bold text-slate-700 text-center py-2">{{ pueStats.min }}</p>
              <template #footer><div class="flex justify-between text-[10px] text-slate-400"><span>Update:</span><span class="font-medium">{{ lastUpdated }}</span></div></template>
            </Card>
            <Card title="PUE Maksimum (7 Hari)">
              <p class="text-4xl font-bold text-slate-700 text-center py-2">{{ pueStats.max }}</p>
              <template #footer><div class="flex justify-between text-[10px] text-slate-400"><span>Update:</span><span class="font-medium">{{ lastUpdated }}</span></div></template>
            </Card>
          </div>

          <!-- Baris 2: Grafik PUE -->
          <Card title="Tren PUE (7 Hari Terakhir)">
            <apexchart type="area" height="250" :options="pueChartOptions" :series="pueChartSeries"></apexchart>
          </Card>

          <!-- Baris 3: Suhu Data Center & Okupansi -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <!-- Suhu -->
            <Card title="Suhu Data Center">
              <p class="text-5xl font-bold text-sky-600 text-center py-4">{{ suhuDC }}°C</p>
              <div class="text-center mt-1">
                <span class="text-[10px] font-bold px-3 py-1 rounded-full tracking-wider" :class="suhuDC <= 24 && !apiError ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'">
                  {{ suhuDC <= 24 && !apiError ? 'NORMAL' : 'PERINGATAN' }}
                </span>
              </div>
              <template #footer><div class="flex justify-between text-[10px] text-slate-400"><span>Update:</span><span class="font-medium">{{ lastUpdated }}</span></div></template>
            </Card>
            
            <!-- Okupansi -->
            <Card title="Okupansi Sumber Daya">
              <div class="flex flex-col justify-center h-full gap-3 py-1">
                <div>
                  <div class="flex justify-between mb-1.5"><span class="text-xs font-medium text-slate-700">Trafo</span><span class="text-xs font-bold">{{ okupansi.trafo }}%</span></div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5"><div class="bg-slate-700 h-2.5 rounded-full transition-all duration-500" :style="{ width: okupansi.trafo + '%' }"></div></div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5"><span class="text-xs font-medium text-slate-700">PLN</span><span class="text-xs font-bold">{{ okupansi.pln }}%</span></div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5"><div class="bg-slate-500 h-2.5 rounded-full transition-all duration-500" :style="{ width: okupansi.pln + '%' }"></div></div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5"><span class="text-xs font-medium text-slate-700">Genset</span><span class="text-xs font-bold">{{ okupansi.genset }}%</span></div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5"><div class="bg-slate-400 h-2.5 rounded-full transition-all duration-500" :style="{ width: okupansi.genset + '%' }"></div></div>
                </div>
              </div>
              <template #footer><div class="flex justify-between text-[10px] text-slate-400"><span>Update:</span><span class="font-medium">{{ lastUpdated }}</span></div></template>
            </Card>
          </div>
        </div>

        <!-- KANAN: ENVIRONMENT GEDUNG -->
        <div class="lg:col-span-1">
          <Card title="Environment Gedung" bodyClass="p-4">
            <div class="flex flex-col gap-4">
              
              <!-- CO2 -->
              <div v-if="co2Data.length">
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gas CO2</h3>
                <div class="flex flex-col gap-2">
                  <div v-for="(room, index) in co2Data" :key="index" class="bg-white px-3 py-2 rounded-xl border flex justify-between items-center shadow-sm border-l-4" :class="getCO2Status(room.value).borderClass">
                    <div>
                      <span class="text-xs text-slate-700 font-medium block mb-1">{{ room.name }}</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="[getCO2Status(room.value).bgClass, getCO2Status(room.value).textClass]">{{ getCO2Status(room.value).label }}</span>
                    </div>
                    <div class="text-right">
                      <span class="text-lg font-bold text-slate-800">{{ room.value }}</span><span class="text-[10px] text-slate-500 ml-1">ppm</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- H2 -->
              <div v-if="h2Data.length">
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gas Hidrogen (H2)</h3>
                <div class="flex flex-col gap-2">
                  <div v-for="(room, index) in h2Data" :key="index" class="bg-white px-3 py-2 rounded-xl border flex justify-between items-center shadow-sm border-l-4" :class="getH2Status(room.value).borderClass">
                    <div>
                      <span class="text-xs text-slate-700 font-medium block mb-1">{{ room.name }}</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="[getH2Status(room.value).bgClass, getH2Status(room.value).textClass]">{{ getH2Status(room.value).label }}</span>
                    </div>
                    <div class="text-right">
                      <span class="text-base font-bold text-slate-800">{{ room.value }}</span><span class="text-[10px] text-slate-500 ml-1">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CO GENSET -->
              <div v-if="coGensetData.length">
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gas Carbon (CO) Genset</h3>
                <div class="flex flex-col gap-2">
                  <div v-for="(genset, index) in coGensetData" :key="index" class="bg-white px-3 py-2 rounded-xl border flex justify-between items-center shadow-sm border-l-4" :class="getCOStatus(genset.value).borderClass">
                    <div>
                      <span class="text-xs text-slate-700 font-medium block mb-1">{{ genset.name }}</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="[getCOStatus(genset.value).bgClass, getCOStatus(genset.value).textClass]">{{ getCOStatus(genset.value).label }}</span>
                    </div>
                    <div class="text-right">
                      <span class="text-base font-bold text-slate-800">{{ genset.value }}</span><span class="text-[10px] text-slate-500 ml-1">ppm</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </Card>
        </div>

      </div> 

      <!-- ================= SECTION BAWAH (Grafik BBM) ================= -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card title="Kapasitas Tangki Harian (Liter)">
          <apexchart type="area" height="280" :options="bbmHarianOptions" :series="bbmHarianSeries"></apexchart>
        </Card>
        <Card title="Kapasitas Tangki Bulanan (Liter)">
          <apexchart type="area" height="280" :options="bbmBulananOptions" :series="bbmBulananSeries"></apexchart>
        </Card>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Card from '@/components/Card.vue'
import api from '@/services/api' 
import { AlertTriangle, X } from '@lucide/vue'

// --- STATE API ---
const apiError = ref(false) // State penanda Error Koneksi Backend (untuk UI / logika 0)
const showErrorNotif = ref(false) // State khusus untuk menampilkan/menyembunyikan pop-up notifikasi
let notifTimeout = null // Variabel penyimpan timer 30 detik

const pueStats = ref({ current: 0, min: 0, max: 0 })
const suhuDC = ref(0)
const okupansi = ref({ trafo: 0, pln: 0, genset: 0 })
const co2Data = ref([{ name: 'Ruang Control', value: 0 }, { name: 'Ruang Vendor', value: 0 }])
const h2Data = ref([
  { name: 'R. Baterai Lt 1', value: 0 }, { name: 'R. Baterai Lt 2', value: 0 },
  { name: 'R. Baterai Lt 3', value: 0 }, { name: 'R. Baterai Lt 4', value: 0 }, { name: 'R. Baterai Lt 5', value: 0 }
])
const coGensetData = ref([{ name: 'Genset 1', value: 0 }, { name: 'Genset 2', value: 0 }, { name: 'Genset 3', value: 0 }])

// State Data Grafik Dinamis
const pueChartSeries = ref([{ name: 'Nilai PUE', data: [0, 0, 0, 0, 0, 0, 0] }])
const bbmHarianSeries = ref([{ name: 'Tangki Harian 1', data: [0,0,0,0,0,0,0] }, { name: 'Tangki Harian 2', data: [0,0,0,0,0,0,0] }])
const bbmBulananSeries = ref([
  { name: 'Tangki Bulanan 1', data: [0,0,0,0,0,0,0] }, { name: 'Tangki Bulanan 2', data: [0,0,0,0,0,0,0] }, { name: 'Tangki Bulanan 3', data: [0,0,0,0,0,0,0] }
])

// --- FUNGSI TUTUP NOTIFIKASI MANUAL ---
const closeNotif = () => {
  showErrorNotif.value = false
  if (notifTimeout) clearTimeout(notifTimeout)
}

// --- FETCH DATA API BACKEND ---
const fetchDashboardData = async () => {
  try {
    const res = await api.get('/dashboard')
    const d = res.data

    // Jika sebelumnya error, pulihkan status notifikasi karena sistem kembali online
    if (apiError.value) {
      apiError.value = false
      showErrorNotif.value = false
      if (notifTimeout) clearTimeout(notifTimeout)
    }

    pueStats.value = d.pue
    pueChartSeries.value = [{ name: 'Nilai PUE', data: d.pue.chart }]
    suhuDC.value = d.suhuDataCenter
    okupansi.value = d.okupansi

    co2Data.value = d.environment.co2Data
    h2Data.value = d.environment.h2Data
    coGensetData.value = d.environment.coGensetData

    if(d.fuel.daily.length) {
      bbmHarianSeries.value = [
        { name: 'Tangki Harian 1', data: d.fuel.daily.map(item => item.tank1) },
        { name: 'Tangki Harian 2', data: d.fuel.daily.map(item => item.tank2) }
      ]
    }

    if(d.fuel.monthly.length) {
      bbmBulananSeries.value = [
        { name: 'Tangki Bulanan 1', data: d.fuel.monthly.map(item => item.tank1) },
        { name: 'Tangki Bulanan 2', data: d.fuel.monthly.map(item => item.tank2) },
        { name: 'Tangki Bulanan 3', data: d.fuel.monthly.map(item => item.tank3) }
      ]
    }

  } catch (error) {
    // Cegah kemunculan notifikasi berulang jika sistem memang sedang mati panjang
    if (!apiError.value) {
      apiError.value = true
      showErrorNotif.value = true
      
      // Hitung mundur 30 detik untuk menyembunyikan notifikasi error
      if (notifTimeout) clearTimeout(notifTimeout)
      notifTimeout = setTimeout(() => {
        showErrorNotif.value = false
      }, 30000)
    }
    
    // Reset data UI ke 0
    pueStats.value = { current: 0, min: 0, max: 0 }
    suhuDC.value = 0
    okupansi.value = { trafo: 0, pln: 0, genset: 0 }

    co2Data.value = [{ name: 'Ruang Control', value: 0 }, { name: 'Ruang Vendor', value: 0 }]
    h2Data.value = [
      { name: 'R. Baterai Lt 1', value: 0 }, { name: 'R. Baterai Lt 2', value: 0 },
      { name: 'R. Baterai Lt 3', value: 0 }, { name: 'R. Baterai Lt 4', value: 0 }, { name: 'R. Baterai Lt 5', value: 0 }
    ]
    coGensetData.value = [{ name: 'Genset 1', value: 0 }, { name: 'Genset 2', value: 0 }, { name: 'Genset 3', value: 0 }]
    
    pueChartSeries.value = [{ name: 'Nilai PUE', data: [0, 0, 0, 0, 0, 0, 0] }]
    bbmHarianSeries.value = [{ name: 'Tangki Harian 1', data: [0,0,0,0,0,0,0] }, { name: 'Tangki Harian 2', data: [0,0,0,0,0,0,0] }]
    bbmBulananSeries.value = [
      { name: 'Tangki Bulanan 1', data: [0,0,0,0,0,0,0] }, { name: 'Tangki Bulanan 2', data: [0,0,0,0,0,0,0] }, { name: 'Tangki Bulanan 3', data: [0,0,0,0,0,0,0] }
    ]
  }
}

// --- WAKTU UPDATE & POLLING ---
const lastUpdated = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  const pad = (num) => num.toString().padStart(2, '0')
  const day = pad(now.getDate()), month = pad(now.getMonth() + 1), year = now.getFullYear()
  const hours = pad(now.getHours()), minutes = pad(now.getMinutes()), seconds = pad(now.getSeconds())
  lastUpdated.value = `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`
}

onMounted(() => {
  updateTime()
  fetchDashboardData() 
  timer = setInterval(() => {
    updateTime()
    fetchDashboardData()
  }, 5000) 
})

onUnmounted(() => { 
  if (timer) clearInterval(timer) 
  if (notifTimeout) clearTimeout(notifTimeout) // Bersihkan memory leak timer
})

// --- LOGIKA STATUS WARNA GAS ---
const getCO2Status = (value) => {
  if (value === 0 && apiError.value) return { label: 'OFFLINE', textClass: 'text-slate-500', bgClass: 'bg-slate-100', borderClass: 'border-l-slate-400 border-slate-200' }
  if (value < 1000) return { label: 'AMAN', textClass: 'text-emerald-700', bgClass: 'bg-emerald-100', borderClass: 'border-l-emerald-500 border-slate-200' }
  else if (value <= 2000) return { label: 'PERINGATAN', textClass: 'text-amber-700', bgClass: 'bg-amber-100', borderClass: 'border-l-amber-400 border-amber-200' }
  else return { label: 'BAHAYA', textClass: 'text-red-700', bgClass: 'bg-red-100', borderClass: 'border-l-red-500 border-red-200' }
}
const getH2Status = (value) => {
  if (value === 0 && apiError.value) return { label: 'OFFLINE', textClass: 'text-slate-500', bgClass: 'bg-slate-100', borderClass: 'border-l-slate-400 border-slate-200' }
  if (value < 0.5) return { label: 'AMAN', textClass: 'text-emerald-700', bgClass: 'bg-emerald-100', borderClass: 'border-l-emerald-500 border-slate-200' }
  else if (value <= 1.0) return { label: 'PERINGATAN', textClass: 'text-amber-700', bgClass: 'bg-amber-100', borderClass: 'border-l-amber-400 border-amber-200' }
  else return { label: 'BAHAYA', textClass: 'text-red-700', bgClass: 'bg-red-100', borderClass: 'border-l-red-500 border-red-200' }
}
const getCOStatus = (value) => {
  if (value === 0 && apiError.value) return { label: 'OFFLINE', textClass: 'text-slate-500', bgClass: 'bg-slate-100', borderClass: 'border-l-slate-400 border-slate-200' }
  if (value < 25) return { label: 'AMAN', textClass: 'text-emerald-700', bgClass: 'bg-emerald-100', borderClass: 'border-l-emerald-500 border-slate-200' }
  else if (value <= 50) return { label: 'PERINGATAN', textClass: 'text-amber-700', bgClass: 'bg-amber-100', borderClass: 'border-l-amber-400 border-amber-200' }
  else return { label: 'BAHAYA', textClass: 'text-red-700', bgClass: 'bg-red-100', borderClass: 'border-l-red-500 border-red-200' }
}

// --- KONFIGURASI GRAFIK APEXCHARTS ---
const pueChartOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#334155'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { categories: ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Hari Ini'], axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { min: 0.0, max: 2.0, tickAmount: 4 },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})

const bbmHarianOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true } },
  colors: ['#475569', '#94a3b8'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'top', horizontalAlign: 'right' },
  xaxis: { categories: ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Hari Ini'], axisBorder: { show: false }, axisTicks: { show: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})

const bbmBulananOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true } },
  colors: ['#0284c7', '#0ea5e9', '#7dd3fc'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'top', horizontalAlign: 'right' },
  xaxis: { categories: ['M-6', 'M-5', 'M-4', 'M-3', 'M-2', 'M-1', 'Bulan Ini'], axisBorder: { show: false }, axisTicks: { show: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.4s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* CSS Baru yang memastikan posisi tidak tergeser ke kiri */
.animate-slide-down-center { animation: slideDownCenter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes slideDownCenter { 
  from { opacity: 0; transform: translateY(-100%); } 
  to { opacity: 1; transform: translateY(0); } 
}
</style>