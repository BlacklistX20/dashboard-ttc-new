<template>
  <div class="p-4 bg-slate-50 min-h-screen relative">
    
    <!-- HEADER & TAB NAVIGATION -->
    <div class="mb-6">
      <h1 class="text-xl font-bold text-slate-800 mb-1">Monitoring Suhu Ruangan</h1>
      <p class="text-slate-500 text-xs mb-4">Pemantauan suhu ruangan per lantai di gedung TTC Sudiang.</p>
      
      <!-- TAB BUTTONS (Ditambah Lantai 1) -->
      <div class="flex space-x-1 bg-slate-200/60 p-1 rounded-xl max-w-4xl">
        <button 
          v-for="tab in tabs" :key="tab.id"
          @click="activeTab = tab.id"
          class="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
          :class="activeTab === tab.id ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- KONTEN TAB (Grid Kartu Suhu) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-fade-in">
      
      <!-- Looping data ruangan berdasarkan tab yang aktif -->
      <!-- Properti class dinamis memanipulasi border dan background kartu -->
      <Card 
        v-for="(room, index) in roomData[activeTab]" 
        :key="index" 
        :title="room.name"
        bodyClass="p-4"
        class="border-t-4 transition-all"
        :class="[getTempStatus(room.avgTemp).borderClass, getTempStatus(room.avgTemp).cardBg]"
      >
        <!-- BODY KARTU: Menampilkan Rata-Rata Suhu -->
        <div class="flex flex-col items-center justify-center py-4">
          <!-- Warna angka suhu berubah sesuai status -->
          <p class="text-5xl font-extrabold mb-1" :class="getTempStatus(room.avgTemp).textClass">
            {{ room.avgTemp }}<span class="text-2xl font-bold opacity-60">°C</span>
          </p>
          
          <!-- Label Status (Dingin, Normal, Hangat, Panas) -->
          <span 
            class="text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mt-2 border"
            :class="[getTempStatus(room.avgTemp).badgeBg, getTempStatus(room.avgTemp).badgeText, getTempStatus(room.avgTemp).badgeBorder]"
          >
            {{ getTempStatus(room.avgTemp).label }}
          </span>
        </div>

        <!-- FOOTER KARTU: Tgl Update & Tombol Detail -->
        <template #footer>
          <div class="flex justify-between items-center w-full">
            <span class="text-[10px] text-slate-400 font-medium">{{ lastUpdated }}</span>
            <!-- Tombol juga menyesuaikan warna agar temanya konsisten -->
            <button 
              @click="openModal(room)"
              class="text-white text-[10px] font-bold px-3 py-1.5 rounded-md transition-colors shadow-sm"
              :class="getTempStatus(room.avgTemp).btnClass"
            >
              Detail
            </button>
          </div>
        </template>
      </Card>

    </div>

    <!-- ================= MODAL / WINDOW POP-UP DETAIL ================= -->
    <div v-if="isModalOpen" class="fixed inset-0 z-[100] flex items-center justify-center">
      
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" @click="closeModal"></div>
      
      <div class="bg-white w-full max-w-sm rounded-2xl shadow-2xl relative z-10 overflow-hidden animate-zoom-in">
        
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <div>
            <h2 class="text-lg font-bold text-slate-800">{{ selectedRoom.name }}</h2>
            <p class="text-xs text-slate-500">Detail Pembacaan Sensor</p>
          </div>
          <button @click="closeModal" class="p-1.5 bg-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600 rounded-full transition-colors">
            <X class="w-4 h-4" />
          </button>
        </div>

        <!-- Body Modal (Daftar Sensor Suhu) -->
        <div class="p-5 max-h-[60vh] overflow-y-auto">
          <div class="flex flex-col gap-3">
            <div 
              v-for="(sensor, idx) in selectedRoom.sensors" 
              :key="idx"
              class="flex justify-between items-center p-3 rounded-xl border-l-4"
              :class="[getTempStatus(sensor.temp).cardBg, getTempStatus(sensor.temp).borderClass]"
            >
              <div class="flex items-center gap-3">
                <Thermometer class="w-5 h-5" :class="getTempStatus(sensor.temp).textClass" />
                <!-- Penamaan diubah menjadi Sensor Suhu -->
                <span class="font-medium text-slate-700 text-sm">{{ sensor.name }}</span>
              </div>
              <div class="font-bold text-lg" :class="getTempStatus(sensor.temp).textClass">
                {{ sensor.temp }}<span class="text-sm opacity-60">°C</span>
              </div>
            </div>
          </div>
        </div>

        <div class="px-5 py-3 border-t border-slate-100 bg-slate-50 text-right">
          <button @click="closeModal" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-4 py-2 rounded-lg transition-colors">
            Tutup
          </button>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Card from '@/components/Card.vue'
import { X, Thermometer } from '@lucide/vue'

// --- LOGIKA STATUS WARNA (CORE LOGIC) ---
// <= 18 (Biru), > 18 s/d 24 (Hijau), > 24 s/d 29 (Kuning), > 29 (Merah)
const getTempStatus = (temp) => {
  if (temp <= 18) {
    return {
      label: 'DINGIN',
      textClass: 'text-blue-600',
      borderClass: 'border-t-blue-500',
      cardBg: 'bg-blue-50/30 border-blue-100',
      badgeBg: 'bg-blue-100', badgeText: 'text-blue-700', badgeBorder: 'border-blue-200',
      btnClass: 'bg-blue-600 hover:bg-blue-700'
    }
  } else if (temp > 18 && temp <= 24) {
    return {
      label: 'NORMAL',
      textClass: 'text-emerald-600',
      borderClass: 'border-t-emerald-500',
      cardBg: 'bg-emerald-50/30 border-emerald-100',
      badgeBg: 'bg-emerald-100', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200',
      btnClass: 'bg-emerald-600 hover:bg-emerald-700'
    }
  } else if (temp > 24 && temp <= 29) {
    return {
      label: 'HANGAT',
      textClass: 'text-amber-500',
      borderClass: 'border-t-amber-400',
      cardBg: 'bg-amber-50/30 border-amber-100',
      badgeBg: 'bg-amber-100', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200',
      btnClass: 'bg-amber-500 hover:bg-amber-600'
    }
  } else {
    // Lebih dari 29
    return {
      label: 'PANAS / BAHAYA',
      textClass: 'text-red-600',
      borderClass: 'border-t-red-500',
      cardBg: 'bg-red-50/30 border-red-100',
      badgeBg: 'bg-red-100', badgeText: 'text-red-700', badgeBorder: 'border-red-200',
      btnClass: 'bg-red-600 hover:bg-red-700'
    }
  }
}

// --- KONTROL TAB ---
const activeTab = ref('lt1') // Default dibuka di Lantai 1
const tabs = ref([
  { id: 'lt1', label: 'Lantai 1' },
  { id: 'lt2', label: 'Lantai 2' },
  { id: 'lt3', label: 'Lantai 3' },
  { id: 'lt4', label: 'Lantai 4' },
  { id: 'lt5', label: 'Lantai 5' }
])

// --- KONTROL MODAL ---
const isModalOpen = ref(false)
const selectedRoom = ref(null)

const openModal = (room) => {
  selectedRoom.value = room
  isModalOpen.value = true
}
const closeModal = () => {
  isModalOpen.value = false
  setTimeout(() => { selectedRoom.value = null }, 200) 
}

// --- WAKTU UPDATE ---
const lastUpdated = ref('')
let timer = null
const updateTime = () => {
  const now = new Date()
  const pad = (num) => num.toString().padStart(2, '0')
  lastUpdated.value = `${pad(now.getDate())}-${pad(now.getMonth() + 1)}-${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
}
onMounted(() => { updateTime(); timer = setInterval(updateTime, 1000) })
onUnmounted(() => { if (timer) clearInterval(timer) })


// --- GENERATOR DATA SENSOR (Dengan sebaran suhu yang luas untuk demonstrasi warna) ---
const generateRoom = (name, minRange, maxRange, numSensors = 4) => {
  // Menghasilkan suhu dasar acak di antara minRange dan maxRange yang ditentukan
  const baseTemp = minRange + Math.random() * (maxRange - minRange)
  const sensors = []
  let totalTemp = 0

  for (let i = 1; i <= numSensors; i++) {
    // Fluktuasi sensor individual +/- 1.5 derajat
    const sTemp = parseFloat((baseTemp + (Math.random() * 3 - 1.5)).toFixed(1))
    totalTemp += sTemp
    sensors.push({ name: `Sensor Suhu ${i}`, temp: sTemp }) // Diubah jadi Sensor Suhu
  }
  
  return {
    name,
    avgTemp: parseFloat((totalTemp / numSensors).toFixed(1)), 
    sensors
  }
}

// --- DATA RUANGAN PER LANTAI (Data Dummy dengan Rentang Berbeda agar 4 warna muncul) ---
const roomData = ref({
  lt1: [
    generateRoom('Ruang Trafo', 28, 32, 6), // Sengaja dibuat tinggi (Kuning/Merah)
    generateRoom('Ruang Genset', 30, 35, 4) // Sengaja dibuat panas (Merah)
  ],
  lt2: [
    generateRoom('Ruang Baterai', 20, 23), // Normal (Hijau)
    generateRoom('Ruang Recti', 23, 26),   // Antara Normal dan Hangat
    generateRoom('Ruang MSC', 16, 18),     // Sangat Dingin (Biru)
    generateRoom('Ruang CSPS', 20, 22)     // Normal
  ],
  lt3: [
    generateRoom('Ruang Baterai', 20, 23),
    generateRoom('Ruang Recti', 24, 28),   // Hangat (Kuning)
    generateRoom('Ruang INVAS', 19, 22),
    generateRoom('Ruang Core', 17, 19, 6), // Dominan Dingin/Normal
    generateRoom('Ruang MKios', 22, 24),
    generateRoom('Ruang OCS', 20, 23)
  ],
  lt4: [
    generateRoom('Ruang Baterai', 20, 22),
    generateRoom('Ruang Recti', 23, 26),
    generateRoom('Ruang BSS', 18, 21, 5),
    generateRoom('Ruang Interkoneksi', 21, 23),
    generateRoom('Ruang Transmisi', 22, 25)
  ],
  lt5: [
    generateRoom('Ruang Utility A', 25, 29), // Hangat (Kuning)
    generateRoom('Ruang Utility B', 26, 30), // Hangat menuju Panas
    generateRoom('Ruang Data Center', 15, 18, 8), // Wajib Sangat Dingin (Biru)
    generateRoom('Ruang Pengembangan', 22, 24),
    generateRoom('Ruang Containment', 18, 20)
  ]
})
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-zoom-in {
  animation: zoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes zoomIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>