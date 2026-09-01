<template>
  <div class="p-4 bg-slate-50 min-h-screen relative">

    <ConnectionNotif ref="notifRef" />

    <!-- HEADER & TAB RUANGAN -->
    <div class="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-800 mb-1">Monitoring CO2 Ruangan</h1>
        <p class="text-slate-500 text-xs">Pemantauan suhu, humidity, dan level CO2 di Ruang Vendor & Ruang Control.</p>
      </div>

      <!-- TAB RUANGAN -->
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
    </div>

    <!-- KONTEN RUANGAN AKTIF -->
    <div class="flex flex-col gap-4 animate-fade-in">

      <!-- BARIS 1: Kartu Suhu, Humidity, CO2 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Kartu Suhu -->
        <Card title="Suhu Ruangan" bodyClass="p-4">
          <div class="flex flex-col items-center justify-center py-2">
            <p class="text-4xl font-extrabold mb-1" :class="tempStatus.textClass">
              {{ currentRoom.temp.current }}<span class="text-xl font-bold opacity-60">°C</span>
            </p>
            <span
              class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 border"
              :class="[tempStatus.badgeBg, tempStatus.badgeText, tempStatus.badgeBorder]"
            >
              {{ tempStatus.label }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 1</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.temp.sensors[0].value }}°C</p>
            </div>
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 2</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.temp.sensors[1].value }}°C</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Min Hari Ini</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.temp.min }}°C</p>
            </div>
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Max Hari Ini</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.temp.max }}°C</p>
            </div>
          </div>
        </Card>

        <!-- Kartu Humidity -->
        <Card title="Humidity Ruangan" bodyClass="p-4">
          <div class="flex flex-col items-center justify-center py-2">
            <p class="text-4xl font-extrabold mb-1" :class="humStatus.textClass">
              {{ currentRoom.humidity.current }}<span class="text-xl font-bold opacity-60">%</span>
            </p>
            <span
              class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 border"
              :class="[humStatus.badgeBg, humStatus.badgeText, humStatus.badgeBorder]"
            >
              {{ humStatus.label }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 1</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.humidity.sensors[0].value }}%</p>
            </div>
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 2</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.humidity.sensors[1].value }}%</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Min Hari Ini</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.humidity.min }}%</p>
            </div>
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Max Hari Ini</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.humidity.max }}%</p>
            </div>
          </div>
        </Card>

        <!-- Kartu CO2 -->
        <Card title="CO2 Ruangan" bodyClass="p-4">
          <div class="flex flex-col items-center justify-center py-2">
            <p class="text-4xl font-extrabold mb-1" :class="co2Status.textClass">
              {{ currentRoom.co2.current }}<span class="text-base font-bold opacity-60"> ppm</span>
            </p>
            <span
              class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 border"
              :class="[co2Status.badgeBg, co2Status.badgeText, co2Status.badgeBorder]"
            >
              {{ co2Status.label }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 1</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.co2.sensors[0].value }} ppm</p>
            </div>
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 2</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.co2.sensors[1].value }} ppm</p>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Min Hari Ini</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.co2.min }} ppm</p>
            </div>
            <div>
              <p class="text-[9px] text-slate-400 font-bold uppercase">Max Hari Ini</p>
              <p class="text-sm font-bold text-slate-700">{{ currentRoom.co2.max }} ppm</p>
            </div>
          </div>
        </Card>
      </div>

      <!-- BARIS 2: Kartu Alert & Kartu Grafik -->
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <!-- Kartu Alert -->
        <Card title="Riwayat Alert" bodyClass="p-0">
          <div class="overflow-x-auto max-h-96 overflow-y-auto">
            <table class="w-full text-xs">
              <thead class="bg-slate-50 sticky top-0">
                <tr class="text-left text-slate-500">
                  <th class="px-4 py-2 font-bold">Waktu</th>
                  <th class="px-4 py-2 font-bold">Alert</th>
                  <th class="px-4 py-2 font-bold">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="alerts.length === 0">
                  <td colspan="3" class="px-4 py-6 text-center text-slate-400">Tidak ada alert</td>
                </tr>
                <tr v-for="(item, idx) in alerts" :key="idx" class="border-t border-slate-100">
                  <td class="px-4 py-2 text-slate-500 whitespace-nowrap">{{ formatAlertTime(item.time) }}</td>
                  <td class="px-4 py-2 text-slate-700 font-semibold">{{ item.alert }}</td>
                  <td class="px-4 py-2">
                    <span
                      class="text-[9px] font-bold px-2 py-1 rounded-full uppercase"
                      :class="item.status === 'bahaya' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'"
                    >
                      {{ item.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <!-- Kartu Grafik: 3 tren dalam 1 kartu -->
        <Card title="Tren Historis" bodyClass="p-3 flex flex-col gap-3">
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Suhu (°C)</p>
            <apexchart type="area" height="110" :options="chartOptionsTemp" :series="chartTempSeries"></apexchart>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Humidity (%)</p>
            <apexchart type="area" height="110" :options="chartOptionsHumidity" :series="chartHumiditySeries"></apexchart>
          </div>
          <div>
            <p class="text-[10px] font-bold text-slate-500 uppercase mb-1">CO2 (ppm)</p>
            <apexchart type="area" height="110" :options="chartOptionsCo2" :series="chartCo2Series"></apexchart>
          </div>
        </Card>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Card from '@/components/Card.vue'
import ConnectionNotif from '@/components/ConnectionNotif.vue'
import api from '@/services/api'

// --- KONTROL TAB RUANGAN ---
const activeTab = ref('vendor')
const tabs = ref([
  { id: 'vendor', label: 'Ruang Vendor' },
  { id: 'control', label: 'Ruang Control' }
])

// Rentang grafik tren dibuat tetap (tidak ada tombol pilihan) - 1 hari terakhir
const TREND_RANGE = '1d'

// --- NOTIFIKASI KONEKSI (komponen reusable) ---
const apiError = ref(false)
const notifRef = ref(null)

// ==========================================================
// AMBANG BATAS STATUS - PLACEHOLDER, GANTI SESUAI ANGKA KAMU
// ==========================================================
const THRESHOLDS = {
  temp: { dingin: 20, panas: 26 },        // < dingin = Dingin, > panas = Panas, di antaranya = Normal
  humidity: { kering: 30, lembab: 60 },   // < kering = Kering, > lembab = Lembab, di antaranya = Normal
  co2: { rendah: 400, tinggi: 1000 }      // < rendah = Rendah, > tinggi = Tinggi, di antaranya = Normal (ppm)
}

const getTempStatus = (v) => {
  if (v < THRESHOLDS.temp.dingin) return { label: 'DINGIN', textClass: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', badgeBorder: 'border-blue-200' }
  if (v > THRESHOLDS.temp.panas) return { label: 'PANAS', textClass: 'text-red-600', badgeBg: 'bg-red-100', badgeText: 'text-red-700', badgeBorder: 'border-red-200' }
  return { label: 'NORMAL', textClass: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200' }
}

const getHumidityStatus = (v) => {
  if (v < THRESHOLDS.humidity.kering) return { label: 'KERING', textClass: 'text-amber-500', badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200' }
  if (v > THRESHOLDS.humidity.lembab) return { label: 'LEMBAB', textClass: 'text-blue-600', badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', badgeBorder: 'border-blue-200' }
  return { label: 'NORMAL', textClass: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200' }
}

const getCo2Status = (v) => {
  if (v < THRESHOLDS.co2.rendah) return { label: 'RENDAH', textClass: 'text-sky-600', badgeBg: 'bg-sky-100', badgeText: 'text-sky-700', badgeBorder: 'border-sky-200' }
  if (v > THRESHOLDS.co2.tinggi) return { label: 'TINGGI', textClass: 'text-red-600', badgeBg: 'bg-red-100', badgeText: 'text-red-700', badgeBorder: 'border-red-200' }
  return { label: 'NORMAL', textClass: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200' }
}

// --- DATA REALTIME (Ruang Vendor & Ruang Control sekaligus) ---
const emptySensors = () => [{ name: 'Sensor 1', value: 0 }, { name: 'Sensor 2', value: 0 }]
const emptyRoom = () => ({
  temp: { current: 0, sensors: emptySensors(), min: 0, max: 0 },
  humidity: { current: 0, sensors: emptySensors(), min: 0, max: 0 },
  co2: { current: 0, sensors: emptySensors(), min: 0, max: 0 }
})
const roomData = ref({ vendor: emptyRoom(), control: emptyRoom() })
const currentRoom = computed(() => roomData.value[activeTab.value])

const tempStatus = computed(() => getTempStatus(currentRoom.value.temp.current))
const humStatus = computed(() => getHumidityStatus(currentRoom.value.humidity.current))
const co2Status = computed(() => getCo2Status(currentRoom.value.co2.current))

const fetchRealtime = async () => {
  try {
    const res = await api.get('/co2')
    if (apiError.value) {
      apiError.value = false
      notifRef.value?.showSuccess('Koneksi Tersambung Kembali', 'Data CO2 berhasil dimuat ulang.')
    }
    roomData.value = res.data
  } catch (err) {
    if (!apiError.value) {
      apiError.value = true
      notifRef.value?.showError('Koneksi Backend Terputus!', 'Gagal mengambil data CO2. Mereset sistem ke nilai 0...')
    }
    roomData.value = { vendor: emptyRoom(), control: emptyRoom() }
  }
}

// --- DATA ALERT (per ruangan aktif) ---
const alerts = ref([])
const fetchAlerts = async () => {
  try {
    const res = await api.get('/co2/alerts', { params: { room: activeTab.value } })
    alerts.value = res.data
  } catch (err) {
    alerts.value = []
  }
}
const formatAlertTime = (t) => {
  if (!t) return '-'
  const d = new Date(t)
  const pad = (n) => n.toString().padStart(2, '0')
  return `${pad(d.getDate())}-${pad(d.getMonth() + 1)}-${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

// --- DATA GRAFIK TREN (Suhu, Humidity, CO2 - 3 chart dalam 1 kartu) ---
const chartTempSeries = ref([])
const chartHumiditySeries = ref([])
const chartCo2Series = ref([])

// PENTING: ...commonChartOptions harus di level atas (bukan di-nest dalam chart:),
// kalau tidak ApexCharts mengabaikannya dan balik ke default (lihat catatan di KelistrikanView).
const commonChartOptions = {
  fontFamily: 'inherit',
  xaxis: { type: 'datetime', axisBorder: { show: false }, tooltip: { enabled: false }, labels: { style: { fontSize: '9px' } } },
  grid: { borderColor: '#f1f5f9', strokeDashArray: 4 },
  dataLabels: { enabled: false },
  markers: { size: 0 },
  tooltip: { x: { format: 'dd MMM yyyy, HH:mm' } }
}
const chartOptionsTemp = ref({
  ...commonChartOptions,
  chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } },
  colors: ['#f59e0b'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  stroke: { curve: 'smooth', width: 2 }
})
const chartOptionsHumidity = ref({
  ...commonChartOptions,
  chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } },
  colors: ['#0284c7'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  stroke: { curve: 'smooth', width: 2 }
})
const chartOptionsCo2 = ref({
  ...commonChartOptions,
  chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } },
  colors: ['#16a34a'],
  fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } },
  stroke: { curve: 'smooth', width: 2 }
})

const fetchTrend = async () => {
  try {
    const res = await api.get('/co2/trend', { params: { room: activeTab.value, range: TREND_RANGE } })
    chartTempSeries.value = [{ name: 'Suhu', data: res.data.temp }]
    chartHumiditySeries.value = [{ name: 'Humidity', data: res.data.humidity }]
    chartCo2Series.value = [{ name: 'CO2', data: res.data.co2 }]
  } catch (err) {
    chartTempSeries.value = []
    chartHumiditySeries.value = []
    chartCo2Series.value = []
  }
}

// --- Reload alert & tren saat pindah tab ruangan atau ganti range ---
watch(activeTab, () => { fetchAlerts(); fetchTrend() })

// --- LIFECYCLE ---
let timer = null
onMounted(() => {
  fetchRealtime()
  fetchAlerts()
  fetchTrend()
  timer = setInterval(() => {
    fetchRealtime() // Refresh kartu realtime tiap 5 detik (alert & tren tidak di-poll otomatis)
  }, 5000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>