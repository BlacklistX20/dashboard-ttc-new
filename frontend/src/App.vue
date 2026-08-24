<script setup>
import { RouterView } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue' // Import Sidebar yang baru dibuat
</script>

<template>
  <!-- Wrapper utama dengan background warna dasar -->
  <div class="min-h-screen bg-gray-50 flex">
    
    <!-- Komponen Sidebar -->
    <Sidebar />

    <!-- 
      Main Content Area. 
      Memberikan padding-left (pl-20 = 80px) agar konten tidak tertimpa sidebar saat tertutup.
      Ketika sidebar terbuka (hover), sidebar akan mengambang menutupi sedikit ujung kiri konten 
      tanpa menggeser seluruh layar.
    -->
    <main class="flex-1 pl-20 transition-all duration-300">
      <RouterView />
    </main>

  </div>
</template>