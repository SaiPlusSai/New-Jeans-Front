<script setup>
import Eliminados from '../Documentos/Eliminados.vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = localStorage.getItem('token')

// Refs y variables
const usuario = ref(null)
const rol = ref(null)
const aplicaciones = ref([])
const usuarios = ref([])

const documento = ref({
  tipo: '',
  fuente: '',
  descripcion: '',
  relevancia: '',
  anio: new Date().getFullYear(),
  enlace: '',
  aplicacion_id: null,
  conceptos_cpe: '',
  creado_por: null,
  jerarquia: null,
  vigente: true,
  aplicacion: 'Nacional'
})

const snackbar = ref(false)
const snackbarText = ref('')
const error = ref('')
const loading = ref(false)
const editando = ref(false)
const documentoEliminado = ref(false)
const searchWord = ref('')
const docs = ref([])
const showEliminados = ref(false)

const tiposDocumento = [
  'Ley',
  'Decreto Supremo',
  'Resolución Ministerial',
  'Plan',
  'Norma',
  'Resolución Municipal',
  'Otro'
]

// Computed
const aplicacionesOptions = computed(() => {
  return aplicaciones.value.map(app => ({
    title: app.nombre,
    value: app.id
  }))
})

const usuariosOptions = computed(() => {
  return usuarios.value.map(user => ({
    title: `${user.nombre} (${user.email})`,
    value: user.id
  }))
})

// Cargar datos iniciales
const cargarDatosIniciales = async () => {
  try {
    const [appsRes, usersRes] = await Promise.all([
      axios.get('http://localhost:3000/api/aplicaciones'),
      axios.get('http://localhost:3000/api/usuarios', {
        headers: { Authorization: `Bearer ${token}` }
      })
    ])
    aplicaciones.value = appsRes.data
    usuarios.value = usersRes.data
  } catch (err) {
    console.error('Error cargando datos:', err)
  }
}

// Cargar perfil
const obtenerPerfil = async () => {
  if (!token) return
  try {
    const res = await axios.get('http://localhost:3000/api/usuarios/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    })
    usuario.value = res.data
    rol.value = res.data.rol || 'sin rol'
    documento.value.creado_por = usuario.value.id
  } catch (err) {
    error.value = 'Error al cargar perfil'
    localStorage.removeItem('token')
  }
}

onMounted(() => {
  obtenerPerfil()
  cargarDatosIniciales()
  buscarDocumentos()
})

// Funciones de búsqueda
const buscarDocumentos = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.get('http://localhost:3000/api/documentos')
    docs.value = res.data
  } catch (err) {
    error.value = 'Error al buscar documentos'
  } finally {
    loading.value = false
  }
}

const buscarPorCodigo = async () => {
  if (!searchWord.value) return
  error.value = ''
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:3000/api/documentos/${searchWord.value}`)
    Object.assign(documento.value, res.data)
    editando.value = true
    documentoEliminado.value = res.data.eliminado || false
  } catch (err) {
    if (err.response?.status === 404) {
      try {
        const res = await axios.get(`http://localhost:3000/api/documentos/${searchWord.value}?eliminado=true`)
        Object.assign(documento.value, res.data)
        editando.value = true
        documentoEliminado.value = true
      } catch (err2) {
        error.value = 'Documento no encontrado'
        resetForm()
      }
    } else {
      error.value = 'Error al buscar documento'
      resetForm()
    }
  } finally {
    loading.value = false
  }
}

const seleccionarDocumento = (doc) => {
  Object.assign(documento.value, doc)
  editando.value = true
  documentoEliminado.value = doc.eliminado || false
}

// Operaciones CRUD
const registrarDocumento = async () => {
  error.value = ''
  loading.value = true
  try {
    const response = await axios.post('http://localhost:3000/api/documentos/auto', documento.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    mostrarSnackbar(response.data.mensaje)
    documento.value.codigo = response.data.codigo
    editando.value = true
    buscarDocumentos()
  } catch (err) {
    manejarError(err)
    if (err.response?.data?.detalles) {
      error.value = err.response.data.detalles.join(', ')
    }
  } finally {
    loading.value = false
  }
}

const actualizarDocumento = async () => {
  error.value = ''
  loading.value = true
  try {
    const datosActualizacion = {
      tipo: documento.value.tipo,
      descripcion: documento.value.descripcion,
      relevancia: documento.value.relevancia,
      anio: documento.value.anio,
      enlace: documento.value.enlace,
      aplicacion_id: documento.value.aplicacion_id,
      conceptos_cpe: documento.value.conceptos_cpe,
      creado_por: documento.value.creado_por,
      jerarquia: documento.value.jerarquia,
      vigente: documento.value.vigente,
      aplicacion: documento.value.aplicacion
    }
    
    await axios.put(`http://localhost:3000/api/documentos/${documento.value.codigo}`, datosActualizacion, {
      headers: { Authorization: `Bearer ${token}` }
    })
    mostrarSnackbar('Documento actualizado con éxito')
    buscarDocumentos()
  } catch (err) {
    manejarError(err)
  } finally {
    loading.value = false
  }
}

const eliminarDocumento = async () => {
  try {
    await axios.delete(`http://localhost:3000/api/documentos/${documento.value.codigo}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    mostrarSnackbar('Documento eliminado correctamente')
    documentoEliminado.value = true
    buscarDocumentos()
  } catch (err) {
    manejarError(err)
  }
}

const restaurarDocumento = async () => {
  try {
    await axios.patch(`http://localhost:3000/api/documentos/${documento.value.codigo}/restaurar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    mostrarSnackbar('Documento restaurado correctamente')
    documentoEliminado.value = false
    buscarDocumentos()
    resetForm()
  } catch (err) {
    manejarError(err)
  }
}

// Helpers
const resetForm = () => {
  documento.value = {
    tipo: '',
    fuente: '',
    descripcion: '',
    relevancia: '',
    anio: new Date().getFullYear(),
    enlace: '',
    aplicacion_id: null,
    conceptos_cpe: '',
    creado_por: usuario.value?.id || null,
    jerarquia: null,
    vigente: true,
    aplicacion: 'Nacional'
  }
  editando.value = false
  documentoEliminado.value = false
  searchWord.value = ''
}

const mostrarSnackbar = (mensaje) => {
  snackbarText.value = mensaje
  snackbar.value = true
}

const manejarError = (err) => {
  if (err.response?.status === 401 || err.response?.status === 403) {
    error.value = 'No tienes permisos para esta acción'
    router.push('/login')
  } else if (err.response?.status === 400) {
    error.value = err.response.data.message || 'Datos inválidos'
  } else if (err.response?.status === 404) {
    error.value = 'Documento no encontrado'
  } else {
    error.value = 'Error en el servidor'
  }
  console.error('Error:', err.response?.data || err.message)
}
</script>

<template>
  <v-container class="py-8">
    <v-card class="mx-auto pa-6" max-width="800">
      <v-card-title class="text-h6 mb-4">
        {{ editando ? 'Modificar Documento' : 'Registrar Documento' }}
        <v-chip v-if="documentoEliminado" color="red" class="ml-2" small>
          Eliminado
        </v-chip>
        <v-chip v-if="documento.codigo" color="green" class="ml-2" small>
          {{ documento.codigo }}
        </v-chip>
      </v-card-title>

      <div class="mb-4" v-if="usuario">
        <p><strong>Usuario:</strong> {{ usuario.nombre }}</p>
        <p><strong>Rol:</strong> {{ rol }}</p>
      </div>

      <!-- Sección de búsqueda -->
      <v-row>
        <v-col cols="12" sm="8">
          <v-text-field
            v-model="searchWord"
            label="Buscar documento por código"
            append-inner-icon="mdi-magnify"
            @click:append-inner="buscarPorCodigo"
            :disabled="editando"
            hint="Ingrese el código exacto del documento"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" sm="4">
          <v-btn
            color="primary"
            @click="buscarDocumentos"
            block
          >
            <v-icon start>mdi-refresh</v-icon>
            Actualizar lista
          </v-btn>
        </v-col>
      </v-row>

      <!-- Resultados de búsqueda -->
      <v-row v-if="docs.length > 0">
        <v-col cols="12">
          <v-card variant="outlined" class="mb-4">
            <v-card-title>Documentos disponibles</v-card-title>
            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="doc in docs"
                  :key="doc.codigo"
                  @click="seleccionarDocumento(doc)"
                  class="cursor-pointer"
                >
                  <template v-slot:prepend>
                    <v-icon :color="doc.vigente ? 'green' : 'orange'">
                      mdi-file-document
                    </v-icon>
                  </template>
                  <v-list-item-title>{{ doc.descripcion }}</v-list-item-title>
                  <v-list-item-subtitle>
                    {{ doc.codigo }} - {{ doc.tipo }} ({{ doc.anio }})
                  </v-list-item-subtitle>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>

      <!-- Formulario -->
      <v-form @submit.prevent="editando ? actualizarDocumento() : registrarDocumento()">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-select
              v-model="documento.tipo"
              :items="tiposDocumento"
              label="Tipo de documento*"
              outlined
              required
              :rules="[v => !!v || 'Tipo es requerido']"
              hint="Selecciona el tipo de documento normativo"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field 
              v-model="documento.fuente" 
              label="Fuente u origen*" 
              :rules="[v => !!v || 'Fuente es requerida']"
              hint="Ejemplo: Ministerio de Economía"
              persistent-hint
              required
            />
          </v-col>
          <v-col cols="12">
            <v-textarea 
              v-model="documento.descripcion" 
              label="Descripción completa*" 
              rows="3"
              :rules="[v => !!v || 'Descripción es requerida']"
              hint="Describe el contenido y propósito del documento"
              persistent-hint
              required
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field 
              v-model="documento.relevancia" 
              label="Nivel de relevancia" 
              hint="Ejemplo: Alto, Medio, Bajo"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field 
              v-model.number="documento.anio" 
              label="Año de publicación*" 
              type="number"
              :rules="[
                v => !!v || 'Año es requerido',
                v => (v >= 2000 && v <= new Date().getFullYear()) || 'Año inválido'
              ]"
              hint="Año de emisión del documento"
              persistent-hint
              required
            />
          </v-col>
          <v-col cols="12">
            <v-text-field 
              v-model="documento.enlace" 
              label="URL del documento" 
              type="url"
              hint="Enlace oficial al documento"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="documento.aplicacion_id"
              :items="aplicacionesOptions"
              label="Ámbito de aplicación"
              item-title="title"
              item-value="value"
              clearable
              hint="Selecciona el ámbito territorial de aplicación"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="documento.aplicacion"
              :items="['Nacional', 'Departamental', 'Municipal']"
              label="Nivel de aplicación*"
              :rules="[v => !!v || 'Nivel es requerido']"
              hint="Selecciona el nivel administrativo"
              persistent-hint
              required
            />
          </v-col>
          <v-col cols="12">
            <v-text-field 
              v-model="documento.conceptos_cpe" 
              label="Conceptos CPE relacionados" 
              hint="Conceptos constitucionales vinculados"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="documento.creado_por"
              :items="usuariosOptions"
              label="Responsable del registro"
              item-title="title"
              item-value="value"
              :disabled="!usuario || rol !== 'admin'"
              hint="Usuario responsable del registro"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field 
              v-model.number="documento.jerarquia" 
              label="Nivel de jerarquía" 
              type="number"
              hint="Nivel jerárquico normativo (1-5)"
              persistent-hint
              :rules="[v => !v || (v >= 1 && v <= 5) || 'Debe ser entre 1 y 5']"
            />
          </v-col>
          <v-col cols="12">
            <v-checkbox 
              v-model="documento.vigente" 
              label="¿Documento vigente?"
              hint="Indica si el documento está actualmente en vigor"
              persistent-hint
            />
          </v-col>
        </v-row>

        <div class="d-flex flex-wrap gap-2 mt-4">
          <v-btn type="submit" color="primary" :loading="loading">
            <v-icon start>mdi-content-save</v-icon>
            {{ editando ? 'Actualizar' : 'Registrar' }}
          </v-btn>

          <v-btn
            v-if="editando && !documentoEliminado"
            color="red"
            @click="eliminarDocumento"
          >
            <v-icon start>mdi-delete</v-icon>
            Eliminar
          </v-btn>

          <v-btn
            v-if="editando && documentoEliminado"
            color="green"
            @click="restaurarDocumento"
          >
            <v-icon start>mdi-restore</v-icon>
            Restaurar
          </v-btn>

          <v-btn
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

    <v-snackbar v-model="snackbar" color="green" timeout="3000">
      {{ snackbarText }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
    <Eliminados />
  </v-container>
</template>

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