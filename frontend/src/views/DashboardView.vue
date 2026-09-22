<template>
  <div class="p-4 bg-slate-300 min-h-screen relative">
    
    <ConnectionNotif ref="notifRef" />

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
              <p class="font-bold text-center py-2" :class="apiError || pueStats.current === null ? 'text-xl text-slate-400 italic mt-2' : 'text-4xl text-slate-700'">
                {{ apiError ? 'Offline' : (pueStats.current !== null ? pueStats.current : 'Tidak ada data') }}
              </p>
              <template #footer><div class="flex justify-between text-[10px] text-slate-400"><span>Update:</span><span class="font-medium">{{ lastUpdated }}</span></div></template>
            </Card>
            <Card title="PUE Minimum (7 Hari)">
              <p class="font-bold text-center py-2" :class="apiError || pueStats.min === null ? 'text-xl text-slate-400 italic mt-2' : 'text-4xl text-slate-700'">
                {{ apiError ? 'Offline' : (pueStats.min !== null ? pueStats.min : 'Tidak ada data') }}
              </p>
              <template #footer><div class="flex justify-between text-[10px] text-slate-400"><span>Update:</span><span class="font-medium">{{ lastUpdated }}</span></div></template>
            </Card>
            <Card title="PUE Maksimum (7 Hari)">
              <p class="font-bold text-center py-2" :class="apiError || pueStats.max === null ? 'text-xl text-slate-400 italic mt-2' : 'text-4xl text-slate-700'">
                {{ apiError ? 'Offline' : (pueStats.max !== null ? pueStats.max : 'Tidak ada data') }}
              </p>
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
              <div class="flex flex-col items-center justify-center py-4">
                <p class="font-bold text-center mb-1" :class="apiError || suhuDC === null ? 'text-2xl text-slate-400 italic mt-2' : 'text-5xl text-sky-600'">
                  {{ apiError ? 'Offline' : (suhuDC !== null ? suhuDC : 'Tidak ada data') }}<span v-if="suhuDC !== null && !apiError" class="text-2xl opacity-70">°C</span>
                </p>
                <span class="text-[10px] font-bold px-3 py-1 rounded-full tracking-wider border mt-2" 
                      :class="apiError ? 'bg-slate-100 text-slate-500 border-slate-200' : (suhuDC === null ? 'bg-slate-100 text-slate-500 border-slate-200' : (suhuDC <= 24 ? 'bg-sky-100 text-sky-700 border-sky-200' : 'bg-red-100 text-red-700 border-red-200'))">
                  {{ apiError ? 'OFFLINE' : (suhuDC === null ? 'NO DATA' : (suhuDC <= 24 ? 'NORMAL' : 'PERINGATAN')) }}
                </span>
              </div>
              <template #footer><div class="flex justify-between text-[10px] text-slate-400"><span>Update:</span><span class="font-medium">{{ lastUpdated }}</span></div></template>
            </Card>
            
            <!-- Okupansi -->
            <Card title="Okupansi Sumber Daya">
              <div class="flex flex-col justify-center h-full gap-3 py-1">
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-xs font-medium" :class="apiError || okupansi.trafo === null ? 'text-slate-400' : 'text-slate-700'">Trafo</span>
                    <span class="text-xs font-bold" :class="apiError || okupansi.trafo === null ? 'text-slate-400 italic' : 'text-slate-800'">
                      {{ apiError ? 'Offline' : (okupansi.trafo !== null ? okupansi.trafo + '%' : 'No Data') }}
                    </span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5">
                    <div class="h-2.5 rounded-full transition-all duration-500" 
                         :class="apiError || okupansi.trafo === null ? 'bg-slate-300' : 'bg-blue-600'" 
                         :style="{ width: (okupansi.trafo || 0) + '%' }"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-xs font-medium" :class="apiError || okupansi.pln === null ? 'text-slate-400' : 'text-slate-700'">PLN</span>
                    <span class="text-xs font-bold" :class="apiError || okupansi.pln === null ? 'text-slate-400 italic' : 'text-slate-800'">
                      {{ apiError ? 'Offline' : (okupansi.pln !== null ? okupansi.pln + '%' : 'No Data') }}
                    </span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5">
                    <div class="h-2.5 rounded-full transition-all duration-500" 
                         :class="apiError || okupansi.pln === null ? 'bg-slate-300' : 'bg-amber-500'" 
                         :style="{ width: (okupansi.pln || 0) + '%' }"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-xs font-medium" :class="apiError || okupansi.genset === null ? 'text-slate-400' : 'text-slate-700'">Genset</span>
                    <span class="text-xs font-bold" :class="apiError || okupansi.genset === null ? 'text-slate-400 italic' : 'text-slate-800'">
                      {{ apiError ? 'Offline' : (okupansi.genset !== null ? okupansi.genset + '%' : 'No Data') }}
                    </span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5">
                    <div class="h-2.5 rounded-full transition-all duration-500" 
                         :class="apiError || okupansi.genset === null ? 'bg-slate-300' : 'bg-emerald-500'" 
                         :style="{ width: (okupansi.genset || 0) + '%' }"></div>
                  </div>
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
                  <div v-for="(room, index) in co2Data" :key="index" class="px-3 py-2 rounded-xl border flex justify-between items-center shadow-sm border-l-4 transition-colors" :class="[getCO2Status(room.value).boxBg, getCO2Status(room.value).borderClass, getCO2Status(room.value).blink ? 'blink-danger' : '']">
                    <div>
                      <span class="text-xs text-slate-800 font-bold block mb-1">{{ room.name }}</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="[getCO2Status(room.value).badgeBg, getCO2Status(room.value).textClass]">{{ getCO2Status(room.value).label }}</span>
                    </div>
                    <div class="text-right">
                      <template v-if="apiError">
                        <span class="text-xs font-semibold text-slate-500 italic">Offline</span>
                      </template>
                      <template v-else-if="room.value === null">
                        <span class="text-xs font-semibold text-slate-500 italic">Tidak ada data</span>
                      </template>
                      <template v-else>
                        <span class="text-lg font-bold text-slate-800">{{ room.value }}</span><span class="text-[10px] text-slate-500 ml-1">ppm</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <!-- H2 -->
              <div v-if="h2Data.length">
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Gas Hidrogen (H2)</h3>
                <div class="flex flex-col gap-2">
                  <div v-for="(room, index) in h2Data" :key="index" class="px-3 py-2 rounded-xl border flex justify-between items-center shadow-sm border-l-4 transition-colors" :class="[getH2Status(room.value).boxBg, getH2Status(room.value).borderClass, getH2Status(room.value).blink ? 'blink-danger' : '']">
                    <div>
                      <span class="text-xs text-slate-800 font-bold block mb-1">{{ room.name }}</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="[getH2Status(room.value).badgeBg, getH2Status(room.value).textClass]">{{ getH2Status(room.value).label }}</span>
                    </div>
                    <div class="text-right">
                      <template v-if="apiError">
                        <span class="text-xs font-semibold text-slate-500 italic">Offline</span>
                      </template>
                      <template v-else-if="room.value === null">
                        <span class="text-xs font-semibold text-slate-500 italic">Tidak ada data</span>
                      </template>
                      <template v-else>
                        <span class="text-base font-bold text-slate-800">{{ room.value }}</span><span class="text-[10px] text-slate-500 ml-1">%</span>
                      </template>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CO GENSET -->
              <div v-if="coGensetData.length">
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 mt-2">Gas Carbon (CO)</h3>
                <div class="flex flex-col gap-2">
                  <div v-for="(genset, index) in coGensetData" :key="index" class="px-3 py-2 rounded-xl border flex justify-between items-center shadow-sm border-l-4 transition-colors" :class="[getCOStatus(genset.value).boxBg, getCOStatus(genset.value).borderClass, getCOStatus(genset.value).blink ? 'blink-danger' : '']">
                    <div>
                      <span class="text-xs text-slate-800 font-bold block mb-1">{{ genset.name }}</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="[getCOStatus(genset.value).badgeBg, getCOStatus(genset.value).textClass]">{{ getCOStatus(genset.value).label }}</span>
                    </div>
                    <div class="text-right">
                      <template v-if="apiError">
                        <span class="text-xs font-semibold text-slate-500 italic">Offline</span>
                      </template>
                      <template v-else-if="genset.value === null">
                        <span class="text-xs font-semibold text-slate-500 italic">Tidak ada data</span>
                      </template>
                      <template v-else>
                        <span class="text-base font-bold text-slate-800">{{ genset.value }}</span><span class="text-[10px] text-slate-500 ml-1">ppm</span>
                      </template>
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
import ConnectionNotif from '@/components/ConnectionNotif.vue'
import api from '@/services/api' 

// --- NOTIFIKASI ERROR/RECONNECT KONEKSI ---
const apiError = ref(false)
const notifRef = ref(null)

// Inisialisasi awal menggunakan null agar memunculkan indikator tidak ada data
const pueStats = ref({ current: null, min: null, max: null })
const suhuDC = ref(null)
const okupansi = ref({ trafo: null, pln: null, genset: null })

const co2Data = ref([{ name: 'Ruang Control', value: null }, { name: 'Ruang Vendor', value: null }])
const h2Data = ref([
  { name: 'R. Baterai Lt 2', value: null }, 
  { name: 'R. Baterai Lt 3', value: null },
  { name: 'R. Baterai Lt 4', value: null }, 
  { name: 'Utility A Lt 5', value: null }, 
  { name: 'Utility B Lt 5', value: null }
])
const coGensetData = ref([{ name: 'Genset 1', value: null }, { name: 'Genset 2', value: null }, { name: 'Genset 3', value: null }])

// Grafik diinisialisasi kosong (array kosong []) agar menampilkan blank canvas
const pueChartSeries = ref([{ name: 'Nilai PUE', data: [] }])
const bbmHarianSeries = ref([{ name: 'Tangki Harian 1', data: [] }, { name: 'Tangki Harian 2', data: [] }])
const bbmBulananSeries = ref([
  { name: 'Tangki Bulanan 1', data: [] }, { name: 'Tangki Bulanan 2', data: [] }, { name: 'Tangki Bulanan 3', data: [] }
])

// --- FUNGSI UPDATE TEXT GRAFIK KOSONG ---
const updateChartNoDataText = (text) => {
  pueChartOptions.value = { ...pueChartOptions.value, noData: { ...pueChartOptions.value.noData, text } }
  bbmHarianOptions.value = { ...bbmHarianOptions.value, noData: { ...bbmHarianOptions.value.noData, text } }
  bbmBulananOptions.value = { ...bbmBulananOptions.value, noData: { ...bbmBulananOptions.value.noData, text } }
}

// --- FETCH DATA API BACKEND ---
const fetchDashboardData = async () => {
  try {
    const res = await api.get('/dashboard')
    const d = res.data

    if (apiError.value) {
      apiError.value = false
      notifRef.value?.showSuccess('Koneksi Tersambung Kembali', 'Data dashboard berhasil dimuat ulang.')
    }

    // Jika berhasil tersambung namun data kosong, tampilkan "Tidak ada data"
    updateChartNoDataText('Tidak ada data')

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
    if (!apiError.value) {
      apiError.value = true
      notifRef.value?.showError('Koneksi Backend Terputus!', 'Gagal mengambil data.')
    }

    // Jika API Error / Backend Putus, ubah grafik menjadi Offline
    updateChartNoDataText('Offline')

    // Reset data UI ke fallback (null / empty array)
    pueStats.value = { current: null, min: null, max: null }
    suhuDC.value = null
    okupansi.value = { trafo: null, pln: null, genset: null }

    co2Data.value = [{ name: 'Ruang Control', value: null }, { name: 'Ruang Vendor', value: null }]
    h2Data.value = [
      { name: 'R. Baterai Lt 2', value: null }, 
      { name: 'R. Baterai Lt 3', value: null },
      { name: 'R. Baterai Lt 4', value: null }, 
      { name: 'Utility A Lt 5', value: null }, 
      { name: 'Utility B Lt 5', value: null }
    ]
    coGensetData.value = [{ name: 'Genset 1', value: null }, { name: 'Genset 2', value: null }, { name: 'Genset 3', value: null }]
    
    // Kosongkan Grafik
    pueChartSeries.value = [{ name: 'Nilai PUE', data: [] }]
    bbmHarianSeries.value = [{ name: 'Tangki Harian 1', data: [] }, { name: 'Tangki Harian 2', data: [] }]
    bbmBulananSeries.value = [
      { name: 'Tangki Bulanan 1', data: [] }, { name: 'Tangki Bulanan 2', data: [] }, { name: 'Tangki Bulanan 3', data: [] }
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
})

// --- LOGIKA STATUS WARNA GAS ---
const getCO2Status = (value) => {
  if (apiError.value) return { label: 'OFFLINE', textClass: 'text-slate-500', badgeBg: 'bg-slate-200', boxBg: 'bg-slate-50', borderClass: 'border-l-slate-400 border-slate-200', blink: false }
  if (value === null || value === undefined) return { label: 'NO DATA', textClass: 'text-slate-500', badgeBg: 'bg-slate-200', boxBg: 'bg-slate-50', borderClass: 'border-l-slate-400 border-slate-200', blink: false }
  if (value < 1000) return { label: 'AMAN', textClass: 'text-emerald-900', badgeBg: 'bg-emerald-500/60', boxBg: 'bg-emerald-200', borderClass: 'border-l-emerald-500 border-emerald-200', blink: false }
  else if (value <= 2000) return { label: 'PERINGATAN', textClass: 'text-amber-900', badgeBg: 'bg-amber-500/60', boxBg: 'bg-amber-200', borderClass: 'border-l-amber-400 border-amber-200', blink: false }
  else return { label: 'BAHAYA', textClass: 'text-red-900', badgeBg: 'bg-red-500/60', boxBg: 'bg-red-200', borderClass: 'border-l-red-500 border-red-200', blink: true }
}

const getH2Status = (value) => {
  if (apiError.value) return { label: 'OFFLINE', textClass: 'text-slate-500', badgeBg: 'bg-slate-200', boxBg: 'bg-slate-50', borderClass: 'border-l-slate-400 border-slate-200', blink: false }
  if (value === null || value === undefined) return { label: 'NO DATA', textClass: 'text-slate-500', badgeBg: 'bg-slate-200', boxBg: 'bg-slate-50', borderClass: 'border-l-slate-400 border-slate-200', blink: false }
  if (value < 0.5) return { label: 'AMAN', textClass: 'text-emerald-900', badgeBg: 'bg-emerald-500/60', boxBg: 'bg-emerald-200', borderClass: 'border-l-emerald-500 border-emerald-200', blink: false }
  else if (value <= 1.0) return { label: 'PERINGATAN', textClass: 'text-amber-900', badgeBg: 'bg-amber-500/60', boxBg: 'bg-amber-200', borderClass: 'border-l-amber-400 border-amber-200', blink: false }
  else return { label: 'BAHAYA', textClass: 'text-red-900', badgeBg: 'bg-red-500/60', boxBg: 'bg-red-200', borderClass: 'border-l-red-500 border-red-200', blink: true }
}

const getCOStatus = (value) => {
  if (apiError.value) return { label: 'OFFLINE', textClass: 'text-slate-500', badgeBg: 'bg-slate-200', boxBg: 'bg-slate-50', borderClass: 'border-l-slate-400 border-slate-200', blink: false }
  if (value === null || value === undefined) return { label: 'NO DATA', textClass: 'text-slate-500', badgeBg: 'bg-slate-200', boxBg: 'bg-slate-50', borderClass: 'border-l-slate-400 border-slate-200', blink: false }
  if (value < 25) return { label: 'AMAN', textClass: 'text-emerald-900', badgeBg: 'bg-emerald-500/60', boxBg: 'bg-emerald-200', borderClass: 'border-l-emerald-500 border-emerald-200', blink: false }
  else if (value <= 50) return { label: 'PERINGATAN', textClass: 'text-amber-900', badgeBg: 'bg-amber-500/60', boxBg: 'bg-amber-200', borderClass: 'border-l-amber-400 border-amber-200', blink: false }
  else return { label: 'BAHAYA', textClass: 'text-red-900', badgeBg: 'bg-red-500/60', boxBg: 'bg-red-200', borderClass: 'border-l-red-500 border-red-200', blink: true }
}

// --- KONFIGURASI GRAFIK APEXCHARTS ---
const pueChartOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
  colors: ['#334155'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { categories: ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Hari Ini'], axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { min: 1.4, max: 2.0, tickAmount: 2 },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  noData: { text: 'Tidak ada data', align: 'center', verticalAlign: 'middle', style: { color: '#94a3b8', fontSize: '14px', fontFamily: 'inherit' } }
})

const bbmHarianOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true } },
  colors: ['#475569', '#94a3b8'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'top', horizontalAlign: 'right' },
  xaxis: { categories: ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Hari Ini'], axisBorder: { show: false }, axisTicks: { show: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  noData: { text: 'Tidak ada data', align: 'center', verticalAlign: 'middle', style: { color: '#94a3b8', fontSize: '14px', fontFamily: 'inherit' } }
})

const bbmBulananOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false }, animations: { enabled: true } },
  colors: ['#0284c7', '#0ea5e9', '#7dd3fc'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'top', horizontalAlign: 'right' },
  xaxis: { categories: ['M-6', 'M-5', 'M-4', 'M-3', 'M-2', 'M-1', 'Bulan Ini'], axisBorder: { show: false }, axisTicks: { show: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  noData: { text: 'Tidak ada data', align: 'center', verticalAlign: 'middle', style: { color: '#94a3b8', fontSize: '14px', fontFamily: 'inherit' } }
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.animate-zoom-in { animation: zoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }

/* Kedip merah untuk kartu gas yang berstatus BAHAYA */
.blink-danger { animation: blinkDanger 1s ease-in-out infinite; }
@keyframes blinkDanger {
  0%, 100% { background-color: rgb(254 202 202); border-color: rgb(220 38 38); box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.5); }
  50% { background-color: rgb(252 165 165); border-color: rgb(153 27 27); box-shadow: 0 0 10px 2px rgba(220, 38, 38, 0.6); }
}
</style>