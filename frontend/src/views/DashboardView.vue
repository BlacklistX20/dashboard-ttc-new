<template>
  <!-- Padding utama diperkecil dari p-6 menjadi p-4 -->
  <div class="p-4 bg-slate-50 min-h-screen">
    
    <!-- Margin bottom diperkecil dari mb-8 menjadi mb-4 -->
    <div class="mb-4">
      <h1 class="text-2xl font-bold text-slate-800">Dashboard Utama</h1>
      <p class="text-slate-500 text-sm">Monitoring Kelistrikan, Lingkungan, dan BBM Gedung</p>
    </div>
    
    <!-- Gap utama diperkecil dari gap-6 menjadi gap-4 -->
    <div class="flex flex-col gap-4">
      
      <!-- ================= SECTION ATAS ================= -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        
        <!-- KIRI: KELISTRIKAN & SUHU -->
        <div class="lg:col-span-3 flex flex-col gap-4">
          
          <!-- Baris 1: Kartu Statistik PUE -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="PUE Mingguan">
              <p class="text-4xl font-bold text-slate-700 text-center py-2">1.45</p>
              <template #footer>
                <div class="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
                </div>
              </template>
            </Card>
            <Card title="PUE Minimum">
              <p class="text-4xl font-bold text-slate-700 text-center py-2">1.20</p>
              <template #footer>
                <div class="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
                </div>
              </template>
            </Card>
            <Card title="PUE Maksimum">
              <p class="text-4xl font-bold text-slate-700 text-center py-2">1.80</p>
              <template #footer>
                <div class="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
                </div>
              </template>
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
              <p class="text-5xl font-bold text-sky-600 text-center py-4">22°C</p>
              <div class="text-center mt-1">
                <span class="bg-sky-100 text-sky-700 text-[10px] font-bold px-3 py-1 rounded-full tracking-wider">NORMAL</span>
              </div>
              <template #footer>
                <div class="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
                </div>
              </template>
            </Card>
            
            <!-- Okupansi -->
            <Card title="Okupansi Sumber Daya">
              <div class="flex flex-col justify-center h-full gap-3 py-1">
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-xs font-medium text-slate-700">Trafo</span>
                    <span class="text-xs font-bold text-slate-900">75%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5">
                    <div class="bg-slate-700 h-2.5 rounded-full" style="width: 75%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-xs font-medium text-slate-700">PLN</span>
                    <span class="text-xs font-bold text-slate-900">60%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5">
                    <div class="bg-slate-500 h-2.5 rounded-full" style="width: 60%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between mb-1.5">
                    <span class="text-xs font-medium text-slate-700">Genset</span>
                    <span class="text-xs font-bold text-slate-900">15%</span>
                  </div>
                  <div class="w-full bg-slate-100 rounded-full h-2.5">
                    <div class="bg-slate-400 h-2.5 rounded-full" style="width: 15%"></div>
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
        </div>

        <!-- KANAN: ENVIRONMENT GEDUNG -->
        <div class="lg:col-span-1">
          <Card title="Environment Gedung" bodyClass="p-4">
            <div class="flex flex-col gap-4">
              
              <!-- CO2 -->
              <div>
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gas CO2</h3>
                <div class="flex flex-col gap-2">
                  <div 
                    v-for="(room, index) in co2Data" :key="index"
                    class="bg-white px-3 py-2 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm border-l-4"
                    :class="getCO2Status(room.value).borderClass"
                  >
                    <div>
                      <span class="text-xs text-slate-700 font-medium block mb-1">{{ room.name }}</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="[getCO2Status(room.value).bgClass, getCO2Status(room.value).textClass]">
                        {{ getCO2Status(room.value).label }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="text-lg font-bold text-slate-800">{{ room.value }}</span>
                      <span class="text-[10px] text-slate-500 ml-1">ppm</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- H2 -->
              <div>
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gas Hidrogen (H2)</h3>
                <div class="flex flex-col gap-2">
                  <div 
                    v-for="(room, index) in h2Data" :key="index"
                    class="bg-white px-3 py-2 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm border-l-4"
                    :class="getH2Status(room.value).borderClass"
                  >
                    <div>
                      <span class="text-xs text-slate-700 font-medium block mb-1">{{ room.name }}</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="[getH2Status(room.value).bgClass, getH2Status(room.value).textClass]">
                        {{ getH2Status(room.value).label }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="text-base font-bold text-slate-800">{{ room.value }}</span>
                      <span class="text-[10px] text-slate-500 ml-1">%</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- CO GENSET (BARU DITAMBAHKAN) -->
              <div>
                <h3 class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Gas Carbon (CO) Genset</h3>
                <div class="flex flex-col gap-2">
                  <div 
                    v-for="(genset, index) in coGensetData" :key="index"
                    class="bg-white px-3 py-2 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm border-l-4"
                    :class="getCOStatus(genset.value).borderClass"
                  >
                    <div>
                      <span class="text-xs text-slate-700 font-medium block mb-1">{{ genset.name }}</span>
                      <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" :class="[getCOStatus(genset.value).bgClass, getCOStatus(genset.value).textClass]">
                        {{ getCOStatus(genset.value).label }}
                      </span>
                    </div>
                    <div class="text-right">
                      <span class="text-base font-bold text-slate-800">{{ genset.value }}</span>
                      <span class="text-[10px] text-slate-500 ml-1">ppm</span>
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
import api from '@/services/api' // Disiapkan untuk koneksi Backend

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

// --- DATA ENVIRONMENT LOKAL (Fallback) ---
const co2Data = ref([{ name: 'Ruang Control', value: 410 }, { name: 'Ruang Vendor', value: 1350 }])
const h2Data = ref([
  { name: 'R. Baterai Lt 1', value: 0.2 }, { name: 'R. Baterai Lt 2', value: 0.8 },
  { name: 'R. Baterai Lt 3', value: 1.2 }, { name: 'R. Baterai Lt 4', value: 0.15 },
  { name: 'R. Baterai Lt 5', value: 0.25 }
])

// --- DATA GAS CARBON GENSET (BARU) ---
const coGensetData = ref([
  { name: 'Genset 1', value: 12 },
  { name: 'Genset 2', value: 18 },
  { name: 'Genset 3', value: 45 } // Contoh Peringatan
])

// --- FUNGSI STATUS WARNA ---
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

// Logika Status Gas CO Genset (Standar Umum: <25 Aman, 25-50 Peringatan, >50 Bahaya)
const getCOStatus = (value) => {
  if (value < 25) return { label: 'AMAN', textClass: 'text-green-700', bgClass: 'bg-green-100', borderClass: 'border-l-green-500' }
  else if (value <= 50) return { label: 'PERINGATAN', textClass: 'text-yellow-700', bgClass: 'bg-yellow-100', borderClass: 'border-l-yellow-400' }
  else return { label: 'BAHAYA', textClass: 'text-red-700', bgClass: 'bg-red-100', borderClass: 'border-l-red-500' }
}

// --- FETCH DATA DARI API BACKEND (OTOMATIS) ---
const fetchDashboardData = async () => {
  try {
    const response = await api.get('/dashboard-env')
    if (response.data) {
      if (response.data.co2Data) co2Data.value = response.data.co2Data
      if (response.data.h2Data) h2Data.value = response.data.h2Data
      if (response.data.coGensetData) coGensetData.value = response.data.coGensetData
    }
  } catch (error) {
    // Jika API belum siap, aplikasi akan tetap berjalan dengan data fallback di atas
  }
}

onMounted(() => {
  updateTime()
  fetchDashboardData()
  timer = setInterval(() => {
    updateTime()
    fetchDashboardData() // Refresh data API secara berkala
  }, 5000) 
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

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