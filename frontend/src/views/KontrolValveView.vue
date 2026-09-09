<template>
  <div class="p-4 bg-slate-300 min-h-screen flex flex-col">
    
    <ConnectionNotif ref="notifRef" />

    <!-- HEADER -->
    <div class="mb-2">
      <h1 class="text-xl font-bold text-slate-800 mb-1">Sistem Kontrol Penyiraman</h1>
      <p class="text-slate-500 text-xs">Panel kendali penyiraman rooftop via Microcontroller (Arduino).</p>
    </div>

    <!-- KONTEN -->
    <div class="flex-1 flex items-start justify-center pt-2 animate-fade-in">
      
      <Card title="Panel Kontrol Penyiraman" class="w-full max-w-lg shadow-lg border-t-4 relative overflow-hidden">
        
        <!-- Overlay Loading saat memproses perintah -->
        <div v-if="isLoading" class="absolute inset-0 z-50 bg-slate-50/50 backdrop-blur-[1px] flex flex-col items-center justify-center cursor-wait">
          <div class="bg-white px-4 py-3 rounded-xl shadow-md border border-slate-200 flex items-center gap-3">
            <Loader2 class="w-5 h-5 text-sky-500 animate-spin" />
            <span class="text-sm font-bold text-slate-700">Memproses Perintah...</span>
          </div>
        </div>

        <div class="flex flex-col gap-3 py-4 px-1">
          
          <!-- 1. STATUS KONEKSI ARDUINO -->
          <div class="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                <Cpu class="w-6 h-6 text-slate-600" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Status Sistem</p>
                <p class="text-sm font-bold text-slate-800">Koneksi Arduino</p>
              </div>
            </div>
            
            <div 
              class="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm cursor-pointer transition-colors"
              :class="isArduinoConnected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'"
              @click="toggleArduino" 
              title="Klik untuk mengubah status server"
            >
              <div class="relative flex h-2.5 w-2.5">
                <span v-if="isArduinoConnected" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="isArduinoConnected ? 'bg-emerald-500' : 'bg-red-500'"></span>
              </div>
              <span class="text-[10px] font-bold">{{ isArduinoConnected ? 'CONNECTED' : 'DISCONNECTED' }}</span>
            </div>
          </div>

          <!-- 2. STATUS POMPA AIR (Dikendalikan oleh Backend) -->
          <div class="flex items-center justify-between bg-slate-50 p-2 rounded-xl border border-slate-100">
            <div class="flex items-center gap-3">
              <div class="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                <Power class="w-6 h-6" :class="isPumpOn ? 'text-sky-600' : 'text-slate-400'" />
              </div>
              <div>
                <p class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Water Pump</p>
                <p class="text-sm font-bold text-slate-800">Pompa Utama</p>
              </div>
            </div>
            
            <div 
              class="flex items-center gap-2 px-3 py-1.5 rounded-full border shadow-sm transition-colors"
              :class="isPumpOn ? 'bg-sky-50 border-sky-200 text-sky-700' : 'bg-slate-100 border-slate-200 text-slate-500'"
            >
              <div class="relative flex h-2.5 w-2.5">
                <span v-if="isPumpOn" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="isPumpOn ? 'bg-sky-500' : 'bg-slate-400'"></span>
              </div>
              <span class="text-[10px] font-bold">{{ isPumpOn ? 'ON' : 'OFF' }}</span>
            </div>
          </div>

          <hr class="border-slate-100">

          <!-- 3. TOMBOL KONTROL VALVE -->
          <div>
            <div class="mb-4">
              <p class="text-sm font-bold text-slate-800">Kontrol Valve (Katup Air)</p>
              <p class="text-[10px] text-slate-500">Hanya 1 valve yang dapat terbuka dalam satu waktu.</p>
            </div>
            
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="(valve, index) in valves" 
                :key="index"
                @click="toggleValve(index)"
                :disabled="!isArduinoConnected || isLoading"
                class="relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 overflow-hidden"
                :class="[
                  valve.isOpen 
                    ? 'border-sky-500 bg-sky-50 text-sky-700 shadow-md transform scale-[1.02]' 
                    : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50',
                  (!isArduinoConnected || isLoading) ? 'opacity-50 cursor-not-allowed hover:border-slate-200 hover:bg-white' : 'cursor-pointer'
                ]"
              >
                <!-- Background efek air -->
                <div v-if="valve.isOpen" class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-sky-200/50 to-transparent"></div>
                
                <Loader2 v-if="isLoading && processingIndex === index" class="w-8 h-8 mb-2 z-10 animate-spin text-sky-500" />
                <Droplets v-else class="w-8 h-8 mb-2 z-10" :class="valve.isOpen ? 'text-sky-500' : 'text-slate-400'" />
                
                <span class="font-bold text-sm z-10">{{ valve.name }}</span>
                <span class="text-[10px] font-bold uppercase mt-1 z-10 px-2 py-0.5 rounded-md" :class="valve.isOpen ? 'bg-sky-500 text-white' : 'bg-slate-200 text-slate-500'">
                  {{ valve.isOpen ? 'TERBUKA' : 'TUTUP' }}
                </span>
              </button>
            </div>
          </div>

        </div>

        <template #footer>
          <div class="flex justify-between items-center text-[10px] text-slate-400">
            <span>Sinkronisasi Terakhir:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
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
import { Cpu, Power, Droplets, Loader2 } from '@lucide/vue'
import api from '@/services/api'

// --- NOTIFIKASI ---
const notifRef = ref(null)

// --- STATE SISTEM ---
const isLoading = ref(false)
const processingIndex = ref(null)

const isArduinoConnected = ref(false)
const isPumpOn = ref(false)
const valves = ref([
  { code: 'VLV1', name: 'Valve 1', isOpen: false },
  { code: 'VLV2', name: 'Valve 2', isOpen: false },
  { code: 'VLV3', name: 'Valve 3', isOpen: false }
])

// --- FETCH DATA DARI DATABASE ---
const fetchStates = async () => {
  // Jangan tarik data di-background saat user sedang menunggu respons tombol
  if (isLoading.value) return; 

  try {
    const res = await api.get('/control/states')
    if (res.data.success) {
      const states = res.data.data // Contoh: { ARD1: 1, PMP1: 0, VLV1: 0, ... }
      
      isArduinoConnected.value = states['ARD1'] === 1
      isPumpOn.value = states['PMP1'] === 1
      
      valves.value[0].isOpen = states['VLV1'] === 1
      valves.value[1].isOpen = states['VLV2'] === 1
      valves.value[2].isOpen = states['VLV3'] === 1
    }
  } catch (error) {
    console.error("Gagal sinkronisasi data kontrol")
  }
}

// --- FUNGSI INTERAKSI KE BACKEND ---

// 1. Toggle Arduino Server (Simulasi Putus/Sambung)
const toggleArduino = async () => {
  if (isLoading.value) return
  isLoading.value = true
  
  const targetState = isArduinoConnected.value ? 0 : 1
  try {
    await api.post('/control/arduino', { state: targetState })
    await fetchStates()
    notifRef.value?.showSuccess('Sistem', `Server kontrol ${targetState === 1 ? 'diaktifkan' : 'dimatikan'}`)
  } catch (error) {
    notifRef.value?.showError('Error', 'Gagal merubah status server')
  } finally {
    isLoading.value = false
  }
}

// 2. Toggle Valve (Menembak HTTP ke Arduino via Backend)
const toggleValve = async (index) => {
  if (!isArduinoConnected.value || isLoading.value) return
  
  isLoading.value = true
  processingIndex.value = index
  
  const targetValve = valves.value[index]
  // Jika saat ini terbuka (true), perintahnya adalah tutup (0). Sebaliknya buka (1).
  const targetState = targetValve.isOpen ? 0 : 1

  try {
    const response = await api.post('/control/valve', {
      deviceCode: targetValve.code,
      targetState: targetState
    })

    if (response.data.success) {
      notifRef.value?.showSuccess('Sukses', `Perintah eksekusi dikirim ke ${targetValve.name}`)
      await fetchStates() // Tarik ulang status dari DB (Pompa akan otomatis ON/OFF)
    }
  } catch (error) {
    // Tangkap error dari backend (misal: timeout arduino mati)
    const errorMsg = error.response?.data?.message || 'Gagal menghubungi Controller Arduino'
    notifRef.value?.showError('Eksekusi Gagal', errorMsg)
  } finally {
    isLoading.value = false
    processingIndex.value = null
  }
}

// --- SETUP WAKTU UPDATE & POLLING ---
const lastUpdated = ref('')
let timer = null

const updateTime = () => {
  const now = new Date()
  const pad = (num) => num.toString().padStart(2, '0')
  lastUpdated.value = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}

onMounted(() => {
  updateTime()
  fetchStates()
  
  // Sinkronisasi data setiap 3 detik agar dashboard realtime
  timer = setInterval(() => {
    updateTime()
    fetchStates()
  }, 3000)
})

onUnmounted(() => { 
  if (timer) clearInterval(timer) 
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
</style>