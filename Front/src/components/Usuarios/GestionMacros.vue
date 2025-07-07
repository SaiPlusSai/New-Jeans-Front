<template>
  <v-container class="py-8">
    <v-row>
        <v-card class="mx-auto pa-6" width="800">
        <v-card-title class="text-h6 mb-4">
            {{ editing ? 'Modificar Macrodistrito' : 'Registrar Macrodistrito' }}
            <v-chip v-if="macro.id" color="blue" class="ml-2" small>
            {{ macro.nombre }}
            </v-chip>
        </v-card-title>

        <!-- Lista -->
        <v-row v-if="macros.length > 0">
            <v-col cols="12">
            <v-card variant="outlined" class="mb-4">
                <v-card-title>Macrodistritos</v-card-title>
                <v-card-text>
                <div style="max-height: 500px; overflow-y: auto;">
                  <v-list>
                    <v-list-item
                    v-for="macro in macros"
                    :key="macro.id"
                    @click="pickMacro(macro)"
                    class="cursor-pointer"
                    >
                    <v-list-item-title>{{ macro.nombre }}</v-list-item-title>
                    <v-list-item-subtitle>
                        {{ macro.descripcion }}
                    </v-list-item-subtitle>
                    </v-list-item>
                  </v-list>
                </div>
                </v-card-text>
            </v-card>
            </v-col>
        </v-row>

        <!-- Formulario -->
        <v-form @submit.prevent="editing ? updateMacro() : registerMacro()">
            <v-row dense>
            <v-col cols="12" sm="6">
              <v-text-field 
              class="input"
              v-model="macro.nombre" 
              label="Nombre del Macrodistrito *" 
              :rules="[v => !!v || 'Nombre es requerido']"
              hint="Ejemplo: Periférica"
              persistent-hint
              required
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field 
              class="input"
              v-model="macro.descripcion" 
              label="Descripción del Macrodistrito *" 
              :rules="[v => !!v || 'Descripción es requerida']"
              hint="Ejemplo: Área rural con centros poblados."
              persistent-hint
              required
              />
            </v-col>
            </v-row>

            <div class="d-flex flex-wrap gap-2 mt-4">
            <v-btn type="submit" color="primary" :loading="loading">
                <v-icon start>mdi-content-save</v-icon>
                {{ editing ? 'Actualizar' : 'Registrar' }}
            </v-btn>

            <v-btn
                v-if="editing"
                color="red"
                @click="deleteMacro"
            >
                <v-icon start>mdi-delete</v-icon>
                Eliminar
            </v-btn>

            <v-btn
                v-if="editing"
                color="grey"
                @click="resetForm"
            >
                <v-icon start>mdi-cancel</v-icon>
                Cancelar
            </v-btn>
            </div>

            <p v-if="error" class="mt-3 text-red">{{ error }}</p>
        </v-form>
        </v-card>
    </v-row>

    <v-snackbar v-model="snackbar" color="green" timeout="3000">
      {{ snackbarContent }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
  <Zonas />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

import Zonas from '@/components/Usuarios/GestionZonas.vue'

const router = useRouter()
const token = localStorage.getItem('token')

const macro = ref({
  id: null,
  nombre: '',
  descripcion: ''
})

const snackbar = ref(false)
const snackbarContent = ref('')
const error = ref('')
const loading = ref(false)
const editing = ref(false)
const macros = ref([])

// Verificar rol del perfil
const verifyUser = async () => {
  if (!token) return
  try {
    const res = await axios.get('https://newjeans-back-production.up.railway.app/api/usuarios/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    })

  } catch (err) {
    error.value = 'Error al cargar perfil'
    localStorage.removeItem('token')
  }
}

// Cargar macrodistritos
const loadMacros = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.get('https://newjeans-back-production.up.railway.app/api/macrodistritos', {
            headers: { Authorization: `Bearer ${token}` }
        })
    macros.value = res.data
  } catch (err) {
    error.value = 'Error al cargar macrodistritos'
    handleError(err)
  } finally {
    loading.value = false
  }
}

// Seleccionar macrodistrito
const pickMacro = async (m) => {
  Object.assign(macro.value, m)
  editing.value = true
}

// Insertar macrodistrito nuevo
const registerMacro = async () => {
  error.value = ''
  loading.value = true
  try {
    const newData = {
      nombre: macro.value.nombre,
      descripcion: macro.value.descripcion
    }

    const response = await axios.post('https://newjeans-back-production.up.railway.app/api/macrodistritos', newData, {
        headers: { Authorization: `Bearer ${token}` }
    })

    showSnackbar(`${response.data.mensaje}`)
    loadMacros()
    resetForm()
  } catch (err) {
    handleError(err)
    if (err.response?.data?.detalles) {
      error.value = err.response.data.detalles.join(', ')
    }
  } finally {
    loading.value = false
  }
}

// Modificar macrodistrito
const updateMacro = async () => {
  error.value = ''
  loading.value = true
  try {
    const updatedData = {
      nombre: macro.value.nombre,
      descripcion: macro.value.descripcion
    }
    const response = await axios.put(`https://newjeans-back-production.up.railway.app/api/macrodistritos/${macro.value.id}`, updatedData, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
    
    showSnackbar(`${response.data.mensaje}`)
    loadMacros()
    resetForm()
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

// Elimnar macrodistrito
const deleteMacro = async () => {
  try {
    const response = await axios.delete(`https://newjeans-back-production.up.railway.app/api/macrodistritos/${macro.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showSnackbar(`${response.data.mensaje}`)
    loadMacros()
    resetForm()
    editing.value = false
  } catch (err) {
    handleError(err)
  }
}

// Helpers
const resetForm = () => {
  macro.value = {
    id: null,
    nombre: '',
    descripcion: ''
  }
  editing.value = false
}

const showSnackbar = (mensaje) => {
  snackbarContent.value = mensaje
  snackbar.value = true
}

const handleError = (err) => {
  if (err.response?.status === 401 || err.response?.status === 403) {
    error.value = 'No tienes permisos para esta acción'
    router.push('/login')
  } else if (err.response?.status === 400) {
    error.value = err.response.data.message || 'Datos inválidos'
  } else if (err.response?.status === 404) {
    error.value = 'Macrodistrito no encontrado'
  } else {
    error.value = 'Error en el servidor'
  }
  console.error('Error:', err.response?.data || err.message)
}

onMounted(() => {
  verifyUser()
  loadMacros()
})
</script>


<style scoped>
.v-container {
  background: linear-gradient(145deg, #f5f7fa, #e4e8f0);
  min-height: 100vh;
  padding: 2rem;
}

.v-card {
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.input {
  padding: 10px;
}

.cursor-pointer {
  cursor: pointer;
  transition: background-color 0.2s;
}

.cursor-pointer:hover {
  background-color: #f5f5f5;
}

.gap-2 {
  gap: 8px;
}

.text-red {
  color: #ff5252;
  font-weight: 500;
}

.v-btn {
  font-weight: 500;
  letter-spacing: normal;
  text-transform: none;
}

</style>