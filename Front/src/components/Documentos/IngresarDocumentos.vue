<script setup>
import Eliminados from '../Documentos/Eliminados.vue'
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

// Refs y variables
const token = localStorage.getItem('token')
const usuario = ref(null)
const rol = ref(null)
const aplicaciones = ref([])
const usuarios = ref([])

const documento = ref({
  codigo: '',
  tipo: '',
  fuente: '',
  descripcion: '',
  relevancia: '',
  anio: '',
  enlace: '',
  aplicacion_id: null,
  conceptos_cpe: '',
  creado_por: null,
  jerarquia: null,
  vigente: false,
  aplicacion: ''
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

// Cargar perfil automáticamente si hay token
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
  if (!documento.value.codigo) return
  error.value = ''
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:3000/api/documentos/${documento.value.codigo}`)
    Object.assign(documento.value, res.data)
    documento.value.vigente = res.data.vigente === 1 || res.data.vigente === true
    editando.value = true
    documentoEliminado.value = res.data.eliminado || false
  } catch (err) {
    if (err.response?.status === 404) {
      // Intenta buscar en eliminados si no se encuentra
      try {
        const res = await axios.get(`http://localhost:3000/api/documentos/${documento.value.codigo}?eliminado=true`)
        Object.assign(documento.value, res.data)
        documento.value.vigente = res.data.vigente === 1 || res.data.vigente === true
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
  documento.value.vigente = doc.vigente === 1 || doc.vigente === true
  editando.value = true
  documentoEliminado.value = doc.eliminado || false
}

// Operaciones CRUD
const registrarDocumento = async () => {
  error.value = ''
  loading.value = true
  try {
    await axios.post('http://localhost:3000/api/documentos', documento.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    mostrarSnackbar('Documento registrado con éxito')
    resetForm()
    buscarDocumentos()
  } catch (err) {
    manejarError(err)
  } finally {
    loading.value = false
  }
}

const actualizarDocumento = async () => {
  error.value = ''
  loading.value = true
  try {
    // Creamos un objeto con solo los campos editables (excluyendo código y fuente)
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
  Object.keys(documento.value).forEach(k => documento.value[k] = typeof documento.value[k] === 'boolean' ? false : '')
  if (usuario.value) documento.value.creado_por = usuario.value.id
  editando.value = false
  documentoEliminado.value = false
}

const mostrarSnackbar = (mensaje) => {
  snackbarText.value = mensaje
  snackbar.value = true
}

const manejarError = (err) => {
  if (err.response?.status === 401 || err.response?.status === 403) {
    error.value = 'No tienes permisos para esta acción'
  } else if (err.response?.status === 400) {
    error.value = err.response.data.message || 'Datos inválidos'
  } else if (err.response?.status === 404) {
    error.value = 'Documento no encontrado'
  } else {
    error.value = 'Error en el servidor'
  }
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
      </v-card-title>

      <div class="mb-4" v-if="usuario">
        <p><strong>Usuario:</strong> {{ usuario.nombre }}</p>
        <p><strong>Rol:</strong> {{ rol }}</p>
      </div>

      <!-- Sección de búsqueda -->
      <v-row>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="searchWord"
            append-inner-icon="mdi-magnify"
            label="Buscar en documentos"
            @keydown.enter="buscarDocumentos"
            @click:append-inner="buscarDocumentos"
            clearable
            hint="Buscar por descripción o tipo"
            persistent-hint
          />
        </v-col>
        <v-col cols="12" sm="6">
          <v-text-field
            v-model="documento.codigo"
            label="Buscar por código exacto"
            append-inner-icon="mdi-magnify"
            @click:append-inner="buscarPorCodigo"
            :disabled="editando"
            hint="Ingrese el código exacto del documento (activo o eliminado)"
            persistent-hint
          />
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
                    <v-icon color="green">mdi-file-document</v-icon>
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
            <v-text-field 
              v-model="documento.codigo" 
              label="Código único del documento" 
              :disabled="editando" 
              required
              hint="Ejemplo: LEY-1234-2023"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="documento.tipo"
              :items="tiposDocumento"
              label="Tipo de documento"
              outlined
              required
              hint="Selecciona el tipo de documento normativo"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field 
              v-model="documento.fuente" 
              label="Fuente u origen" 
              :disabled="editando"
              hint="Ejemplo: Ministerio de Economía"
              persistent-hint
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
          <v-col cols="12">
            <v-textarea 
              v-model="documento.descripcion" 
              label="Descripción completa" 
              rows="3"
              hint="Describe el contenido y propósito del documento"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field 
              v-model="documento.anio" 
              label="Año de publicación" 
              type="number"
              hint="Año de emisión del documento"
              persistent-hint
            />
          </v-col>
          <v-col cols="12" sm="6">
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
              :items="[
                { title: 'Nacional', value: 'Nacional' },
                { title: 'Departamental', value: 'Departamental' },
                { title: 'Municipal', value: 'Municipal' }
              ]"
              label="Nivel de aplicación"
              item-title="title"
              item-value="value"
              hint="Selecciona el nivel administrativo"
              persistent-hint
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
  background: linear-gradient(145deg, #fdf6f0, #f3f8ff);
  min-height: 100vh;
  padding: 2rem;
}

.v-card {
  background-color: #ffffffd0;
  border: 2px solid #f0e6ff;
  border-radius: 20px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease;
}

.v-card:hover {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}

.v-card-title {
  font-family: "Poppins", sans-serif;
  font-size: 1.4rem;
  font-weight: 600;
  color: #6b4c9a;
  text-align: center;
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
  color: #cf2e2e;
  font-weight: 500;
}

/* Estilos para los botones */
.v-btn {
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
  text-transform: none;
  letter-spacing: normal;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.v-btn[color="primary"] {
  background-color: #4a6bff;
  color: white;
}

.v-btn[color="red"] {
  background-color: #ff4d4d;
  color: white;
}

.v-btn[color="green"] {
  background-color: #4caf50;
  color: white;
}

.v-btn[color="grey"] {
  background-color: #9e9e9e;
  color: white;
}

/* Estilos para los campos del formulario */
.v-text-field, .v-select, .v-textarea {
  background-color: #fafafa;
  border-radius: 8px;
}

.v-input__details {
  padding-top: 4px;
}

/* Estilos para la lista de resultados */
.v-list-item {
  border-left: 3px solid transparent;
  transition: all 0.2s;
}

.v-list-item:hover {
  border-left-color: #4a6bff;
}
</style>