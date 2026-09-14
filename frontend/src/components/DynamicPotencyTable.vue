<template>
  <div class="flex flex-col gap-4 animate-fade-in">
    
    <!-- KONTROL ATAS: Search & Tambah Data -->
    <div class="flex flex-col sm:flex-row justify-between gap-4 items-center bg-white p-3 rounded-xl shadow-sm border border-slate-200">
      
      <!-- Search Bar -->
      <div class="relative w-full sm:w-72">
        <div class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search class="w-4 h-4 text-slate-400" />
        </div>
        <input 
          v-model="searchQuery" 
          type="text" 
          class="bg-slate-50 border border-slate-200 text-slate-700 text-sm rounded-lg focus:ring-sky-500 focus:border-sky-500 block w-full pl-10 p-2 transition-colors" 
          placeholder="Cari data..."
        >
      </div>

      <!-- Tombol Tambah Data -->
      <button @click="openFormModal()" class="w-full sm:w-auto bg-[#ED1C24] hover:bg-red-700 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-colors">
        <Plus class="w-4 h-4" /> Tambah Data
      </button>

    </div>

    <!-- KARTU TABEL -->
    <div class="bg-white rounded-xl shadow-sm border-t-4 border-slate-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th class="px-4 py-4 font-bold border-b border-slate-200 text-center w-12">No</th>
              <th v-for="col in tableColumns" :key="col.key" class="px-4 py-4 font-bold border-b border-slate-200 whitespace-nowrap">
                {{ col.label }}
              </th>
              <th class="px-4 py-4 font-bold border-b border-slate-200 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody class="text-sm text-slate-700 divide-y divide-slate-100">
            
            <!-- State: Loading -->
            <tr v-if="isLoading">
              <td :colspan="tableColumns.length + 2" class="px-6 py-10 text-center text-slate-400">
                <Loader2 class="w-6 h-6 animate-spin mx-auto mb-2 text-sky-500" />
                Memuat data...
              </td>
            </tr>
            
            <!-- State: Kosong / Tidak Ditemukan -->
            <tr v-else-if="paginatedData.length === 0">
              <td :colspan="tableColumns.length + 2" class="px-6 py-10 text-center text-slate-400 font-medium">
                {{ searchQuery ? 'Pencarian tidak menemukan hasil.' : 'Belum ada data inventaris.' }}
              </td>
            </tr>
            
            <!-- State: Ada Data (Looping) -->
            <tr v-else v-for="(item, index) in paginatedData" :key="item.id" class="hover:bg-slate-50 transition-colors">
              <!-- Nomor Urut Dinamis (Berdasarkan Halaman) -->
              <td class="px-4 py-4 font-bold text-slate-500 text-center">
                {{ (currentPage - 1) * itemsPerPage + index + 1 }}
              </td>
              
              <!-- Data Sel -->
              <td v-for="col in tableColumns" :key="col.key" class="px-4 py-4">
                <span v-if="col.type === 'select'" class="px-2 py-1 text-[10px] font-bold uppercase rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                  {{ item[col.key] || '-' }}
                </span>
                <span v-else>{{ item[col.key] || '-' }}</span>
              </td>
              
              <!-- Aksi -->
              <td class="px-4 py-4 flex justify-center gap-2">
                <button @click="openDetailModal(item)" class="p-1.5 bg-sky-100 text-sky-600 hover:bg-sky-200 rounded-md transition-colors" title="Detail"><Eye class="w-4 h-4" /></button>
                <button @click="openFormModal(item)" class="p-1.5 bg-amber-100 text-amber-600 hover:bg-amber-200 rounded-md transition-colors" title="Edit"><Edit class="w-4 h-4" /></button>
                <button @click="deleteData(item.id)" class="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors" title="Hapus"><Trash2 class="w-4 h-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- KONTROL PAGINATION -->
      <div v-if="!isLoading && filteredData.length > 0" class="px-4 py-3 border-t border-slate-100 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span class="text-xs text-slate-500">
          Menampilkan <span class="font-bold text-slate-700">{{ startIndex + 1 }}</span> - 
          <span class="font-bold text-slate-700">{{ Math.min(startIndex + itemsPerPage, filteredData.length) }}</span> 
          dari <span class="font-bold text-slate-700">{{ filteredData.length }}</span> data
        </span>
        
        <div class="flex items-center gap-1">
          <button 
            @click="currentPage--" 
            :disabled="currentPage === 1"
            class="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="currentPage === 1 ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-100'"
          >
            Sebelumnya
          </button>
          
          <span class="px-3 py-1 text-xs font-bold text-slate-600">
            Hal {{ currentPage }} / {{ totalPages }}
          </span>
          
          <button 
            @click="currentPage++" 
            :disabled="currentPage === totalPages"
            class="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :class="currentPage === totalPages ? 'bg-slate-100 text-slate-400' : 'bg-white text-slate-700 hover:bg-slate-100'"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>

    <!-- ================= MODAL DETAIL ================= -->
    <div v-if="isDetailOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isDetailOpen = false"></div>
      <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 class="text-base font-bold text-slate-800">Detail Perangkat</h2>
          <button @click="isDetailOpen = false" class="p-1 text-slate-400 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"><X class="w-5 h-5" /></button>
        </div>
        <div class="p-5 overflow-y-auto">
          <div class="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
            <div v-for="field in schema.fields" :key="'det-'+field.key" class="flex flex-col border-b border-slate-50 pb-2">
              <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ field.label }}</span>
              <span class="font-semibold text-slate-700 mt-1">{{ selectedItem[field.key] || '-' }}</span>
            </div>
          </div>
        </div>
        <div class="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button @click="isDetailOpen = false" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-5 py-2 rounded-lg transition-colors">Tutup</button>
        </div>
      </div>
    </div>

    <!-- ================= MODAL FORM (TAMBAH/EDIT) ================= -->
    <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isFormOpen = false"></div>
      <div class="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-zoom-in">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 class="text-base font-bold text-slate-800">{{ isEditMode ? 'Edit Data Inventaris' : 'Tambah Data Inventaris' }}</h2>
          <button @click="isFormOpen = false" class="p-1 text-slate-400 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="submitData" class="flex flex-col overflow-hidden flex-1">
          <!-- Area form scrollable -->
          <div class="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4">
            <div v-for="field in schema.fields" :key="'form-'+field.key" class="flex flex-col">
              <label class="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">{{ field.label }}</label>
              
              <!-- Input Select -->
              <select v-if="field.type === 'select'" v-model="formData[field.key]" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors">
                <option value="" disabled>Pilih {{ field.label }}</option>
                <option v-for="opt in field.options" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              
              <!-- Input Standar (Text/Number/Date) -->
              <input v-else :type="field.type" v-model="formData[field.key]" required class="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-700 font-medium focus:outline-none focus:border-sky-500 focus:bg-white transition-colors" :placeholder="`Masukkan ${field.label}`">
            </div>
          </div>
          
          <div class="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
            <button type="button" @click="isFormOpen = false" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg transition-colors">Batal</button>
            <button type="submit" :disabled="isSubmitting" class="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" /> 
              <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan Data' }}</span>
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Eye, Edit, Trash2, Plus, X, Loader2, Search } from '@lucide/vue'
import api from '@/services/api' 

const props = defineProps({
  schema: Object,
  endpoint: String 
})

// --- STATE UTAMA ---
const dataList = ref([])
const isLoading = ref(true)

// --- STATE PENCARIAN & PAGINATION ---
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// --- MODAL STATE ---
const isDetailOpen = ref(false)
const selectedItem = ref({})

const isFormOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const formData = ref({})

// --- COMPUTED PROPERTIES ---

// 1. Filter kolom untuk tabel
const tableColumns = computed(() => props.schema.fields.filter(f => f.inTable))

// 2. Pencarian Data (Client-Side)
const filteredData = computed(() => {
  if (!searchQuery.value) return dataList.value
  
  const query = searchQuery.value.toLowerCase()
  return dataList.value.filter(item => {
    // Cari kecocokan di setiap kolom yang ada di skema
    return props.schema.fields.some(field => {
      const value = item[field.key]
      if (value === null || value === undefined) return false
      return String(value).toLowerCase().includes(query)
    })
  })
})

// 3. Pagination Data
const totalPages = computed(() => Math.ceil(filteredData.value.length / itemsPerPage.value) || 1)
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)

const paginatedData = computed(() => {
  return filteredData.value.slice(startIndex.value, startIndex.value + itemsPerPage.value)
})

// Reset ke halaman 1 jika user mengetik pencarian baru
watch(searchQuery, () => {
  currentPage.value = 1
})


// --- FUNGSI API (CRUD) ---
const fetchData = async () => {
  isLoading.value = true
  try {
    const res = await api.get(`/${props.endpoint}`)
    dataList.value = res.data
    // Reset pagination & pencarian saat pindah kategori tabel
    currentPage.value = 1
    searchQuery.value = ''
  } catch (error) {
    console.error("Gagal mengambil data")
    dataList.value = [] 
  } finally {
    isLoading.value = false
  }
}

const openDetailModal = (item) => {
  selectedItem.value = item
  isDetailOpen.value = true
}

const openFormModal = (item = null) => {
  if (item) {
    isEditMode.value = true
    formData.value = { ...item }
  } else {
    isEditMode.value = false
    formData.value = {}
  }
  isFormOpen.value = true
}

const submitData = async () => {
  isSubmitting.value = true
  try {
    if (isEditMode.value) {
      // Endpoint Dinamis: PUT /api/potency/power/:id
      await api.put(`/${props.endpoint}/${formData.value.id}`, formData.value)
    } else {
      // POST /api/potency/power
      await api.post(`/${props.endpoint}`, formData.value)
    }
    await fetchData()
    isFormOpen.value = false
  } catch (error) {
    alert("Gagal menyimpan data")
  } finally {
    isSubmitting.value = false
  }
}

const deleteData = async (id) => {
  if (!confirm("Yakin ingin menghapus data ini?")) return
  try {
    await api.delete(`/${props.endpoint}/${id}`)
    await fetchData()
  } catch (error) {
    alert("Gagal menghapus data")
  }
}

// Pantau perubahan endpoint dari parent (saat user klik menu kategori lain)
watch(() => props.endpoint, () => {
  fetchData()
})

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.3s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
.animate-zoom-in { animation: zoomIn 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
@keyframes zoomIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>