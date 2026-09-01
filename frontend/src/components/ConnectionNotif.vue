<template>
  <div 
    v-if="visible" 
    class="fixed top-0 left-0 right-0 z-[100] flex justify-center pt-6 pointer-events-none"
  >
    <div 
      class="pointer-events-auto w-[90%] md:w-max max-w-lg text-white px-5 py-3 rounded-xl shadow-2xl flex items-center justify-between gap-4 animate-slide-down-center border"
      :class="type === 'success' ? 'bg-emerald-600 border-emerald-500' : 'bg-red-600 border-red-500'"
    >
      <div class="flex items-center gap-4">
        <div class="p-2 rounded-lg flex-shrink-0" :class="type === 'success' ? 'bg-emerald-700' : 'bg-red-700'">
          <CheckCircle2 v-if="type === 'success'" class="w-5 h-5 text-emerald-100" />
          <AlertTriangle v-else class="w-5 h-5 text-red-100" />
        </div>
        <div class="flex flex-col">
          <span class="text-sm font-bold">{{ title }}</span>
          <span class="text-[10px]" :class="type === 'success' ? 'text-emerald-200' : 'text-red-200'">{{ message }}</span>
        </div>
      </div>
      <button @click="close" class="p-1.5 rounded-full transition-colors flex-shrink-0" :class="type === 'success' ? 'hover:bg-emerald-700' : 'hover:bg-red-700'">
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>

<script setup>
// Komponen notifikasi koneksi backend (error / sukses reconnect), dipakai bersama
// di semua halaman monitoring. Dikontrol via template ref, bukan prop, supaya
// pemanggilan di parent cukup 1 baris: notifRef.value.showError(...) / showSuccess(...)
import { ref } from 'vue'
import { X, AlertTriangle, CheckCircle2 } from '@lucide/vue'

const visible = ref(false)
const type = ref('error') // 'error' | 'success'
const title = ref('')
const message = ref('')
let timeoutId = null

const close = () => {
  visible.value = false
  if (timeoutId) clearTimeout(timeoutId)
}

const show = ({ type: t, title: ti, message: msg, duration }) => {
  type.value = t
  title.value = ti
  message.value = msg
  visible.value = true
  if (timeoutId) clearTimeout(timeoutId)
  timeoutId = setTimeout(() => { visible.value = false }, duration)
}

// duration default: error 30 detik (butuh perhatian lebih), sukses 5 detik (sekadar info)
const showError = (title, message, duration = 30000) => show({ type: 'error', title, message, duration })
const showSuccess = (title, message, duration = 5000) => show({ type: 'success', title, message, duration })

defineExpose({ showError, showSuccess, close })
</script>

<style scoped>
.animate-slide-down-center { animation: slideDownCenter 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
@keyframes slideDownCenter {
  from { opacity: 0; transform: translateY(-100%); }
  to { opacity: 1; transform: translateY(0); }
}
</style>