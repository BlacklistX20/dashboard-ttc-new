<template>
  <aside
    class="bg-slate-900 h-screen fixed top-0 left-0 z-50 shadow-2xl transition-all duration-300 ease-in-out flex flex-col"
    :class="isHovered ? 'w-64' : 'w-18'"
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
    <nav class="flex-1 py-6 flex flex-col gap-2 px-3 overflow-hidden">
      
      <!-- Menu: Dashboard -->
      <router-link to="/" v-slot="{ isActive, href, navigate }">
        <a :href="href" @click="navigate" 
           class="flex items-center gap-4 px-3 py-3 transition-all whitespace-nowrap"
           :class="isActive 
              ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'">
          <LayoutDashboard class="w-6 h-6 flex-shrink-0" />
          <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Dashboard</span>
        </a>
      </router-link>
      <!-- Menu: Kelistrikan Gedung -->
      <router-link to="/kelistrikan" v-slot="{ isActive, href, navigate }">
        <a :href="href" @click="navigate" 
           class="flex items-center gap-4 px-3 py-3 transition-all whitespace-nowrap"
           :class="isActive 
              ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'">
          <Zap class="w-6 h-6 flex-shrink-0" />
          <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Kelistrikan Gedung</span>
        </a>
      </router-link>
      <!-- Menu: Suhu Ruangan -->
      <router-link to="/suhu" v-slot="{ isActive, href, navigate }">
        <a :href="href" @click="navigate" 
           class="flex items-center gap-4 px-3 py-3 transition-all whitespace-nowrap"
           :class="isActive 
              ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'">
          <Thermometer class="w-6 h-6 flex-shrink-0" />
          <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Suhu Ruangan</span>
        </a>
      </router-link>
      <!-- Menu: Tangki BBM -->
      <router-link to="/tangki" v-slot="{ isActive, href, navigate }">
        <a :href="href" @click="navigate" 
           class="flex items-center gap-4 px-3 py-3 transition-all whitespace-nowrap"
           :class="isActive 
              ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'">
          <Cylinder class="w-6 h-6 flex-shrink-0" />
          <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Tangki BBM</span>
        </a>
      </router-link>
      <!-- Menu: Sistem Kontrol valve -->
      <router-link to="/valve" v-slot="{ isActive, href, navigate }">
        <a :href="href" @click="navigate" 
           class="flex items-center gap-4 px-3 py-3 transition-all whitespace-nowrap"
           :class="isActive 
              ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' 
              : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'">
          <droplets class="w-6 h-6 flex-shrink-0" />
          <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Kontrol Penyiraman</span>
        </a>
      </router-link>
      <!-- Menu: Kontrol PAC -->
      <router-link to="/pac" v-slot="{ isActive, href, navigate }">
        <a :href="href" @click="navigate" 
           class="flex items-center gap-4 px-3 py-3 transition-all whitespace-nowrap"
           :class="isActive ? 'bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl ml-0' : 'text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl ml-1'">
          <Fan class="w-6 h-6 flex-shrink-0" />
          <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Kontrol PAC</span>
        </a>
      </router-link>

    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
// Import komponen ikon dari Lucide
import { LayoutDashboard, Zap, SlidersHorizontal, Cylinder, Thermometer, Fan, droplets } from '@lucide/vue'

const isHovered = ref(false)
</script>