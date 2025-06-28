<script setup>
import Eliminados from '../Documentos/Eliminados.vue'
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const token = localStorage.getItem('token')

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
  jerarquia: '',
  vigente: true
})

const snackbar = ref(false)
const snackbarText = ref('')
const error = ref('')
const loading = ref(false)
const editando = ref(false)
const documentoEliminado = ref(false)
const searchWord = ref('')
const docs = ref([])
const docsVisibles = ref([])

const targetDoc = ref(null)

const filterVisible = ref(false)
const selectedTipo = ref('')
const searchAnio = ref(null)
const searchFuente = ref('')

const tiposDocumento = [
  'Ley',
  'Decreto',
  'Resolución',
  'Plan',
  'Norma',
  'Resolución_Municipal',
  'Otro'
]

const aplicaciones = [
  { nombre: 'Nacional', id: 1 },
  { nombre: 'Departamental', id: 2 },
  { nombre: 'Municipal', id: 3 },
]

const jerarquias = [
  'Suprema',
  'Alta',
  'Media alta',
  'Media',
  'Media baja',
  'Baja'
]

// Cargar perfil
const obtenerPerfil = async () => {
  if (!token) return
  try {
    const res = await axios.get('https://newjeans-back-production.up.railway.app/api/usuarios/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    })
    documento.value.creado_por = res.data.usuario.id
  } catch (err) {
    error.value = 'Error al cargar perfil'
    localStorage.removeItem('token')
  }
}

onMounted(() => {
  obtenerPerfil()
  buscarDocumentos()
})

// Funciones de búsqueda
const buscarDocumentos = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.get('https://newjeans-back-production.up.railway.app/api/documentos')
    docs.value = res.data
    docsVisibles.value = docs.value
  } catch (err) {
    error.value = 'Error al buscar documentos'
  } finally {
    loading.value = false
  }
}

const buscarPorPalabra = async () => {
  if (!searchWord.value || searchWord.value === '') docsVisibles.value = docs.value
  docsVisibles.value = docs.value.filter(doc => 
    (doc.codigo.toLowerCase().includes(searchWord.value.toLowerCase())) || 
    (doc.descripcion.toLowerCase().includes(searchWord.value.toLowerCase())) || 
    (doc.tipo.toLowerCase().includes(searchWord.value.toLowerCase())) || 
    (doc.anio.toString().toLowerCase().includes(searchWord.value.toLowerCase()))
  );
  if(docsVisibles.value.length === 0){
    mostrarSnackbar('Sin resultados de búsqueda.')
  }
}

const aplicarFiltros = async () => {
    searchWord.value = '';

    let filters = ['', '', ''], filtersString = '';
    if(selectedTipo.value !== null){
        filters[0] = `tipo=${encodeURIComponent(selectedTipo.value)}`;
    }
    if(searchFuente.value !== null){
        filters[1] = `fuente=${encodeURIComponent(searchFuente.value)}`;
    }
    if(searchAnio.value !== null){
        filters[2] = `anio=${encodeURIComponent(searchAnio.value)}`;
    }

    for(const filter of filters){
        if(filtersString === '' && filter !== ''){
            filtersString = filter;
        } else {
            if(filter !== ''){
                filtersString = filtersString.concat('&', filter);
            }
        }
    }

    if(filtersString !== ''){
        try {
            const url = `https://newjeans-back-production.up.railway.app/api/buscar?${filtersString}`;
            const response = await axios.get(url);
            docs.value = response.data;
            docsVisibles.value = docs.value
            if(docs.value.length === 0){
                snackbar.value = true;
                snackbarText.value = 'Sin resultados de búsqueda.';
            }
        } catch (error) {
            console.error('Error al obtener documentos:', error);
        }
    } else {
        snackbar.value = true;
        snackbarText.value = 'Elija los filtros a aplicar.';
    }
};

const limpiarFiltros = () => {
    selectedTipo.value = null;
    searchFuente.value = null;
    searchAnio.value = null;
    searchWord.value = null;
    buscarDocumentos();
};

const seleccionarDocumento = (doc) => {
  Object.assign(documento.value, doc)
  documento.value.vigente = Boolean(documento.value.vigente)
  editando.value = true
  documentoEliminado.value = doc.eliminado || false
  targetDoc.value.scrollIntoView({ behavior: 'smooth' })
}

// Operaciones CRUD
const registrarDocumento = async () => {
  error.value = ''
  loading.value = true
  try {
    const response = await axios.post('https://newjeans-back-production.up.railway.app/api/documentos/auto', documento.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    
    mostrarSnackbar('Documento registrado exitosamente.')
    buscarDocumentos()
    resetForm()
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
      vigente: documento.value.vigente
    }
    
    await axios.put(`https://newjeans-back-production.up.railway.app/api/documentos/${documento.value.codigo}`, datosActualizacion, {
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
    await axios.delete(`https://newjeans-back-production.up.railway.app/api/documentos/${documento.value.codigo}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    mostrarSnackbar('Documento eliminado correctamente')
    documentoEliminado.value = true
    buscarDocumentos()
    triggerChild()
  } catch (err) {
    manejarError(err)
  }
}

const restaurarDocumento = async () => {
  try {
    await axios.patch(`https://newjeans-back-production.up.railway.app/api/documentos/${documento.value.codigo}/restaurar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    mostrarSnackbar('Documento restaurado correctamente')
    documentoEliminado.value = false
    buscarDocumentos()
    triggerChild()
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
    jerarquia: null,
    vigente: true
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

// Para comunicarse con Eliminados
const child = ref(null)

const triggerChild = () => {
  if(child.value){
    child.value.cargarDocumentosEliminados()
  }
}

const childTriggered = () => {
  buscarDocumentos()
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

      <!-- Sección de búsqueda -->
      <v-row>
        <v-col cols="12">
          <v-text-field
            v-model="searchWord"
            label="Buscar documento por palabra clave"
            append-inner-icon="mdi-magnify"
            @click:append-inner="buscarPorPalabra"
            @keydown.enter="buscarPorPalabra"
            :disabled="editando"
            hint="Ingrese una sola palabra clave"
            persistent-hint
            clearable
          />
        </v-col>
      </v-row>

      <!-- Sección de filtros -->
       <v-row>
          <v-btn @click="filterVisible = !filterVisible" color="primary" block>
              {{ filterVisible ? 'Ocultar Filtros' : 'Mostrar Filtros' }}
          </v-btn>
      </v-row>
      <v-row>
        <v-col cols="12">
            <v-expand-transition>
                <v-card v-if="filterVisible" elevated>
                    <v-card-title>Filtros</v-card-title>
                    <v-card-text>
                    <v-form> 
                        <v-select
                        v-model="selectedTipo"
                        :items="tiposDocumento"
                        label="Tipo"
                        clearable
                        ></v-select>

                        <v-text-field
                        v-model="searchFuente"
                        label="Fuente"
                        type="text"
                        clearable
                        ></v-text-field>

                        <v-text-field
                        v-model="searchAnio"
                        label="Año"
                        type="number"
                        clearable
                        :rules="[
                          v => !!v || 'Año es requerido',
                          v => (v >= 2000 && v <= new Date().getFullYear()) || 'Año inválido'
                        ]"
                        ></v-text-field>
                    </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="aplicarFiltros" color="primary">
                            Aplicar filtros
                        </v-btn>
                        <v-btn @click="limpiarFiltros" color="red">
                            Limpiar filtros
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-expand-transition>
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
                  v-for="doc in docsVisibles"
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
      <v-form ref="targetDoc" @submit.prevent="editando ? actualizarDocumento() : registrarDocumento()">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-select
              class="input"
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
              class="input"
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
              class="input"
              v-model="documento.descripcion" 
              label="Descripción completa*" 
              rows="3"
              :rules="[v => !!v || 'Descripción es requerida']"
              hint="Describe el contenido y propósito del documento"
              persistent-hint
              required
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select
              class="input"
              v-model="documento.aplicacion_id"
              :items="aplicaciones"
              item-title="nombre"
              item-value="id"
              label="Nivel de aplicación*"
              :rules="[v => !!v || 'Nivel de aplicación es requerido']"
              hint="Selecciona el nivel administrativo"
              persistent-hint
              required
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-select 
              class="input"
              v-model.number="documento.jerarquia" 
              :items="jerarquias"
              label="Nivel de jerarquía" 
              hint="Nivel jerárquico normativo"
              persistent-hint
              :rules="[v => !!v || 'Nivel de jerarquía es requerido']"
            />
          </v-col>
          <v-col cols="12" sm="4">
            <v-text-field 
              class="input"
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
            <v-textarea 
              class="input"
              v-model="documento.relevancia" 
              label="Relevancia" 
              rows="2"
              hint="Ejemplo: Establece criterios nutricionales mínimos"
              persistent-hint
            />
          </v-col>
          <v-col cols="12">
            <v-text-field 
              class="input"
              v-model="documento.enlace" 
              label="URL del documento" 
              type="url"
              hint="Enlace oficial al documento"
              persistent-hint
            />
          </v-col>
          <v-col cols="12">
            <v-text-field 
              class="input"
              v-model="documento.conceptos_cpe" 
              label="Conceptos CPE relacionados" 
              hint="Conceptos constitucionales vinculados"
              persistent-hint
            />
          </v-col>
          <v-col cols="12">
            <v-checkbox 
              class="input"
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
            v-if="editando"
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
    <Eliminados ref="child" @childTriggered="childTriggered"/>
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