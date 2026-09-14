<template>
  <div class="p-4 bg-slate-300 min-h-screen">
    
    <!-- HEADER -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-slate-800 mb-1">Data Potensi: {{ activeSchema?.title || 'Memuat...' }}</h1>
      <p class="text-slate-500 text-sm">Inventaris dan status aset gedung TTC Sudiang.</p>
    </div>

    <!-- RENDER KOMPONEN DINAMIS -->
    <!-- API Endpoint Dinamis, contoh: 'potency/power' -->
    <DynamicPotencyTable 
      v-if="activeSchema"
      :schema="activeSchema" 
      :endpoint="`potency/${activeSchema.tableName}`" 
    />
    
    <div v-else class="text-center py-10 bg-white rounded-xl shadow-sm border-t-4 border-slate-300">
      <p class="text-slate-400 font-bold">Kategori tidak valid atau belum dikonfigurasi.</p>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { potencySchemas } from '@/config/potencySchemas'
import DynamicPotencyTable from '@/components/DynamicPotencyTable.vue'

const route = useRoute()

// Mendapatkan skema aktif berdasarkan URL Params (kategori)
const activeSchema = computed(() => {
  return potencySchemas[route.params.kategori]
})
</script>