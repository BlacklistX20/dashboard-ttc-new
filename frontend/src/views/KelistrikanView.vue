<template>
  <div class="p-6 bg-slate-50 min-h-screen">
    
    <!-- HEADER & TAB NAVIGATION -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-slate-800 mb-2">Kelistrikan Gedung</h1>
      <p class="text-slate-500 text-sm mb-6">Monitoring Real-time Parameter Kelistrikan TTC Sudiang</p>
      
      <!-- TAB BUTTONS -->
      <div class="flex space-x-1 bg-slate-200/60 p-1 rounded-xl max-w-2xl">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all"
          :class="activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ================= TAB 1: PANEL UTAMA ================= -->
    <div v-if="activeTab === 'panel'" class="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      
      <!-- KIRI: Kartu Real-time Berjejer ke Bawah (1 Kolom) -->
      <div class="flex flex-col gap-6">
        <!-- PUE -->
        <Card title="PUE Realtime">
          <p class="text-5xl font-bold text-slate-700 text-center py-6">1.42</p>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
        
        <!-- LVMDP -->
        <Card title="LVMDP Realtime">
          <div class="text-center py-2 border-b border-slate-100 mb-4 pb-4">
            <span class="text-4xl font-bold text-sky-600">850</span>
            <span class="text-sm text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="grid grid-cols-3 text-center gap-2">
            <div><p class="text-xs text-slate-400 uppercase font-bold">Tegangan</p><p class="text-lg font-bold text-slate-700">380 V</p></div>
            <div class="border-l border-r border-slate-100"><p class="text-xs text-slate-400 uppercase font-bold">Arus</p><p class="text-lg font-bold text-slate-700">1291 A</p></div>
            <div><p class="text-xs text-slate-400 uppercase font-bold">Frekuensi</p><p class="text-lg font-bold text-slate-700">50 Hz</p></div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>

        <!-- IT Load -->
        <Card title="IT Load Realtime">
          <div class="text-center py-2 border-b border-slate-100 mb-4 pb-4">
            <span class="text-4xl font-bold text-sky-600">603</span>
            <span class="text-sm text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="grid grid-cols-3 text-center gap-2">
            <div><p class="text-xs text-slate-400 uppercase font-bold">Tegangan</p><p class="text-lg font-bold text-slate-700">380 V</p></div>
            <div class="border-l border-r border-slate-100"><p class="text-xs text-slate-400 uppercase font-bold">Arus</p><p class="text-lg font-bold text-slate-700">916 A</p></div>
            <div><p class="text-xs text-slate-400 uppercase font-bold">Frekuensi</p><p class="text-lg font-bold text-slate-700">50 Hz</p></div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
      </div>

      <!-- KANAN: Grafik Tren di Samping (2 Kolom) -->
      <div class="lg:col-span-2 flex flex-col gap-6">
        <Card title="Tren PUE">
          <apexchart type="area" height="195" :options="chartOptionsSingle" :series="[{ name: 'PUE', data: [1.35, 1.4, 1.45, 1.42] }]"></apexchart>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
        <Card title="Tren LVMDP (kVA)">
          <apexchart type="area" height="230" :options="chartOptionsSingle" :series="[{ name: 'LVMDP', data: [820, 840, 830, 850] }]"></apexchart>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
        <Card title="Tren IT Load (kVA)">
          <apexchart type="area" height="230" :options="chartOptionsSingle" :series="[{ name: 'IT Load', data: [590, 610, 600, 603] }]"></apexchart>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
      </div>
    </div>


    <!-- ================= TAB 2: SISTEM UPS ================= -->
    <div v-if="activeTab === 'ups'" class="flex flex-col gap-6 animate-fade-in">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- UPS Total -->
        <Card title="Total UPS Load Realtime" class="lg:col-span-1 border-l-4 border-l-sky-500">
          <div class="text-center py-2 border-b border-slate-100 mb-4 pb-4">
            <span class="text-5xl font-bold text-sky-600">425</span>
            <span class="text-sm text-slate-500 ml-1 font-bold">kVA</span>
          </div>
          <div class="grid grid-cols-3 text-center gap-2">
            <div><p class="text-xs text-slate-400 uppercase font-bold">Tegangan</p><p class="text-lg font-bold text-slate-700">380 V</p></div>
            <div class="border-l border-r border-slate-100"><p class="text-xs text-slate-400 uppercase font-bold">Arus</p><p class="text-lg font-bold text-slate-700">645 A</p></div>
            <div><p class="text-xs text-slate-400 uppercase font-bold">Frekuensi</p><p class="text-lg font-bold text-slate-700">50 Hz</p></div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>

        <!-- UPS Individual -->
        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          <Card v-for="ups in upsList" :key="ups.name" :title="ups.name">
            <div class="text-center mb-3">
              <span class="text-3xl font-bold text-slate-700">{{ ups.kva }}</span>
              <span class="text-xs text-slate-500 ml-1">kVA</span>
            </div>
            <div class="grid grid-cols-3 text-center gap-1 border-t border-slate-50 pt-2">
              <div><p class="text-[10px] text-slate-400 uppercase font-bold">V</p><p class="text-sm font-bold text-slate-600">{{ ups.v }}</p></div>
              <div class="border-l border-r border-slate-100"><p class="text-[10px] text-slate-400 uppercase font-bold">A</p><p class="text-sm font-bold text-slate-600">{{ ups.a }}</p></div>
              <div><p class="text-[10px] text-slate-400 uppercase font-bold">Hz</p><p class="text-sm font-bold text-slate-600">{{ ups.hz }}</p></div>
            </div>
            <template #footer><div class="flex justify-between items-center text-[9px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
          </Card>
        </div>
      </div>

      <Card title="Grafik Tren Beban UPS Gabungan (kVA)">
        <apexchart type="line" height="300" :options="chartOptionsCombined" :series="upsSeries"></apexchart>
        <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
      </Card>
    </div>


    <!-- ================= TAB 3: SISTEM RECTIFIER ================= -->
    <div v-if="activeTab === 'rectifier'" class="flex flex-col gap-6 animate-fade-in">
      
      <!-- Grid 5 Kolom: Kartu Total (makan 2 kolom) + Individual Rectifier -->
      <div class="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        
        <!-- Recti Total (Panjangnya 2 Kartu = lg:col-span-2) -->
        <Card title="Total Rectifier Load Realtime" class="lg:col-span-2 border-l-4 border-l-sky-500">
          <div class="flex justify-around items-center h-full">
            <div class="text-center">
              <span class="text-5xl font-bold text-sky-600">312</span>
              <span class="text-sm text-slate-500 ml-1 font-bold">kVA</span>
            </div>
            <div class="flex flex-col gap-2 text-right">
              <p class="text-sm"><span class="text-slate-400 uppercase font-bold text-xs mr-2">Tegangan:</span> <span class="font-bold text-slate-700">380 V</span></p>
              <p class="text-sm"><span class="text-slate-400 uppercase font-bold text-xs mr-2">Arus:</span> <span class="font-bold text-slate-700">474 A</span></p>
              <p class="text-sm"><span class="text-slate-400 uppercase font-bold text-xs mr-2">Frekuensi:</span> <span class="font-bold text-slate-700">50 Hz</span></p>
            </div>
          </div>
          <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>

        <!-- 14 Rectifier Individual (Otomatis mengisi ruang kosong di sebelah Total) -->
        <Card v-for="recti in rectiList" :key="recti.name" :title="recti.name">
          <div class="text-center mb-2">
            <span class="text-2xl font-bold text-slate-700">{{ recti.kva }}</span>
            <span class="text-[10px] text-slate-500 ml-1">kVA</span>
          </div>
          <div class="flex justify-between border-t border-slate-50 pt-2 px-1">
            <div class="text-center"><p class="text-[9px] text-slate-400 font-bold">V</p><p class="text-xs font-bold text-slate-600">{{ recti.v }}</p></div>
            <div class="text-center"><p class="text-[9px] text-slate-400 font-bold">A</p><p class="text-xs font-bold text-slate-600">{{ recti.a }}</p></div>
            <div class="text-center"><p class="text-[9px] text-slate-400 font-bold">Hz</p><p class="text-xs font-bold text-slate-600">{{ recti.hz }}</p></div>
          </div>
          <!-- Footer fontnya sangat kecil agar kartu tetap compact -->
          <template #footer><div class="flex justify-between items-center text-[9px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
        </Card>
      </div>

      <!-- Grafik Tren Gabungan Recti -->
      <Card title="Grafik Tren Beban Rectifier Gabungan (kVA)">
        <apexchart type="line" height="350" :options="chartOptionsCombined" :series="rectiSeries"></apexchart>
        <template #footer><div class="flex justify-between items-center text-[10px] text-slate-400"><span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span></div></template>
      </Card>
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

// --- KONTROL TAB ---
const activeTab = ref('panel')
const tabs = ref([
  { id: 'panel', label: 'Main Panel & PUE' },
  { id: 'ups', label: 'Sistem UPS' },
  { id: 'rectifier', label: 'Sistem Rectifier' }
])

// --- DATA DUMMY ---
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
    name: `Recti ${name}`,
    kva: (Math.random() * 20 + 10).toFixed(1),
    v: 380, a: Math.floor(Math.random() * 30 + 20), hz: 50
  }))
)

// --- KONFIGURASI GRAFIK ---
const chartOptionsSingle = ref({
  chart: { type: 'area', fontFamily: 'inherit', toolbar: { show: false } },
  colors: ['#0284c7'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  dataLabels: { enabled: false },
  stroke: { curve: 'smooth', width: 2 },
  xaxis: { categories: ['09:00', '10:00', '11:00', '12:00'], axisBorder: { show: false }, axisTicks: { show: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})

const chartOptionsCombined = ref({
  chart: { type: 'line', fontFamily: 'inherit', toolbar: { show: true } },
  colors: ['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899'],
  dataLabels: { enabled: false },
  stroke: { curve: 'straight', width: 2 },
  legend: { position: 'right' },
  xaxis: { categories: ['09:00', '09:15', '09:30', '09:45', '10:00', '10:15'], axisBorder: { show: false } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }
})

const upsSeries = ref(upsList.value.map(ups => ({
  name: ups.name, data: Array.from({length: 6}, () => Math.floor(Math.random() * 10 + 40))
})))
const rectiSeries = ref(rectiList.value.slice(0, 6).map(recti => ({ 
  name: recti.name, data: Array.from({length: 6}, () => Math.floor(Math.random() * 10 + 15))
})))
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.4s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>