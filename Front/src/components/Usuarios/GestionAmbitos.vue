<template>
  <v-container class="py-8">
    <v-row>
        <v-card class="mx-auto pa-6" width="800">
        <v-card-title class="text-h6 mb-4">
            {{ editing ? 'Modificar Ámbito de actividad' : 'Registrar Ámbito de actividad' }}
            <v-chip v-if="ambito.id" color="blue" class="ml-2" small>
            {{ ambito.nombre }}
            </v-chip>
        </v-card-title>

        <!-- Lista -->
        <v-row v-if="ambitos.length > 0">
            <v-col cols="12">
            <v-card variant="outlined" class="mb-4">
                <v-card-title>Ámbito de actividad</v-card-title>
                <v-card-text>
                <div style="max-height: 500px; overflow-y: auto;">
                  <v-list>
                    <v-list-item
                    v-for="ambito in ambitos"
                    :key="ambito.id"
                    @click="pickAmbito(ambito)"
                    class="cursor-pointer"
                    >
                    <v-list-item-title>{{ ambito.nombre }}</v-list-item-title>
                    </v-list-item>
                  </v-list>
                </div>
                </v-card-text>
            </v-card>
            </v-col>
        </v-row>

        <!-- Formulario -->
        <v-form @submit.prevent="editing ? updateAmbito() : registerAmbito()">
            <v-row dense>
            <v-col cols="12">
              <v-text-field 
              class="input"
              v-model="ambito.nombre" 
              label="Nombre del Ámbito de actividad *" 
              :rules="[v => !!v || 'Nombre es requerido']"
              hint="Ejemplo: Escolar"
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
                @click="deleteAmbito"
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = localStorage.getItem('token')

const ambito = ref({
  id: null,
  nombre: ''
})

const snackbar = ref(false)
const snackbarContent = ref('')
const error = ref('')
const loading = ref(false)
const editing = ref(false)
const ambitos = ref([])

// Verificar rol del perfil
const verifyUser = async () => {
  if (!token) return
  try {
    const res = await axios.get('http://localhost:3000/api/usuarios/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    })

  } catch (err) {
    error.value = 'Error al cargar perfil'
    localStorage.removeItem('token')
  }
}

// Cargar ámbitos de actividad
const loadAmbitos = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/ambitos', {
            headers: { Authorization: `Bearer ${token}` }
        })
    ambitos.value = res.data
  } catch (err) {
    error.value = 'Error al cargar ámbitos de actividad'
    handleError(err)
  } finally {
    loading.value = false
  }
}

// Seleccionar ámbito de actividad
const pickAmbito = async (a) => {
  Object.assign(ambito.value, a)
  editing.value = true
}

// Insertar ámbito de actividad nuevo
const registerAmbito = async () => {
  error.value = ''
  loading.value = true
  try {
    const newData = {
      nombre: ambito.value.nombre,
    }

    const response = await axios.post('http://localhost:3000/api/ambitos', newData, {
        headers: { Authorization: `Bearer ${token}` }
    })

    showSnackbar(`${response.data.mensaje}`)
    loadAmbitos()
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

// Modificar ámbito de actividad
const updateAmbito = async () => {
  error.value = ''
  loading.value = true
  try {
    const updatedData = {
      nombre: ambito.value.nombre
    }
    const response = await axios.put(`http://localhost:3000/api/ambitos/${ambito.value.id}`, updatedData, {
                            headers: { Authorization: `Bearer ${token}` }
                        })
    
    showSnackbar(`${response.data.mensaje}`)
    loadAmbitos()
    resetForm()
  } catch (err) {
    handleError(err)
  } finally {
    loading.value = false
  }
}

// Elimnar ámbito de actividad
const deleteAmbito = async () => {
  try {
    const response = await axios.delete(`http://localhost:3000/api/ambitos/${ambito.value.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showSnackbar(`${response.data.mensaje}`)
    loadAmbitos()
    resetForm()
    editing.value = false
  } catch (err) {
    handleError(err)
  }
}

// Helpers
const resetForm = () => {
  ambito.value = {
    id: null,
    nombre: ''
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
    error.value = 'Ámbito de actividad no encontrado'
  } else {
    error.value = 'Error en el servidor'
  }
  console.error('Error:', err.response?.data || err.message)
}

onMounted(() => {
  verifyUser()
  loadAmbitos()
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