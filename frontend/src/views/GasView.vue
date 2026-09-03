<template>
  <div class="p-4 bg-slate-50 min-h-screen relative">
    <ConnectionNotif ref="notifRef" />

    <!-- HEADER & TAB RUANGAN -->
    <div class="mb-6 flex flex-col xl:flex-row xl:items-center justify-between gap-4">
      <div>
        <h1 class="text-xl font-bold text-slate-800 mb-1">Monitoring Gas Ruangan</h1>
        <p class="text-slate-500 text-xs">Pemantauan suhu, humidity, serta level gas CO2 dan Hidrogen di TTC Sudiang.</p>
      </div>

      <div class="flex flex-wrap items-center gap-3">
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
        
        <!-- TOMBOL DOWNLOAD -->
        <button 
          @click="isDownloadModalOpen = true"
          class="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-sm"
        >
          <Download class="w-4 h-4" />
          <span class="hidden sm:inline">Download Data</span>
        </button>
      </div>
    </div>

    <!-- KONTEN RUANGAN AKTIF -->
    <div class="flex flex-col gap-4 animate-fade-in">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Kartu Suhu -->
        <Card title="Suhu Ruangan" bodyClass="p-4">
          <div class="flex flex-col items-center justify-center py-2">
            <p class="text-4xl font-extrabold mb-1" :class="tempStatus.textClass">
              {{ currentRoom.temp.current }}<span class="text-xl font-bold opacity-60">°C</span>
            </p>
            <span class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 border" :class="[tempStatus.badgeBg, tempStatus.badgeText, tempStatus.badgeBorder]">
              {{ tempStatus.label }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 1</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.temp.sensors[0].value }}°C</p></div>
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 2</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.temp.sensors[1].value }}°C</p></div>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Min Hari Ini</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.temp.min }}°C</p></div>
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Max Hari Ini</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.temp.max }}°C</p></div>
          </div>
        </Card>

        <!-- Kartu Humidity -->
        <Card title="Humidity Ruangan" bodyClass="p-4">
          <div class="flex flex-col items-center justify-center py-2">
            <p class="text-4xl font-extrabold mb-1" :class="humStatus.textClass">
              {{ currentRoom.humidity.current }}<span class="text-xl font-bold opacity-60">%</span>
            </p>
            <span class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 border" :class="[humStatus.badgeBg, humStatus.badgeText, humStatus.badgeBorder]">
              {{ humStatus.label }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 1</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.humidity.sensors[0].value }}%</p></div>
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 2</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.humidity.sensors[1].value }}%</p></div>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Min Hari Ini</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.humidity.min }}%</p></div>
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Max Hari Ini</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.humidity.max }}%</p></div>
          </div>
        </Card>

        <!-- Kartu Gas (Dinamis: CO2 atau Hidrogen) -->
        <Card :title="`${gasLabel} Ruangan`" bodyClass="p-4">
          <div class="flex flex-col items-center justify-center py-2">
            <p class="text-4xl font-extrabold mb-1" :class="gasStatus.textClass">
              {{ currentRoom.gas.current }}<span class="text-base font-bold opacity-60"> ppm</span>
            </p>
            <span class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 border" :class="[gasStatus.badgeBg, gasStatus.badgeText, gasStatus.badgeBorder]">
              {{ gasStatus.label }}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 1</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.gas.sensors[0].value }} ppm</p></div>
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Sensor 2</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.gas.sensors[1].value }} ppm</p></div>
          </div>
          <div class="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-100 text-center">
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Min Hari Ini</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.gas.min }} ppm</p></div>
            <div><p class="text-[9px] text-slate-400 font-bold uppercase">Max Hari Ini</p><p class="text-sm font-bold text-slate-700">{{ currentRoom.gas.max }} ppm</p></div>
          </div>
        </Card>
      </div>

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
                <tr v-if="alerts.length === 0"><td colspan="3" class="px-4 py-6 text-center text-slate-400">Tidak ada alert</td></tr>
                <tr v-for="(item, idx) in alerts" :key="idx" class="border-t border-slate-100">
                  <td class="px-4 py-2 text-slate-500 whitespace-nowrap">{{ formatAlertTime(item.time) }}</td>
                  <td class="px-4 py-2 text-slate-700 font-semibold">{{ item.alert }}</td>
                  <td class="px-4 py-2">
                    <span class="text-[9px] font-bold px-2 py-1 rounded-full uppercase" :class="item.status === 'bahaya' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'">
                      {{ item.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

        <!-- Kartu Grafik -->
        <Card title="Tren Historis" bodyClass="p-3 flex flex-col gap-3">
          <div><p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Suhu (°C)</p><apexchart type="area" height="110" :options="chartOptionsTemp" :series="chartTempSeries"></apexchart></div>
          <div><p class="text-[10px] font-bold text-slate-500 uppercase mb-1">Humidity (%)</p><apexchart type="area" height="110" :options="chartOptionsHumidity" :series="chartHumiditySeries"></apexchart></div>
          <div><p class="text-[10px] font-bold text-slate-500 uppercase mb-1">{{ gasLabel }} (ppm)</p><apexchart type="area" height="110" :options="chartOptionsGas" :series="chartGasSeries"></apexchart></div>
        </Card>
      </div>
    </div>

    <!-- MODAL DOWNLOAD -->
    <div v-if="isDownloadModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isDownloadModalOpen = false"></div>
      <div class="bg-white w-full max-w-md rounded-2xl shadow-2xl relative z-10 overflow-hidden">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div><h2 class="text-base font-bold text-slate-800">Download Data Gas</h2><p class="text-xs text-slate-500">Pilih format dan rentang tanggal</p></div>
          <button @click="isDownloadModalOpen = false" class="p-1.5 bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors"><X class="w-4 h-4" /></button>
        </div>
        <form @submit.prevent="handleDownload" class="p-5 flex flex-col gap-4">
          <div>
            <label class="block text-xs font-bold text-slate-600 mb-1">Ruangan</label>
            <select v-model="downloadForm.room" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-sky-500">
              <option value="vendor">Ruang Vendor (CO2)</option>
              <option value="control">Ruang Control (CO2)</option>
              <option value="battery2">Battery Lt 2 (Hidrogen)</option>
              <option value="battery3">Battery Lt 3 (Hidrogen)</option>
              <option value="battery4">Battery Lt 4 (Hidrogen)</option>
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
            <div><label class="block text-xs font-bold text-slate-600 mb-1">Start Date</label><input v-model="downloadForm.startDate" type="date" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700"></div>
            <div><label class="block text-xs font-bold text-slate-600 mb-1">End Date</label><input v-model="downloadForm.endDate" type="date" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700"></div>
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
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Card from '@/components/Card.vue'
import ConnectionNotif from '@/components/ConnectionNotif.vue'
import { Download, Loader2, X } from '@lucide/vue'
import api from '@/services/api'

const activeTab = ref('vendor')
const tabs = ref([
  { id: 'vendor', label: 'Ruang Vendor' },
  { id: 'control', label: 'Ruang Control' },
  { id: 'battery2', label: 'Battery Lt 2' },
  { id: 'battery3', label: 'Battery Lt 3' },
  { id: 'battery4', label: 'Battery Lt 4' }
])

const gasLabel = computed(() => ['vendor', 'control'].includes(activeTab.value) ? 'CO2' : 'Hidrogen')
const TREND_RANGE = '1d'

const apiError = ref(false)
const notifRef = ref(null)

const THRESHOLDS = {
  temp: { dingin: 20, panas: 26 },
  humidity: { kering: 30, lembab: 60 },
  co2: { rendah: 400, tinggi: 1000 },
  hydrogen: { rendah: 50, tinggi: 200 } // Sesuaikan batas aman Hidrogen Anda
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

const getGasStatus = (v, type) => {
  const limits = type === 'CO2' ? THRESHOLDS.co2 : THRESHOLDS.hydrogen
  if (v < limits.rendah) return { label: 'RENDAH', textClass: 'text-sky-600', badgeBg: 'bg-sky-100', badgeText: 'text-sky-700', badgeBorder: 'border-sky-200' }
  if (v > limits.tinggi) return { label: 'TINGGI / BAHAYA', textClass: 'text-red-600', badgeBg: 'bg-red-100', badgeText: 'text-red-700', badgeBorder: 'border-red-200' }
  return { label: 'NORMAL', textClass: 'text-emerald-600', badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200' }
}

const emptySensors = () => [{ name: 'Sensor 1', value: 0 }, { name: 'Sensor 2', value: 0 }]
const emptyRoom = () => ({
  temp: { current: 0, sensors: emptySensors(), min: 0, max: 0 },
  humidity: { current: 0, sensors: emptySensors(), min: 0, max: 0 },
  gas: { current: 0, sensors: emptySensors(), min: 0, max: 0 }
})

const roomData = ref({
  vendor: emptyRoom(), control: emptyRoom(),
  battery2: emptyRoom(), battery3: emptyRoom(), battery4: emptyRoom()
})
const currentRoom = computed(() => roomData.value[activeTab.value])

const tempStatus = computed(() => getTempStatus(currentRoom.value.temp.current))
const humStatus = computed(() => getHumidityStatus(currentRoom.value.humidity.current))
const gasStatus = computed(() => getGasStatus(currentRoom.value.gas.current, gasLabel.value))

const fetchRealtime = async () => {
  try {
    const res = await api.get('/gas')
    if (apiError.value) {
      apiError.value = false
      notifRef.value?.showSuccess('Koneksi Tersambung Kembali', 'Data gas berhasil dimuat ulang.')
    }
    roomData.value = res.data
  } catch (err) {
    if (!apiError.value) {
      apiError.value = true
      notifRef.value?.showError('Koneksi Backend Terputus!', 'Gagal mengambil data gas. Mereset sistem ke nilai 0...')
    }
    Object.keys(roomData.value).forEach(key => roomData.value[key] = emptyRoom())
  }
}

const alerts = ref([])
const fetchAlerts = async () => {
  try {
    const res = await api.get('/gas/alerts', { params: { room: activeTab.value } })
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

const isDownloadModalOpen = ref(false)
const isDownloading = ref(false)
const downloadForm = ref({ room: 'vendor', format: 'excel', startDate: '', endDate: '' })

const handleDownload = async () => {
  isDownloading.value = true
  try {
    const response = await api.get('/gas/export', { params: downloadForm.value, responseType: 'blob' })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    const ext = downloadForm.value.format === 'pdf' ? 'pdf' : 'xlsx'
    link.setAttribute('download', `Gas_${downloadForm.value.room}_${downloadForm.value.startDate}_${downloadForm.value.endDate}.${ext}`)
    document.body.appendChild(link); link.click(); link.remove()
    isDownloadModalOpen.value = false
  } catch (error) {
    alert('Gagal menghubungi server untuk download.')
  } finally {
    isDownloading.value = false
  }
}

const chartTempSeries = ref([])
const chartHumiditySeries = ref([])
const chartGasSeries = ref([])

const commonChartOptions = { fontFamily: 'inherit', xaxis: { type: 'datetime', axisBorder: { show: false }, tooltip: { enabled: false }, labels: { style: { fontSize: '9px' } } }, grid: { borderColor: '#f1f5f9', strokeDashArray: 4 }, dataLabels: { enabled: false }, markers: { size: 0 }, tooltip: { x: { format: 'dd MMM yyyy, HH:mm' } } }
const chartOptionsTemp = ref({ ...commonChartOptions, chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } }, colors: ['#f59e0b'], fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } }, stroke: { curve: 'smooth', width: 2 } })
const chartOptionsHumidity = ref({ ...commonChartOptions, chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } }, colors: ['#0284c7'], fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } }, stroke: { curve: 'smooth', width: 2 } })
const chartOptionsGas = ref({ ...commonChartOptions, chart: { type: 'area', toolbar: { show: false }, animations: { enabled: false } }, colors: ['#16a34a'], fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0, stops: [0, 90, 100] } }, stroke: { curve: 'smooth', width: 2 } })

const fetchTrend = async () => {
  try {
    const res = await api.get('/gas/trend', { params: { room: activeTab.value, range: TREND_RANGE } })
    chartTempSeries.value = [{ name: 'Suhu', data: res.data.temp }]
    chartHumiditySeries.value = [{ name: 'Humidity', data: res.data.humidity }]
    chartGasSeries.value = [{ name: gasLabel.value, data: res.data.gas }]
  } catch (err) {
    chartTempSeries.value = []; chartHumiditySeries.value = []; chartGasSeries.value = []
  }
}

watch(activeTab, () => { fetchAlerts(); fetchTrend() })

let timer = null
onMounted(() => {
  fetchRealtime(); fetchAlerts(); fetchTrend()
  timer = setInterval(() => { fetchRealtime() }, 5000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>