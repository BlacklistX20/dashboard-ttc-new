<template>
  <aside
    class="bg-slate-900 h-screen fixed top-0 left-0 z-50 shadow-2xl transition-all duration-300 ease-in-out flex flex-col"
    :class="isHovered ? 'w-64' : 'w-20'"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- HEADER -->
    <div class="h-20 flex items-center justify-center border-b border-slate-800">
      <h1 
        class="font-extrabold text-[#ED1C24] transition-all duration-300 whitespace-nowrap overflow-hidden"
        :class="isHovered ? 'text-xl' : 'text-2xl tracking-tighter'"
      >
        {{ isHovered ? 'TTC Sudiang' : 'TTC' }}
      </h1>
    </div>

    <!-- MENU ITEMS -->
    <nav class="flex-1 py-6 flex flex-col gap-2 px-3 overflow-y-auto overflow-x-hidden custom-scrollbar">
      
      <!-- ================= 1. MENU DASHBOARD ================= -->
      <router-link to="/" v-slot="{ isActive, href, navigate }">
        <a :href="href" @click="navigate" class="flex items-center gap-4 px-3 py-3 transition-all whitespace-nowrap" :class="isActive ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'">
          <LayoutDashboard class="w-6 h-6 flex-shrink-0" />
          <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Dashboard</span>
        </a>
      </router-link>

      <!-- ================= 2. PARENT MENU: MONITORING ================= -->
      <div>
        <button 
          @click="isMonitoringOpen = !isMonitoringOpen" 
          class="w-full flex items-center justify-between gap-4 px-3 py-3 transition-all whitespace-nowrap"
          :class="['/kelistrikan', '/suhu', '/tangki'].includes(route.path) ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'"
        >
          <div class="flex items-center gap-4">
            <Activity class="w-6 h-6 flex-shrink-0" />
            <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Monitoring</span>
          </div>
          <ChevronDown v-show="isHovered" class="w-4 h-4 transition-transform duration-300" :class="isMonitoringOpen ? 'rotate-180' : ''" />
        </button>

        <div v-show="isMonitoringOpen && isHovered" class="flex flex-col gap-1 mt-2 pl-6 pr-3 animate-fade-in-down">
          
          <router-link to="/kelistrikan" v-slot="{ isActive, href, navigate }">
            <a :href="href" @click="navigate" class="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm" :class="isActive ? 'bg-[#ED1C24] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'">
              <Zap class="w-4 h-4 flex-shrink-0" />
              <span>Kelistrikan</span>
            </a>
          </router-link>

          <router-link to="/suhu" v-slot="{ isActive, href, navigate }">
            <a :href="href" @click="navigate" class="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm" :class="isActive ? 'bg-[#ED1C24] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'">
              <Thermometer class="w-4 h-4 flex-shrink-0" />
              <span>Suhu Ruangan</span>
            </a>
          </router-link>

          <router-link to="/tangki" v-slot="{ isActive, href, navigate }">
            <a :href="href" @click="navigate" class="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm" :class="isActive ? 'bg-[#ED1C24] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'">
              <Fuel class="w-4 h-4 flex-shrink-0" />
              <span>Tangki BBM</span>
            </a>
          </router-link>

          <router-link to="/gas" v-slot="{ isActive, href, navigate }">
            <a :href="href" @click="navigate" class="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm" :class="isActive ? 'bg-[#ED1C24] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'">
              <Container class="w-4 h-4 flex-shrink-0" />
              <span>Environtmen Ruangan</span>
            </a>
          </router-link>
          
        </div>
      </div>

      <!-- ================= 3. PARENT MENU: SISTEM KONTROL ================= -->
      <div>
        <button 
          @click="isKontrolOpen = !isKontrolOpen" 
          class="w-full flex items-center justify-between gap-4 px-3 py-3 transition-all whitespace-nowrap"
          :class="['/valve', '/pac'].includes(route.path) ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'"
        >
          <div class="flex items-center gap-4">
            <SlidersHorizontal class="w-6 h-6 flex-shrink-0" />
            <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Sistem Kontrol</span>
          </div>
          <ChevronDown v-show="isHovered" class="w-4 h-4 transition-transform duration-300" :class="isKontrolOpen ? 'rotate-180' : ''" />
        </button>

        <div v-show="isKontrolOpen && isHovered" class="flex flex-col gap-1 mt-2 pl-6 pr-3 animate-fade-in-down">
          
          <router-link to="/valve" v-slot="{ isActive, href, navigate }">
            <a :href="href" @click="navigate" class="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm" :class="isActive ? 'bg-[#ED1C24] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'">
              <Droplets class="w-4 h-4 flex-shrink-0" />
              <span>Penyiraman Rooftop</span>
            </a>
          </router-link>

          <router-link to="/pac" v-slot="{ isActive, href, navigate }">
            <a :href="href" @click="navigate" class="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm" :class="isActive ? 'bg-[#ED1C24] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'">
              <Fan class="w-4 h-4 flex-shrink-0" />
              <span>PAC</span>
            </a>
          </router-link>

        </div>
      </div>

      <!-- ================= 4. PARENT MENU: DATA POTENSI TTC ================= -->
      <div>
        <button 
          @click="isInventarisOpen = !isInventarisOpen" 
          class="w-full flex items-center justify-between gap-4 px-3 py-3 transition-all whitespace-nowrap"
          :class="route.path.includes('/potensi') ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'"
        >
          <div class="flex items-center gap-4">
            <Database class="w-6 h-6 flex-shrink-0" />
            <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Data Potensi TTC</span>
          </div>
          <ChevronDown v-show="isHovered" class="w-4 h-4 transition-transform duration-300" :class="isInventarisOpen ? 'rotate-180' : ''" />
        </button>

        <div v-show="isInventarisOpen && isHovered" class="flex flex-col gap-1 mt-2 pl-6 pr-3 animate-fade-in-down">
          
          <router-link 
            v-for="item in subMenus" 
            :key="item.path"
            :to="`/potensi/${item.path}`" 
            v-slot="{ isActive, href, navigate }"
          >
            <a :href="href" @click="navigate" class="flex items-center gap-3 py-2 px-3 rounded-lg transition-colors text-sm" :class="isActive ? 'bg-[#ED1C24] text-white font-bold shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'">
              <!-- Penggunaan Komponen Dinamis Ikon -->
              <component :is="item.icon" class="w-4 h-4 flex-shrink-0" />
              <span>{{ item.name }}</span>
            </a>
          </router-link>

        </div>
      </div>

    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
// Semua ikon yang dibutuhkan di-import secara bersamaan
import { 
  LayoutDashboard, Activity, SlidersHorizontal, Database, ChevronDown, 
  Zap, Thermometer, Fuel, Droplets, Fan, 
  Power, Laptop, Snowflake, Flame, Beaker, Shield, Lightbulb, Cog, Container
} from '@lucide/vue'

const route = useRoute()
const isHovered = ref(false)

const isMonitoringOpen = ref(false)
const isKontrolOpen = ref(false)
const isInventarisOpen = ref(false)

// Daftar sub-menu Data Potensi sekarang disisipi ikon Lucide masing-masing
const subMenus = [
  { name: 'Power System', path: 'power-system', icon: Power },
  { name: 'Perangkat User', path: 'perangkat-user', icon: Laptop },
  { name: 'Cooling System', path: 'cooling-system', icon: Snowflake },
  { name: 'Pemadam Api Gedung', path: 'pemadam-api', icon: Flame },
  { name: 'Tangki Cairan', path: 'tangki-cairan', icon: Beaker },
  { name: 'Keamanan Gedung', path: 'keamanan-gedung', icon: Shield },
  { name: 'Pencahayaan Gedung', path: 'pencahayaan-gedung', icon: Lightbulb },
  { name: 'Pompa Gedung', path: 'pompa-gedung', icon: Cog }
]
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background-color: #334155; border-radius: 10px; }

.animate-fade-in-down {
  animation: fadeInDown 0.3s ease-out;
}
@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>