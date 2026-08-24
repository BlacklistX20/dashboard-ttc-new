<template>
  <div class="p-4 bg-slate-50 min-h-screen">
    
    <!-- HEADER -->
    <div class="mb-4">
      <h1 class="text-xl font-bold text-slate-800 mb-1">Monitoring Tangki BBM</h1>
      <p class="text-slate-500 text-xs">Status dan kapasitas bahan bakar minyak TTC Sudiang secara realtime.</p>
    </div>

    <!-- 1 BARIS -->
    <div class="grid grid-cols-1 lg:grid-cols-5 gap-4">
      
      <!-- ================= KARTU TANGKI HARIAN (2 Kolom) ================= -->
      <Card title="Kapasitas Tangki Harian" class="lg:col-span-2" bodyClass="p-3">
        <div class="grid grid-cols-2 gap-2 h-full">
          
          <div v-for="(tank, index) in tanksHarian" :key="index" class="flex flex-col items-center">
            
            <div class="text-center mb-3 w-full">
              <h3 class="text-base font-bold text-slate-800 mb-1">{{ tank.name }}</h3>
              <div class="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                <p class="text-xl font-extrabold text-amber-600 leading-none mb-1">
                  {{ formatNumber(tank.animatedVolume) }} <span class="text-[10px] text-slate-500 font-semibold">L</span>
                </p>
                <p class="text-[9px] font-bold text-slate-400 uppercase border-t border-slate-200 pt-1 mt-1">
                  Kapasitas: {{ formatNumber(tank.capacity) }} L
                </p>
              </div>
            </div>

            <!-- Silinder Tangki -->
            <div class="relative w-40 h-80 bg-slate-200 rounded-[2.5rem] overflow-hidden border-[6px] border-slate-300 shadow-inner flex-shrink-0">
              
              <!-- Cairan Air -->
              <div class="absolute bottom-0 left-0 right-0 transition-all ease-in-out bg-[#f59e0b]" style="transition-duration: 2500ms;" :style="{ height: tank.animatedPercentage + '%' }">
                <div class="wave-base wave-amber-back absolute left-0 w-[200%] h-16 -top-7"></div>
                <div class="wave-base wave-amber-front absolute left-0 w-[200%] h-16 -top-7"></div>
              </div>
              
              <div class="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none">
                <span class="text-3xl font-extrabold text-white/90">{{ Math.round(tank.animatedPercentage) }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <template #footer>
          <div class="flex justify-between items-center text-[10px] text-slate-400">
            <span>Update:</span><span class="font-medium text-slate-500">{{ lastUpdated }}</span>
          </div>
        </template>
      </Card>


      <!-- ================= KARTU TANGKI BULANAN (3 Kolom) ================= -->
      <Card title="Kapasitas Tangki Bulanan" class="lg:col-span-3" bodyClass="p-3">
        <div class="grid grid-cols-3 gap-2 h-full">
          
          <div v-for="(tank, index) in tanksBulanan" :key="index" class="flex flex-col items-center">
            
            <div class="text-center mb-3 w-full">
              <h3 class="text-base font-bold text-slate-800 mb-1">{{ tank.name }}</h3>
              <div class="bg-slate-50 px-2 py-1.5 rounded-lg border border-slate-200">
                <p class="text-xl font-extrabold text-emerald-600 leading-none mb-1">
                  {{ formatNumber(tank.animatedVolume) }} <span class="text-[10px] text-slate-500 font-semibold">L</span>
                </p>
                <p class="text-[9px] font-bold text-slate-400 uppercase border-t border-slate-200 pt-1 mt-1">
                  Kapasitas: {{ formatNumber(tank.capacity) }} L
                </p>
              </div>
            </div>

            <!-- Silinder Tangki -->
            <div class="relative w-40 h-80 bg-slate-200 rounded-[2.5rem] overflow-hidden border-[6px] border-slate-300 shadow-inner flex-shrink-0">
              
              <!-- Cairan Air -->
              <div class="absolute bottom-0 left-0 right-0 transition-all ease-in-out bg-[#10b981]" style="transition-duration: 2500ms;" :style="{ height: tank.animatedPercentage + '%' }">
                <!-- 
                  PERBAIKAN GAP KEDUA OMBAK
                -->
                <div class="wave-base wave-emerald-back absolute left-0 w-[200%] h-16 -top-7"></div>
                <div class="wave-base wave-emerald-front absolute left-0 w-[200%] h-16 -top-7"></div>
              </div>
              
              <div class="absolute inset-0 flex items-center justify-center mix-blend-difference pointer-events-none">
                <span class="text-3xl font-extrabold text-white/90">{{ Math.round(tank.animatedPercentage) }}%</span>
              </div>
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
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import Card from '@/components/Card.vue'

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

const formatNumber = (num) => Math.round(num).toLocaleString('id-ID')

// --- DATA TANGKI HARIAN ---
const tanksHarian = ref([
  { name: 'Harian 1', capacity: 1500, currentVolume: 1250, animatedVolume: 0, animatedPercentage: 0 },
  { name: 'Harian 2', capacity: 1500, currentVolume: 800, animatedVolume: 0, animatedPercentage: 0 }
])

// --- DATA TANGKI BULANAN ---
const tanksBulanan = ref([
  { name: 'Bulanan 1', capacity: 11662, currentVolume: 10500, animatedVolume: 0, animatedPercentage: 0 },
  { name: 'Bulanan 2', capacity: 10000, currentVolume: 3500, animatedVolume: 0, animatedPercentage: 0 },
  { name: 'Bulanan 3', capacity: 10000, currentVolume: 8200, animatedVolume: 0, animatedPercentage: 0 }
])

// --- TRIGGER ANIMASI NAIK SAAT HALAMAN DIBUKA ---
onMounted(() => {
  setTimeout(() => {
    tanksHarian.value.forEach(tank => {
      tank.animatedVolume = tank.currentVolume
      tank.animatedPercentage = (tank.currentVolume / tank.capacity) * 100
    })
    tanksBulanan.value.forEach(tank => {
      tank.animatedVolume = tank.currentVolume
      tank.animatedPercentage = (tank.currentVolume / tank.capacity) * 100
    })
  }, 100)
})
</script>

<style scoped>
/* KONFIGURASI UMUM OMBAK */
.wave-base {
  background-size: 50% 100%;
  background-position: bottom center; 
  background-repeat: repeat-x;
  animation: wave-animation 3s linear infinite;
}

/* KUNING/AMBER WAVES */
.wave-amber-front {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M0 56.9c155.5 0 204.9-50 405.5-49.9 200 0 250 49.9 394.5 49.9v31.8H0v-.2-31.6z' fill='%23f59e0b'/%3E%3C/svg%3E");
}
.wave-amber-back {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M0 56.9c155.5 0 204.9-50 405.5-49.9 200 0 250 49.9 394.5 49.9v31.8H0v-.2-31.6z' fill='%23fbbf24'/%3E%3C/svg%3E");
  animation-duration: 4s;
  animation-direction: reverse;
}

/* HIJAU/EMERALD WAVES */
.wave-emerald-front {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M0 56.9c155.5 0 204.9-50 405.5-49.9 200 0 250 49.9 394.5 49.9v31.8H0v-.2-31.6z' fill='%2310b981'/%3E%3C/svg%3E");
}
.wave-emerald-back {
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 88.7'%3E%3Cpath d='M0 56.9c155.5 0 204.9-50 405.5-49.9 200 0 250 49.9 394.5 49.9v31.8H0v-.2-31.6z' fill='%2334d399'/%3E%3C/svg%3E");
  animation-duration: 4s;
  animation-direction: reverse;
}

/* KEYFRAMES ANIMASI OMBAK BERJALAN */
@keyframes wave-animation {
  0% { background-position: 100% bottom; }
  100% { background-position: 0 bottom; }
}
</style>