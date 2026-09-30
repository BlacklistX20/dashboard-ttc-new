<template>
  <div class="p-4 bg-slate-300 min-h-screen flex flex-col">
    
    <ConnectionNotif ref="notifRef" />

    <!-- HEADER -->
    <div class="mb-2 flex items-center justify-between flex-wrap gap-2">
      <div>
        <h1 class="text-xl font-bold text-slate-800 mb-1">Sistem Kontrol PAC</h1>
        <p class="text-slate-500 text-xs">Pemantauan dan pengaturan parameter otomatisasi Precision Air Conditioning via MQTT.</p>
      </div>

      <!-- Badge status koneksi ke MQTT Broker -->
      <div 
        class="flex items-center gap-1.5 px-3 py-1.5 rounded-full border shadow-sm text-[11px] font-bold"
        :class="apiError ? 'bg-slate-100 border-slate-200 text-slate-500' : (mqttConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700')"
      >
        <Wifi v-if="!apiError && mqttConnected" class="w-3.5 h-3.5" />
        <WifiOff v-else class="w-3.5 h-3.5" />
        <span>MQTT Broker: {{ apiError ? 'Tidak diketahui' : (mqttConnected ? 'Tersambung' : 'Terputus') }}</span>
      </div>
    </div>

    <div class="flex flex-col gap-2 animate-fade-in">
      
      <!-- ================= BARIS 1: STATUS RUANGAN (3 KARTU) ================= -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        
        <Card 
          v-for="(room, index) in rooms" 
          :key="index" 
          :title="room.name" 
          bodyClass="p-2"
          class="border-t-4"
        >
          <!-- Sensor Suhu (Selalu 2 Sensor) -->
          <div class="grid grid-cols-2 gap-1 mb-2">
            <div v-for="(sensor, sIdx) in room.sensors" :key="sIdx" class="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center">
              <span class="text-[10px] text-slate-400 font-bold uppercase mb-1">Sensor {{ sIdx + 1 }}</span>
              <div class="flex items-start">
                <span class="font-bold" :class="apiError || sensor.temp === null ? 'text-sm text-slate-400 italic mt-1' : 'text-xl text-slate-700'">
                  {{ apiError ? 'Offline' : (sensor.temp !== null ? sensor.temp : '-') }}
                </span>
                <span v-if="!apiError && sensor.temp !== null" class="text-xs text-slate-400 mt-0.5 ml-0.5">°C</span>
              </div>
            </div>
          </div>

          <hr class="border-slate-100 mb-4">

          <!-- Status PAC -->
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Status Unit PAC</p>
            <div class="flex justify-center gap-1 flex-wrap">
              <div 
                v-for="(pac, pIdx) in room.pacs" 
                :key="pIdx"
                class="flex items-center gap-1 px-2 py-1.5 rounded-full border shadow-sm transition-colors"
                :class="isPacOffline(pac) ? 'bg-slate-100 border-slate-200 text-slate-400' : (pac.isOn ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-slate-50 border-slate-200 text-slate-500')"
              >
                <Fan class="w-4 h-4" :class="!isPacOffline(pac) && pac.isOn ? 'animate-spin' : ''" />
                <span class="text-[10px] font-bold">{{ pac.name }}: {{ isPacOffline(pac) ? 'OFFLINE' : (pac.isOn ? 'ON' : 'OFF') }}</span>
              </div>
            </div>
          </div>
        </Card>

      </div>

      <!-- Setting yang berlaku sekarang (teks, dari server; bukan bagian form) -->
        <div class="mt-1 bg-emerald-50 border border-emerald-200 rounded-lg p-2.5">
          <div class="flex justify-between items-center mb-1">
            <p class="text-[11px] font-bold text-emerald-800">Setting yang berlaku sekarang</p>
            <span v-if="activeSettingsAt" class="text-[9px] text-emerald-700">Diperbarui {{ activeSettingsAt }}</span>
          </div>
          <template v-if="activeSettings">
            <p class="text-[11px] text-slate-700">
              <b>Suhu : </b>
              <span v-if="activeSettings.tempMode">aktif, PAC mati saat ≤ {{ activeSettings.tempMin }}°C dan menyala saat ≥ {{ activeSettings.tempMax }}°C</span>
              <span v-else>nonaktif</span>
            </p>
            <p class="text-[11px] text-slate-700">
              <b>Jadwal : </b>
              <span v-if="activeSettings.timeMode">aktif, menyala {{ activeSettings.timeOn }} dan mati {{ activeSettings.timeOff }}</span>
              <span v-else>nonaktif</span>
            </p>
            <p v-if="!tempModeActive && !timeModeActive" class="mt-1 text-[11px] font-bold text-red-600">
              Semua mode nonaktif: PAC akan dimatikan.
            </p>
          </template>
          <p v-else class="text-[11px] text-slate-400">Belum ada data.</p>
          <p v-if="apiError && activeSettings" class="text-[9px] text-amber-700 mt-1">Gagal memuat data terbaru, menampilkan data terakhir.</p>
          <p class="text-[9px] text-slate-400 mt-1">Teks ini diperbarui tiap 60 detik dan setiap parameter baru disimpan. Isian form di atas tidak ikut berubah.</p>
        </div>

      <!-- ================= BARIS 2: KARTU PARAMETER OTOMATISASI ================= -->
      <Card title="Parameter Otomatisasi PAC" bodyClass="p-2" class="border-t-4 relative overflow-hidden">
        
        <!-- Overlay Loading saat menyimpan -->
        <div v-if="isSaving" class="absolute inset-0 z-50 bg-slate-50/70 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-wait">
          <div class="bg-white px-5 py-4 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center gap-3">
            <Loader2 class="w-8 h-8 text-amber-500 animate-spin" />
            <span class="text-sm font-bold text-slate-700">Menyinkronkan Parameter via MQTT...</span>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
          
          <!-- Mode 1: Berdasarkan Suhu -->
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
            <div class="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
              <div class="flex items-center gap-2">
                <Thermometer class="w-5 h-5 text-amber-500" />
                <h3 class="font-bold text-slate-700">Otomatisasi Suhu</h3>
              </div>
              <button 
                @click="tempModeActive = !tempModeActive"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="tempModeActive ? 'bg-amber-500' : 'bg-slate-300'"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="tempModeActive ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-2" :class="!tempModeActive ? 'opacity-50 pointer-events-none' : ''">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Batas Bawah (°C)</label>
                <input v-model="settings.tempMin" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                <p class="text-[9px] text-slate-400 mt-1">PAC mati saat suhu mencapai atau di bawah ini.</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Batas Atas (°C)</label>
                <input v-model="settings.tempMax" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                <p class="text-[9px] text-slate-400 mt-1">PAC menyala saat suhu mencapai atau melewati ini.</p>
              </div>
            </div>
          </div>

          <!-- Mode 2: Berdasarkan Jadwal (Jam) -->
          <div class="bg-white p-3 rounded-xl border border-slate-200 shadow-sm relative">
            <div class="flex justify-between items-center mb-2 border-b border-slate-100 pb-2">
              <div class="flex items-center gap-2">
                <Clock class="w-5 h-5 text-indigo-500" />
                <h3 class="font-bold text-slate-700">Otomatisasi Jadwal</h3>
              </div>
              <button 
                @click="timeModeActive = !timeModeActive"
                class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors"
                :class="timeModeActive ? 'bg-indigo-500' : 'bg-slate-300'"
              >
                <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="timeModeActive ? 'translate-x-6' : 'translate-x-1'" />
              </button>
            </div>
            
            <div class="grid grid-cols-2 gap-2" :class="!timeModeActive ? 'opacity-50 pointer-events-none' : ''">
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Jam Hidup</label>
                <input v-model="settings.timeOn" type="time" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Jam Mati</label>
                <input v-model="settings.timeOff" type="time" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500">
              </div>
            </div>
          </div>

        </div>

        <!-- Tombol Simpan -->
        <div class="mt-3 flex justify-end">
          <button 
            @click="saveParameters"
            :disabled="isSaving || apiError"
            class="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            <Save class="w-4 h-4" />
            Simpan Parameter
          </button>
        </div>

        <!-- Catatan aturan otomatisasi (sesuai logika firmware) -->
        <div class="mt-3 text-[10px] text-slate-500 bg-slate-50 border border-slate-200 rounded-lg p-2 leading-relaxed">
          <p>CATATAN</p>
          <p>• Jika mode suhu dan jadwal aktif bersamaan, kondisi yang tercapai lebih dulu menentukan status PAC.</p>
          <p>• Jeda minimum antar pergantian ON/OFF adalah 5 Menit (proteksi kompresor).</p>
          <p>• Jika data sensor atau waktu tidak diterima selama 30 detik, kondisi mode terkait diabaikan.</p>
        </div>

        <template #footer>
          <div class="flex justify-between items-center text-[10px] text-slate-400">
            <span>Last Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
          </div>
        </template>
      </Card>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Card from '@/components/Card.vue'
import ConnectionNotif from '@/components/ConnectionNotif.vue'
import { Fan, Thermometer, Clock, Save, Loader2, Wifi, WifiOff } from '@lucide/vue'
import api from '@/services/api'

// --- STATE SISTEM & NOTIFIKASI ---
const apiError = ref(false)
const notifRef = ref(null)
const isSaving = ref(false)
const mqttConnected = ref(false)

// --- DATA STATUS RUANGAN (Fallback null) ---
const rooms = ref([
  {
    name: 'Ruang Baterai Lantai 2',
    sensors: [{ temp: null }, { temp: null }],
    pacs: [{ name: 'PAC 1', isOn: false }, { name: 'PAC 2', isOn: false }]
  },
  {
    name: 'Ruang Baterai Lantai 3',
    sensors: [{ temp: null }, { temp: null }],
    pacs: [{ name: 'PAC 1', isOn: false }, { name: 'PAC 2', isOn: false }]
  },
  {
    name: 'Ruang Baterai Lantai 4',
    sensors: [{ temp: null }, { temp: null }],
    pacs: [{ name: 'PAC 1', isOn: false }]
  }
])

// --- STATE PARAMETER ---
const tempModeActive = ref(true)
const timeModeActive = ref(false)
const settings = ref({ tempMin: 18, tempMax: 24, timeOn: '08:00', timeOff: '17:00' })

// Setting yang sedang berlaku (dari server). Hanya ini yang ikut di-refresh oleh polling;
// form di atas hanya diisi SEKALI saat pertama kali data berhasil dimuat.
const activeSettings = ref(null)
const activeSettingsAt = ref('')
let formInitialized = false

const formatNow = () => {
  const now = new Date()
  const pad = (num) => num.toString().padStart(2, '0')
  return `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

// PAC dianggap offline jika API gagal, atau perangkat melaporkan offline (LWT/heartbeat).
// pac.online === null berarti perangkat lama tanpa presence -> tampil seperti biasa.
const isPacOffline = (pac) => apiError.value || pac.online === false

// --- FETCH DATA DARI API ---
const fetchPacData = async () => {
  if (isSaving.value) return; // Cegah overwrite state UI saat sedang menyimpan
  try {
    const res = await api.get('/pac')
    if (apiError.value) {
      apiError.value = false
      notifRef.value?.showSuccess('Tersambung', 'Data PAC berhasil disinkronkan.')
    }
    
    rooms.value = res.data.rooms
    mqttConnected.value = res.data.mqttConnected === true
    
    // Setting yang berlaku: selalu diperbarui dari server
    const s = res.data.settings
    const active = {
      tempMode: s.temp_mode === 1,
      timeMode: s.time_mode === 1,
      tempMin: s.temp_min,
      tempMax: s.temp_max,
      timeOn: String(s.time_on || '08:00').slice(0, 5),
      timeOff: String(s.time_off || '17:00').slice(0, 5)
    }
    activeSettings.value = active
    activeSettingsAt.value = formatNow()

    // Form hanya diisi sekali (pertama kali berhasil dimuat), selanjutnya tidak ditimpa
    if (!formInitialized) {
      tempModeActive.value = active.tempMode
      timeModeActive.value = active.timeMode
      settings.value = {
        tempMin: active.tempMin,
        tempMax: active.tempMax,
        timeOn: active.timeOn,
        timeOff: active.timeOff
      }
      formInitialized = true
    }
  } catch (error) {
    if (!apiError.value) {
      apiError.value = true
      notifRef.value?.showError('Koneksi Terputus!', 'Gagal memuat status PAC. Menampilkan status offline...')
    }
    // Set fallback offline
    mqttConnected.value = false
    rooms.value.forEach(room => {
      room.sensors.forEach(s => s.temp = null)
      room.pacs.forEach(p => p.isOn = false)
    })
  }
}

// --- FUNGSI SIMPAN KE API / MQTT ---
const validateForm = () => {
  const { tempMin, tempMax, timeOn, timeOff } = settings.value
  if (tempMin === '' || tempMax === '' || isNaN(Number(tempMin)) || isNaN(Number(tempMax))) {
    return 'Batas suhu harus berupa angka'
  }
  if (Number(tempMin) >= Number(tempMax)) {
    return 'Batas bawah suhu harus lebih kecil dari batas atas'
  }
  if (!timeOn || !timeOff) {
    return 'Jam hidup dan jam mati harus diisi'
  }
  return null
}

const saveParameters = async () => {
  const formError = validateForm()
  if (formError) {
    notifRef.value?.showError('Input Tidak Valid', formError)
    return
  }

  isSaving.value = true
  const payload = {
    tempModeActive: tempModeActive.value,
    timeModeActive: timeModeActive.value,
    tempMin: Number(settings.value.tempMin),
    tempMax: Number(settings.value.tempMax),
    timeOn: settings.value.timeOn,
    timeOff: settings.value.timeOff
  }
  
  try {
    const res = await api.post('/pac/settings', payload)
    mqttConnected.value = res.data.mqttConnected === true

    // Parameter sudah tersimpan di database -> perbarui teks setting yang berlaku
    activeSettings.value = {
      tempMode: payload.tempModeActive,
      timeMode: payload.timeModeActive,
      tempMin: payload.tempMin,
      tempMax: payload.tempMax,
      timeOn: payload.timeOn,
      timeOff: payload.timeOff
    }
    activeSettingsAt.value = formatNow()

    if (res.data.mqttConnected) {
      notifRef.value?.showSuccess('Berhasil', 'Parameter berhasil dipublish ke Controller via MQTT')
    } else {
      notifRef.value?.showError('Tersimpan, Belum Tersinkron', 'Parameter tersimpan di database, tapi MQTT Broker sedang terputus - belum tentu sampai ke perangkat')
    }
  } catch (error) {
    notifRef.value?.showError('Gagal', error.response?.data?.message || 'Server gagal meneruskan parameter ke MQTT Broker')
  } finally {
    isSaving.value = false
  }
}

// --- SETUP WAKTU UPDATE & POLLING ---
const lastUpdated = ref('')
let timer = null

const updateTime = () => {
  lastUpdated.value = formatNow()
}

onMounted(() => {
  updateTime()
  fetchPacData()
  timer = setInterval(() => {
    updateTime()
    fetchPacData()
  }, 60000)
})

onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>