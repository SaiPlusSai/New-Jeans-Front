<template>
  <v-container class="py-8">
    <v-card class="mx-auto pa-6 mb-8" width="700">
      <v-card-title class="text-h6 mb-4">
        Gestión de Zonas por Macrodistrito
      </v-card-title>

      <!-- Selección de macrodistrito -->
      <v-select
        v-model="selectedMacroId"
        :items="macros"
        item-title="nombre"
        item-value="id"
        label="Selecciona un macrodistrito"
        :loading="loadingMacros"
        :disabled="loadingMacros"
        return-object
        persistent-hint
      ></v-select>

      <!-- Zonas activas -->
      <v-card variant="outlined" class="mt-6" v-if="selectedMacroId">
        <v-card-title>Zonas de {{ selectedMacroId.nombre }}</v-card-title>
        <v-card-text>
          <div v-if="zonas.length" style="max-height: 300px; overflow-y: auto;">
            <v-list>
              <v-list-item v-for="zona in zonas" :key="zona.id">
                <v-text-field
                  v-model="zonaEdit[zona.id]"
                  label="Nombre de zona"
                  variant="underlined"
                  density="compact"
                  class="me-2"
                  hide-details
                />
                <v-btn icon color="green" @click="actualizarZona(zona.id, zonaEdit[zona.id])">
                  <v-icon>mdi-content-save</v-icon>
                </v-btn>
                <v-btn icon color="red" @click="eliminarZona(zona.id)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-list-item>
            </v-list>
          </div>
          <div v-else class="mb-3">Este macrodistrito aún no tiene zonas registradas.</div>

          <!-- Nueva zona -->
          <v-text-field
            v-model="nuevaZona"
            label="Nueva zona"
            hint="Ej. Villa Fátima"
            class="mt-4"
          />
          <v-btn color="primary" @click="crearZona" :loading="loadingZona" class="mt-2">
            <v-icon start>mdi-plus</v-icon>Agregar Zona
          </v-btn>

          <p v-if="errorZona" class="text-red mt-2">{{ errorZona }}</p>
        </v-card-text>
      </v-card>
    </v-card>

    <!-- Zonas eliminadas -->
    <v-card class="mx-auto pa-6" width="700">
      <v-card-title class="text-h6 mb-4">
        Zonas eliminadas
      </v-card-title>
      <v-card-text>
        <div v-if="zonasEliminadas.length" style="max-height: 300px; overflow-y: auto;">
          <v-list>
            <v-list-item v-for="zona in zonasEliminadas" :key="zona.id">
              <v-list-item-title class="text-grey">{{ zona.nombre_zona }} ({{ nombreMacro(zona.macrodistrito_id) }})</v-list-item-title>
              <v-btn icon color="blue" @click="restaurarZona(zona)">
                <v-icon>mdi-restore</v-icon>
              </v-btn>
            </v-list-item>
          </v-list>
        </div>
        <div v-else class="text-grey">No hay zonas eliminadas.</div>
      </v-card-text>
    </v-card>

    <v-snackbar v-model="snackbar" color="green" timeout="3000">
      {{ snackbarContent }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import axios from 'axios'

const token = localStorage.getItem('token')

const macros = ref([])
const loadingMacros = ref(false)
const selectedMacroId = ref(null)

const zonas = ref([])
const zonasEliminadas = ref([])
const nuevaZona = ref('')
const errorZona = ref('')
const loadingZona = ref(false)

const snackbar = ref(false)
const snackbarContent = ref('')

const zonaEdit = ref({})

const showSnackbar = (mensaje) => {
  snackbarContent.value = mensaje
  snackbar.value = true
}

// Cargar todos los macrodistritos
const loadMacros = async () => {
  loadingMacros.value = true
  try {
    const res = await axios.get('/api/macrodistritos', {
      headers: { Authorization: `Bearer ${token}` }
    })
    macros.value = res.data
  } catch (err) {
    console.error('Error al cargar macrodistritos')
  } finally {
    loadingMacros.value = false
  }
}

// Cargar zonas activas del macrodistrito seleccionado
const cargarZonas = async () => {
  zonas.value = []
  errorZona.value = ''
  zonaEdit.value = {}

  if (!selectedMacroId.value?.id) return

  try {
    const res = await axios.get(`/api/macrodistrito/${selectedMacroId.value.id}/zonas`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    zonas.value = res.data.filter(z => z.eliminado === 0)
    zonas.value.forEach(z => {
      zonaEdit.value[z.id] = z.nombre_zona
    })
  } catch (err) {
    errorZona.value = 'No se pudieron cargar las zonas'
  }
}

// Cargar zonas eliminadas
const cargarZonasEliminadas = async () => {
  try {
    const res = await axios.get('/api/zonas', {
      headers: { Authorization: `Bearer ${token}` }
    })
    zonasEliminadas.value = res.data.filter(z => z.eliminado === 1)
  } catch (err) {
    console.error('No se pudieron cargar zonas eliminadas')
  }
}

// Crear una nueva zona
const crearZona = async () => {
  if (!nuevaZona.value.trim()) return
  loadingZona.value = true
  try {
    const data = {
      macrodistrito_id: selectedMacroId.value.id,
      nombre: nuevaZona.value.trim()
    }

    const res = await axios.post('/api/zonas', data, {
      headers: { Authorization: `Bearer ${token}` }
    })

    nuevaZona.value = ''
    errorZona.value = ''
    showSnackbar(res.data.mensaje)
    await cargarZonas()
  } catch (err) {
    if (err.response?.status === 400) {
      errorZona.value = err.response.data.mensaje
    } else {
      errorZona.value = 'Error al crear la zona'
    }
  } finally {
    loadingZona.value = false
  }
}

// Actualizar zona
const actualizarZona = async (id, nuevoNombre) => {
  try {
    const res = await axios.put(`/api/zonas/${id}`, {
      nombre: nuevoNombre
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showSnackbar(res.data.mensaje || 'Zona actualizada')
    await cargarZonas()
  } catch (err) {
    errorZona.value = 'Error al actualizar la zona'
  }
}

// Restaurar zona eliminada
const restaurarZona = async (zona) => {
  try {
    const res = await axios.put(`/api/zonas/${zona.id}`, {
      nombre: zona.nombre_zona
    }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showSnackbar('Zona restaurada')
    await cargarZonas()
    await cargarZonasEliminadas()
  } catch (err) {
    errorZona.value = 'No se pudo restaurar la zona'
  }
}

// Eliminar zona (lógicamente)
const eliminarZona = async (id) => {
  try {
    await axios.delete(`/api/zonas/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    showSnackbar('Zona eliminada exitosamente')
    await cargarZonas()
    await cargarZonasEliminadas()
  } catch (err) {
    errorZona.value = 'No se pudo eliminar la zona'
  }
}

// Obtener nombre de macrodistrito por ID
const nombreMacro = (id) => {
  const m = macros.value.find(m => m.id === id)
  return m ? m.nombre : 'Desconocido'
}

watch(selectedMacroId, () => {
  if (selectedMacroId.value) cargarZonas()
})

onMounted(() => {
  loadMacros()
  cargarZonasEliminadas()
})
</script>

<style scoped>
.text-red {
  color: #ff5252;
  font-weight: 500;
}

.text-grey {
  color: #666;
}

.v-text-field[disabled] input {
  color: #aaa;
  text-decoration: line-through;
}
</style>
