<template>
  <div class="p-4 bg-slate-50 min-h-screen flex flex-col">
    
    <!-- HEADER (Margin diperkecil menjadi mb-4) -->
    <div class="mb-2">
      <h1 class="text-xl font-bold text-slate-800 mb-1">Sistem Kontrol Penyiraman</h1>
      <p class="text-slate-500 text-xs">Panel kendali penyiraman rooftop via Microcontroller (Arduino).</p>
    </div>

    <!-- KONTEN: 1 Kartu Utama di Tengah (pt-10 dihilangkan agar jarak ke atas merapat) -->
    <div class="flex-1 flex items-start justify-center pt-2">
      
      <Card title="Panel Kontrol Penyiraman" class="w-full max-w-lg shadow-lg border-t-4 border-t-sky-500 relative overflow-hidden">
        
        <!-- Overlay Global Saat Loading (Mencegah klik apapun selama 5 detik) -->
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
              title="Klik untuk simulasi putus/sambung koneksi"
            >
              <div class="relative flex h-2.5 w-2.5">
                <span v-if="isArduinoConnected" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5" :class="isArduinoConnected ? 'bg-emerald-500' : 'bg-red-500'"></span>
              </div>
              <span class="text-[10px] font-bold">{{ isArduinoConnected ? 'CONNECTED' : 'DISCONNECTED' }}</span>
            </div>
          </div>

          <!-- 2. STATUS POMPA AIR (Sekarang Otomatis, Tanpa Tombol Switch) -->
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
            
            <!-- Indikator Pompa (Sama seperti Arduino) -->
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

          <!-- 3. TOMBOL PEMBUKAAN VALVE (Logika Tunggal & Loading 5 Detik) -->
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
                
                <!-- Ikon akan berubah menjadi loading (spinner) jika sedang diproses -->
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
            <span>Last Command Sync:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
          </div>
        </template>
      </Card>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import Card from '@/components/Card.vue'
import { Cpu, Power, Droplets, Loader2 } from '@lucide/vue' // Import Loader2 untuk spinner animasi

// --- STATE SISTEM ---
const isArduinoConnected = ref(true)
const isLoading = ref(false)
const processingIndex = ref(null)

const valves = ref([
  { name: 'Valve 1', isOpen: false },
  { name: 'Valve 2', isOpen: false },
  { name: 'Valve 3', isOpen: false }
])

// --- LOGIKA POMPA OTOMATIS ---
// Pompa akan otomatis ON jika ada SETIDAKNYA SATU valve yang terbuka.
const isPumpOn = computed(() => {
  return valves.value.some(valve => valve.isOpen)
})

// --- FUNGSI INTERAKSI ---
const toggleArduino = () => {
  if (isLoading.value) return // Cegah klik saat loading
  isArduinoConnected.value = !isArduinoConnected.value
  
  if (!isArduinoConnected.value) {
    valves.value.forEach(v => v.isOpen = false)
  }
}

const toggleValve = (index) => {
  if (!isArduinoConnected.value || isLoading.value) return // Cegah klik ganda
  
  isLoading.value = true // Aktifkan overlay loading
  processingIndex.value = index // Tandai valve mana yang sedang di-klik
  
  // Ambil status valve saat ini sebelum ditutup semua
  const isCurrentlyOpen = valves.value[index].isOpen
  
  // 1. Matikan semua valve terlebih dahulu
  valves.value.forEach(v => v.isOpen = false)
  
  // 2. Jika valve yang diklik sebelumnya TERTUTUP, maka buka. 
  // (Jika sebelumnya TERBUKA, biarkan saja tertutup sesuai logika toggle)
  if (!isCurrentlyOpen) {
    valves.value[index].isOpen = true
  }
  
  // 3. Jeda eksekusi (Cooldown 5 Detik)
  setTimeout(() => {
    isLoading.value = false
    processingIndex.value = null
  }, 5000)
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