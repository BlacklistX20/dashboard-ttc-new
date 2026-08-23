<template>
  <!-- Menambahkan overflow-hidden agar elemen di dalamnya tidak keluar batas rounded, 
       serta efek hover shadow yang halus untuk kesan modern -->
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow duration-300">
    
    <!-- HEADER -->
    <!-- Pemisah: border-b border-gray-100 dan warna background transparan bg-gray-50/50 -->
    <div v-if="$slots.header || title" class="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
      <slot name="header">
        <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wider">{{ title }}</h2>
      </slot>
    </div>

    <!-- BODY (Default Slot) -->
    <!-- flex-grow agar body mendorong footer ke paling bawah jika tinggi kartu bervariasi -->
    <div class="p-6 flex-grow flex flex-col justify-center">
      <slot></slot> 
    </div>

    <!-- FOOTER -->
    <!-- Pemisah: border-t border-gray-100 -->
    <div v-if="$slots.footer" class="px-6 py-3 border-t border-gray-100 bg-gray-50/50">
      <slot name="footer"></slot>
    </div>

  </div>
</template>

<script setup>
defineProps({
  title: {
    type: String,
    default: ''
  }
})
</script>