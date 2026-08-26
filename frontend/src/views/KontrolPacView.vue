<template>
  <div class="p-4 bg-slate-50 min-h-screen flex flex-col">
    
    <!-- HEADER -->
    <div class="mb-2">
      <h1 class="text-xl font-bold text-slate-800 mb-1">Sistem Kontrol PAC</h1>
      <p class="text-slate-500 text-xs">Pemantauan dan pengaturan parameter otomatisasi Precision Air Conditioning.</p>
    </div>

    <div class="flex flex-col gap-2 animate-fade-in">
      
      <!-- ================= BARIS 1: STATUS RUANGAN (3 KARTU) ================= -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        
        <Card 
          v-for="(room, index) in rooms" 
          :key="index" 
          :title="room.name" 
          bodyClass="p-2"
          class="border-t-4 border-t-sky-500"
        >
          <!-- Sensor Suhu (Selalu 2 Sensor) -->
          <div class="grid grid-cols-2 gap-1 mb-2">
            <div v-for="(sensor, sIdx) in room.sensors" :key="sIdx" class="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center">
              <span class="text-[10px] text-slate-400 font-bold uppercase mb-1">Sensor {{ sIdx + 1 }}</span>
              <div class="flex items-start">
                <span class="text-xl font-bold text-slate-700">{{ sensor.temp }}</span>
                <span class="text-xs text-slate-400 mt-0.5">°C</span>
              </div>
            </div>
          </div>

          <hr class="border-slate-100 mb-4">

          <!-- Status PAC -->
          <div>
            <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">Status Unit PAC</p>
            <div class="flex justify-center gap-1">
              <div 
                v-for="(pac, pIdx) in room.pacs" 
                :key="pIdx"
                class="flex items-center gap-1 px-2 py-1.5 rounded-full border shadow-sm"
                :class="pac.isOn ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-slate-100 border-slate-200 text-slate-500'"
              >
                <Fan class="w-4 h-4" :class="pac.isOn ? 'animate-spin' : ''" />
                <span class="text-[10px] font-bold">{{ pac.name }}: {{ pac.isOn ? 'ON' : 'OFF' }}</span>
              </div>
            </div>
          </div>
        </Card>

      </div>

      <!-- ================= BARIS 2: KARTU PARAMETER OTOMATISASI ================= -->
      <Card title="Parameter Otomatisasi PAC" bodyClass="p-2" class="border-t-4 border-t-amber-500 relative overflow-hidden">
        
        <!-- Overlay Loading saat menyimpan -->
        <div v-if="isSaving" class="absolute inset-0 z-50 bg-slate-50/70 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-wait">
          <div class="bg-white px-5 py-4 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center gap-3">
            <Loader2 class="w-8 h-8 text-amber-500 animate-spin" />
            <span class="text-sm font-bold text-slate-700">Menyinkronkan Parameter ke Controller...</span>
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
              <!-- Toggle Switch -->
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
                <p class="text-[9px] text-slate-400 mt-1">PAC mati jika suhu di bawah ini.</p>
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-500 mb-1">Batas Atas (°C)</label>
                <input v-model="settings.tempMax" type="number" class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                <p class="text-[9px] text-slate-400 mt-1">PAC menyala jika suhu melewati ini.</p>
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
              <!-- Toggle Switch -->
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
            class="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-6 py-2.5 rounded-lg shadow-md transition-all flex items-center gap-2"
          >
            <Save class="w-4 h-4" />
            Simpan Parameter
          </button>
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
import { Fan, Thermometer, Clock, Save, Loader2 } from '@lucide/vue'

// --- DATA STATUS RUANGAN ---
const rooms = ref([
  {
    name: 'Ruang Baterai Lantai 2',
    sensors: [{ temp: 22.1 }, { temp: 22.4 }],
    pacs: [{ name: 'PAC 1', isOn: true }, { name: 'PAC 2', isOn: false }]
  },
  {
    name: 'Ruang Baterai Lantai 3',
    sensors: [{ temp: 23.5 }, { temp: 23.8 }],
    pacs: [{ name: 'PAC 1', isOn: true }, { name: 'PAC 2', isOn: true }]
  },
  {
    name: 'Ruang Baterai Lantai 4',
    sensors: [{ temp: 21.0 }, { temp: 21.3 }],
    pacs: [{ name: 'PAC 1', isOn: false }] // Lantai 4 hanya 1 PAC
  }
])

// --- STATE PARAMETER ---
const tempModeActive = ref(true)
const timeModeActive = ref(false)
const isSaving = ref(false)

const settings = ref({
  tempMin: 18,
  tempMax: 24,
  timeOn: '08:00',
  timeOff: '17:00'
})

// --- FUNGSI SIMPAN (Simulasi loading 2 detik) ---
const saveParameters = () => {
  isSaving.value = true
  // Simulasi proses pengiriman data ke backend/Arduino
  setTimeout(() => {
    isSaving.value = false
    alert('Parameter berhasil disinkronkan ke Controller PAC!')
  }, 2000)
}

// --- SETUP WAKTU UPDATE ---
const lastUpdated = ref('')
let timer = null
const updateTime = () => {
  const now = new Date()
  const pad = (num) => num.toString().padStart(2, '0')
  lastUpdated.value = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}
onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})
onUnmounted(() => { if (timer) clearInterval(timer) })
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>