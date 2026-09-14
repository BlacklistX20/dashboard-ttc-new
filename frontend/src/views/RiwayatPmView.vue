<template>
  <div class="p-4 bg-slate-300 min-h-screen flex flex-col gap-4">
    
    <!-- NOTIFIKASI KONEKSI -->
    <ConnectionNotif ref="notifRef" />

    <!-- HEADER -->
    <div>
      <h1 class="text-2xl font-bold text-slate-800 mb-1">Riwayat PM Vendor</h1>
      <p class="text-slate-500 text-sm">Pemantauan jadwal dan dokumen Preventive Maintenance.</p>
    </div>

    <!-- KARTU FILTER & KONTROL -->
    <div class="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-end justify-between">
      <div class="flex flex-wrap gap-4 flex-1">
        <div class="flex flex-col">
          <label class="text-xs font-bold text-slate-500 mb-1">Mulai Tanggal</label>
          <input type="date" v-model="filters.startDate" class="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 focus:outline-none focus:border-sky-500">
        </div>
        <div class="flex flex-col">
          <label class="text-xs font-bold text-slate-500 mb-1">Sampai Tanggal</label>
          <input type="date" v-model="filters.endDate" class="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 focus:outline-none focus:border-sky-500">
        </div>
        <div class="flex flex-col">
          <label class="text-xs font-bold text-slate-500 mb-1">Jenis Perangkat</label>
          <select v-model="filters.device" class="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 min-w-[150px] focus:outline-none focus:border-sky-500">
            <option value="">Semua Perangkat</option>
            <option v-for="dev in deviceOptions" :key="dev" :value="dev">{{ dev }}</option>
          </select>
        </div>
        <div class="flex flex-col">
          <label class="text-xs font-bold text-slate-500 mb-1">Status</label>
          <select v-model="filters.status" class="bg-slate-50 border border-slate-200 text-sm rounded-lg p-2 min-w-[150px] focus:outline-none focus:border-sky-500">
            <option value="">Semua Status</option>
            <option v-for="stat in statusOptions" :key="stat" :value="stat">{{ stat }}</option>
          </select>
        </div>
      </div>

      <div class="flex gap-2">
        <button @click="fetchData" class="bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm transition-colors">
          Terapkan Filter
        </button>
        <button @click="openFormModal()" :disabled="apiError" class="bg-[#ED1C24] hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 transition-colors">
          <Plus class="w-4 h-4" /> Tambah Data
        </button>
      </div>
    </div>

    <!-- KARTU TABEL -->
    <div class="bg-white rounded-xl shadow-sm border-t-4 border-slate-300 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-100 text-slate-500 text-xs uppercase tracking-wider">
              <th class="px-4 py-4 font-bold border-b border-slate-200 text-center w-12">No</th>
              <th class="px-4 py-4 font-bold border-b border-slate-200">Rencana</th>
              <th class="px-4 py-4 font-bold border-b border-slate-200">Realisasi</th>
              <th class="px-4 py-4 font-bold border-b border-slate-200">Vendor</th>
              <th class="px-4 py-4 font-bold border-b border-slate-200">Perangkat</th>
              <th class="px-4 py-4 font-bold border-b border-slate-200 text-center">Status</th>
              <th class="px-4 py-4 font-bold border-b border-slate-200 text-center">Bukti (PDF)</th>
              <th class="px-4 py-4 font-bold border-b border-slate-200 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="text-sm text-slate-700 divide-y divide-slate-100">
            <tr v-if="isLoading"><td colspan="8" class="px-6 py-8 text-center text-slate-400">Memuat data...</td></tr>
            <tr v-else-if="apiError"><td colspan="8" class="px-6 py-8 text-center text-red-400 font-medium">Gagal memuat data. Server terputus.</td></tr>
            <tr v-else-if="dataList.length === 0"><td colspan="8" class="px-6 py-8 text-center text-slate-400">Tidak ada data PM ditemukan.</td></tr>
            
            <tr v-else v-for="(item, index) in dataList" :key="item.id" class="hover:bg-slate-50">
              <td class="px-4 py-4 font-bold text-slate-500 text-center">{{ index + 1 }}</td>
              <td class="px-4 py-4 font-medium">{{ item.plan_date }}</td>
              <td class="px-4 py-4">{{ item.actual_date || '-' }}</td>
              <td class="px-4 py-4 font-bold text-slate-800">{{ item.vendor }}</td>
              <td class="px-4 py-4">{{ item.device_type }}</td>
              <td class="px-4 py-4 text-center">
                <span class="px-2 py-1 text-[10px] font-bold uppercase rounded-full"
                  :class="item.status === 'Selesai' ? 'bg-emerald-100 text-emerald-700' : (item.status === 'Tertunda' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700')">
                  {{ item.status }}
                </span>
              </td>
              <td class="px-4 py-4 text-center">
                <a v-if="item.document_path" :href="getFileUrl(item.document_path)" target="_blank" class="inline-flex items-center gap-1 bg-sky-100 text-sky-600 hover:bg-sky-200 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                  <FileText class="w-3.5 h-3.5" /> Lihat PDF
                </a>
                <span v-else class="text-xs text-slate-400 italic">Belum Ada</span>
              </td>
              <td class="px-4 py-4 flex justify-center gap-2">
                <button @click="openFormModal(item)" class="p-1.5 bg-amber-100 text-amber-600 hover:bg-amber-200 rounded-md transition-colors" title="Edit"><Edit class="w-4 h-4" /></button>
                <button @click="deleteData(item.id)" class="p-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded-md transition-colors" title="Hapus"><Trash2 class="w-4 h-4" /></button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL FORM (TAMBAH/EDIT) -->
    <div v-if="isFormOpen" class="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="isFormOpen = false"></div>
      <div class="bg-white w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col">
        <div class="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 class="text-base font-bold text-slate-800">{{ isEditMode ? 'Edit Data PM' : 'Tambah Data PM' }}</h2>
          <button @click="isFormOpen = false" class="p-1 text-slate-400 hover:text-red-500 rounded-full transition-colors"><X class="w-5 h-5" /></button>
        </div>
        
        <form @submit.prevent="submitData" class="flex flex-col p-5 gap-4">
          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-xs font-bold text-slate-600 mb-1">Rencana PM</label>
              <input type="date" v-model="formData.plan_date" required class="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-sky-500 transition-colors">
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-bold text-slate-600 mb-1">Realisasi PM</label>
              <input type="date" v-model="formData.actual_date" class="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-sky-500 transition-colors">
            </div>
          </div>
          
          <div class="flex flex-col">
            <label class="text-xs font-bold text-slate-600 mb-1">Nama Vendor</label>
            <input type="text" v-model="formData.vendor" required placeholder="Contoh: PT. XYZ" class="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-sky-500 transition-colors">
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col">
              <label class="text-xs font-bold text-slate-600 mb-1">Jenis Perangkat</label>
              <select v-model="formData.device_type" required class="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-sky-500 transition-colors">
                <option value="" disabled>Pilih Perangkat</option>
                <option v-for="dev in deviceOptions" :key="dev" :value="dev">{{ dev }}</option>
              </select>
            </div>
            <div class="flex flex-col">
              <label class="text-xs font-bold text-slate-600 mb-1">Status</label>
              <select v-model="formData.status" required class="bg-slate-50 border border-slate-200 rounded-lg p-2 text-sm focus:outline-none focus:border-sky-500 transition-colors">
                <option value="" disabled>Pilih Status</option>
                <option v-for="stat in statusOptions" :key="stat" :value="stat">{{ stat }}</option>
              </select>
            </div>
          </div>

          <div class="flex flex-col">
            <label class="text-xs font-bold text-slate-600 mb-1">Upload Dokumen Hasil (Khusus PDF)</label>
            <input type="file" @change="handleFileUpload" accept="application/pdf" class="bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-sm file:mr-4 file:py-1.5 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-slate-200 file:text-slate-700 hover:file:bg-slate-300 transition-colors">
            <p v-if="isEditMode && formData.document_path" class="text-[10px] text-slate-400 mt-1">Biarkan kosong jika tidak ingin mengganti PDF lama.</p>
          </div>
          
          <div class="flex justify-end gap-2 mt-2">
            <button type="button" @click="isFormOpen = false" class="bg-slate-200 hover:bg-slate-300 text-slate-700 text-sm font-bold px-4 py-2 rounded-lg transition-colors">Batal</button>
            <button type="submit" :disabled="isSubmitting" class="bg-sky-600 hover:bg-sky-700 text-white text-sm font-bold px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors">
              <Loader2 v-if="isSubmitting" class="w-4 h-4 animate-spin" /> Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus, Edit, Trash2, X, FileText, Loader2 } from '@lucide/vue'
import ConnectionNotif from '@/components/ConnectionNotif.vue'
import api from '@/services/api' //[cite: 4]

const notifRef = ref(null)
const apiError = ref(false)

const deviceOptions = ['CCTV', 'DCMS', 'FM200', 'GENSET', 'PAC', 'RECTIFIER', 'TRAFO', 'UPS']
const statusOptions = ['Terjadwal', 'Selesai', 'Tertunda']

const dataList = ref([])
const isLoading = ref(true)
const isFormOpen = ref(false)
const isEditMode = ref(false)
const isSubmitting = ref(false)
const formData = ref({})
const selectedFile = ref(null)

const filters = ref({ startDate: '', endDate: '', device: '', status: '' })

// Ekstraksi Server URL[cite: 4]
const apiBaseURL = api.defaults.baseURL || 'http://localhost:5000/api'
const serverURL = apiBaseURL.replace(/\/api$/, '') 

const getFileUrl = (path) => {
  return `${serverURL}/${path}`
}

const fetchData = async () => {
  isLoading.value = true
  try {
    const query = new URLSearchParams()
    if (filters.value.startDate) query.append('startDate', filters.value.startDate)
    if (filters.value.endDate) query.append('endDate', filters.value.endDate)
    if (filters.value.device) query.append('device', filters.value.device)
    if (filters.value.status) query.append('status', filters.value.status)

    const res = await api.get(`/riwayat?${query.toString()}`)
    dataList.value = res.data
    
    // Recovery Notif
    if (apiError.value) {
      apiError.value = false
      notifRef.value?.showSuccess('Tersambung', 'Berhasil terhubung kembali ke server.')
    }
  } catch (error) {
    if (!apiError.value) {
      apiError.value = true
      notifRef.value?.showError('Koneksi Terputus!', 'Gagal memuat data riwayat PM.')
    }
    dataList.value = []
  } finally {
    isLoading.value = false
  }
}

const openFormModal = (item = null) => {
  selectedFile.value = null
  if (item) {
    isEditMode.value = true
    formData.value = { ...item }
  } else {
    isEditMode.value = false
    formData.value = { plan_date: '', actual_date: '', vendor: '', device_type: '', status: '' }
  }
  isFormOpen.value = true
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (file && file.type !== 'application/pdf') {
    alert('Hanya diperbolehkan mengunggah file berformat PDF!')
    event.target.value = ''
    return
  }
  selectedFile.value = file
}

const submitData = async () => {
  isSubmitting.value = true
  try {
    const payload = new FormData()
    payload.append('plan_date', formData.value.plan_date)
    if (formData.value.actual_date) payload.append('actual_date', formData.value.actual_date)
    payload.append('vendor', formData.value.vendor)
    payload.append('device_type', formData.value.device_type)
    payload.append('status', formData.value.status)
    if (selectedFile.value) payload.append('document', selectedFile.value)

    if (isEditMode.value) {
      await api.put(`/riwayat/${formData.value.id}`, payload, { headers: { 'Content-Type': 'multipart/form-data' }})
    } else {
      await api.post('/riwayat', payload, { headers: { 'Content-Type': 'multipart/form-data' }})
    }
    
    notifRef.value?.showSuccess('Berhasil', 'Data riwayat PM disimpan.')
    await fetchData()
    isFormOpen.value = false
  } catch (error) {
    notifRef.value?.showError('Gagal Menyimpan', 'Terjadi kesalahan pada server saat memproses data.')
  } finally {
    isSubmitting.value = false
  }
}

const deleteData = async (id) => {
  if (!confirm('Yakin ingin menghapus riwayat ini? Dokumen terkait juga akan terhapus.')) return
  try {
    await api.delete(`/riwayat/${id}`)
    notifRef.value?.showSuccess('Berhasil', 'Data dan dokumen terhapus.')
    await fetchData()
  } catch (error) {
    notifRef.value?.showError('Gagal Menghapus', 'Server gagal menghapus data.')
  }
}

onMounted(() => fetchData())
</script>

<style scoped>
.animate-fade-in { animation: fadeIn 0.2s ease-out; }
@keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
</style>