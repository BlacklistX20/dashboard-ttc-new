<template>
  <!-- Background menggunakan gray-50/slate-50 agar tetap bersih -->
  <div class="p-6 bg-slate-50 min-h-screen">
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800">Dashboard Utama</h1>
      <p class="text-slate-500 text-sm">Monitoring Kelistrikan, Lingkungan, dan BBM Gedung</p>
    </div>
    
    <div class="flex flex-col gap-6">
      
      <!-- ================= SECTION ATAS ================= -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        <!-- KIRI: KELISTRIKAN & SUHU -->
        <div class="lg:col-span-3 flex flex-col gap-6">
          
          <!-- Baris 1: Kartu Statistik PUE -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="PUE Mingguan">
              <p class="text-5xl font-bold text-slate-700 text-center py-2">1.45</p>
              <template #footer>
                <div class="flex justify-between items-center text-xs text-slate-400">
                  <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
                </div>
              </template>
            </Card>
            <Card title="PUE Minimum">
              <p class="text-5xl font-bold text-slate-700 text-center py-2">1.20</p>
              <template #footer>
                <div class="flex justify-between items-center text-xs text-slate-400">
                  <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
                </div>
              </template>
            </Card>
            <Card title="PUE Maksimum">
              <p class="text-5xl font-bold text-slate-700 text-center py-2">1.80</p>
              <template #footer>
                <div class="flex justify-between items-center text-xs text-slate-400">
                  <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
                </div>
              </template>
            </Card>
          </div>

          <!-- Baris 2: Grafik PUE -->
          <Card title="Tren PUE (7 Hari Terakhir)">
            <apexchart type="area" height="280" :options="pueChartOptions" :series="pueChartSeries"></apexchart>
          </Card>

          <!-- Baris 3: Suhu Data Center & Okupansi -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Suhu -->
            <Card title="Suhu Data Center">
              <p class="text-5xl font-bold text-sky-600 text-center py-4">22°C</p>
              <div class="text-center mt-2">
                <span class="bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1 rounded-full">NORMAL</span>
              </div>
              <template #footer>
                <div class="flex justify-between items-center text-xs text-slate-400">
                  <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
                </div>
              </template>
            </Card>
            <!-- Okupansi: Warna dinetralkan agar tidak terlihat seperti alarm -->
            <Card title="Okupansi Sumber Daya">
              <div class="flex flex-col justify-center h-full gap-4 py-2">
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700">Trafo</span>
                    <span class="text-sm font-bold text-slate-900">75%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-3">
                    <div class="bg-slate-700 h-3 rounded-full" style="width: 75%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700">PLN</span>
                    <span class="text-sm font-bold text-slate-900">60%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-3">
                    <div class="bg-slate-500 h-3 rounded-full" style="width: 60%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-2">
                    <span class="text-sm font-medium text-slate-700">Genset</span>
                    <span class="text-sm font-bold text-slate-900">15%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-3">
                    <div class="bg-slate-400 h-3 rounded-full" style="width: 15%"></div>
                  </div>
                </div>
              </div>
              <template #footer>
                <div class="flex justify-between items-center text-xs text-slate-400">
                  <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
                </div>
              </template>
            </Card>
          </div>
        </div>

        <!-- KANAN: ENVIRONMENT GEDUNG -->
        <div class="lg:col-span-1">
          <Card title="Environment Gedung">
            <!-- CO2 -->
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 mt-1">Gas CO2</h3>
            <div class="flex flex-col gap-3 mb-6">
              <div 
                v-for="(room, index) in co2Data" :key="index"
                class="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm border-l-4"
                :class="getCO2Status(room.value).borderClass"
              >
                <div>
                  <span class="text-sm text-slate-700 font-medium block mb-1">{{ room.name }}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="[getCO2Status(room.value).bgClass, getCO2Status(room.value).textClass]">
                    {{ getCO2Status(room.value).label }}
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-xl font-bold text-slate-800">{{ room.value }}</span>
                  <span class="text-xs text-slate-500 ml-1">ppm</span>
                </div>
              </div>
            </div>
            <hr class="border-slate-100 mb-6">
            <!-- H2 -->
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Gas Hidrogen (H2)</h3>
            <div class="flex flex-col gap-3">
              <div 
                v-for="(room, index) in h2Data" :key="index"
                class="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm border-l-4"
                :class="getH2Status(room.value).borderClass"
              >
                <div>
                  <span class="text-sm text-slate-700 font-medium block mb-1">{{ room.name }}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full" :class="[getH2Status(room.value).bgClass, getH2Status(room.value).textClass]">
                    {{ getH2Status(room.value).label }}
                  </span>
                </div>
                <div class="text-right">
                  <span class="text-lg font-bold text-slate-800">{{ room.value }}</span>
                  <span class="text-xs text-slate-500 ml-1">%</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div> 

      <!-- ================= SECTION BAWAH (Grafik BBM) ================= -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Kapasitas Tangki Harian (Liter)">
          <apexchart type="area" height="300" :options="bbmHarianOptions" :series="bbmHarianSeries"></apexchart>
        </Card>
        <Card title="Kapasitas Tangki Bulanan (Liter)">
          <apexchart type="area" height="300" :options="bbmBulananOptions" :series="bbmBulananSeries"></apexchart>
        </Card>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Card from '@/components/Card.vue'

// --- Waktu Update ---
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
  timer = setInterval(updateTime, 1000) 
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// --- DATA ENVIRONMENT ---
const co2Data = ref([{ name: 'Ruang Control', value: 410 }, { name: 'Ruang Vendor', value: 1350 }])
const h2Data = ref([
  { name: 'R. Baterai Lt 1', value: 0.2 }, { name: 'R. Baterai Lt 2', value: 0.8 },
  { name: 'R. Baterai Lt 3', value: 1.2 }, { name: 'R. Baterai Lt 4', value: 0.15 },
  { name: 'R. Baterai Lt 5', value: 0.25 }
])

const getCO2Status = (value) => {
  if (value < 1000) return { label: 'AMAN', textClass: 'text-green-700', bgClass: 'bg-green-100', borderClass: 'border-l-green-500' }
  else if (value <= 2000) return { label: 'PERINGATAN', textClass: 'text-yellow-700', bgClass: 'bg-yellow-100', borderClass: 'border-l-yellow-400' }
  else return { label: 'BAHAYA', textClass: 'text-red-700', bgClass: 'bg-red-100', borderClass: 'border-l-red-500' }
}
const getH2Status = (value) => {
  if (value < 0.5) return { label: 'AMAN', textClass: 'text-green-700', bgClass: 'bg-green-100', borderClass: 'border-l-green-500' }
  else if (value <= 1.0) return { label: 'PERINGATAN', textClass: 'text-yellow-700', bgClass: 'bg-yellow-100', borderClass: 'border-l-yellow-400' }
  else return { label: 'BAHAYA', textClass: 'text-red-700', bgClass: 'bg-red-100', borderClass: 'border-l-red-500' }
}

// --- Grafik PUE (Warna Slate Premium) ---
const pueChartSeries = ref([{ name: 'Nilai PUE', data: [1.35, 1.42, 1.25, 1.50, 1.45, 1.30, 1.48] }])
const pueChartOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#334155'], // slate-700
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 3 },
  xaxis: { categories: ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'], axisBorder: { show: false }, axisTicks: { show: false } },
  yaxis: { min: 1.0, max: 2.0, tickAmount: 4 },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})

// --- Grafik Tangki Harian (Warna Abu/Slate) ---
const bbmHarianSeries = ref([
  { name: 'Tangki Harian 1', data: [900, 850, 780, 700, 620, 950, 850] },
  { name: 'Tangki Harian 2', data: [800, 750, 690, 600, 550, 880, 720] }
])
const bbmHarianOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#475569', '#94a3b8'], // slate-600, slate-400
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'top', horizontalAlign: 'right' },
  xaxis: { categories: ['H-6', 'H-5', 'H-4', 'H-3', 'H-2', 'H-1', 'Hari Ini'], axisBorder: { show: false }, axisTicks: { show: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})

// --- Grafik Tangki Bulanan (Warna Biru/Ocean) ---
const bbmBulananSeries = ref([
  { name: 'Tangki Bulanan 1', data: [4500, 4400, 4200, 3900, 3700, 3500, 4500] },
  { name: 'Tangki Bulanan 2', data: [4100, 4000, 3850, 3700, 3400, 3200, 3800] },
  { name: 'Tangki Bulanan 3', data: [3800, 3750, 3600, 3400, 3300, 3000, 4100] }
])
const bbmBulananOptions = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#0284c7', '#0ea5e9', '#7dd3fc'], // sky-600, sky-500, sky-300
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  legend: { position: 'top', horizontalAlign: 'right' },
  xaxis: { categories: ['M-6', 'M-5', 'M-4', 'M-3', 'M-2', 'M-1', 'Minggu Ini'], axisBorder: { show: false }, axisTicks: { show: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})
</script>