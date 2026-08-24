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
    <nav class="flex-1 py-6 flex flex-col gap-2 px-3 overflow-hidden">
      
      <!-- Menu: Dashboard (Aktif - Dengan Aksen Merah Telkomsel) -->
      <a href="#" class="flex items-center gap-4 px-3 py-3 bg-slate-800 border-l-4 border-[#ED1C24] text-white rounded-r-xl transition-all whitespace-nowrap">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="7" height="9"></rect>
          <rect x="14" y="3" width="7" height="5"></rect>
          <rect x="14" y="12" width="7" height="9"></rect>
          <rect x="3" y="16" width="7" height="5"></rect>
        </svg>
        <span class="font-semibold transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Dashboard</span>
      </a>

      <!-- Menu: Kelistrikan -->
      <a href="#" class="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
        </svg>
        <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Kelistrikan Gedung</span>
      </a>

      <!-- Menu: Kontrol -->
      <a href="#" class="flex items-center gap-4 px-4 py-3 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors whitespace-nowrap ml-1">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="3"></circle>
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
        <span class="font-medium transition-opacity duration-300" :class="isHovered ? 'opacity-100' : 'opacity-0'">Sistem Kontrol</span>
      </a>

    </nav>
  </aside>
</template>

<script setup>
import { ref } from 'vue'
const isHovered = ref(false)
</script>