<template>
  <div class="bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow duration-300">
    
    <!-- HEADER -->
    <div v-if="$slots.header || title" class="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
      <slot name="header">
        <h2 class="text-sm font-bold text-slate-700 uppercase tracking-wider">{{ title }}</h2>
      </slot>
    </div>

    <!-- BODY (Menggunakan properti bodyClass) -->
    <div :class="['flex-grow flex flex-col justify-center', bodyClass]">
      <slot></slot> 
    </div>

    <!-- FOOTER -->
    <div v-if="$slots.footer" class="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
      <slot name="footer"></slot>
    </div>

  </div>
</template>

<script setup>
defineProps({
  title: { type: String, default: '' },
  bodyClass: { type: String, default: 'p-6' } // Default p-6 agar halaman lain tetap aman
})
</script>