<script setup>
import { ref } from 'vue'
import axios from 'axios'

const token = localStorage.getItem('token')
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
const error = ref('')
const loading = ref(false)
const editando = ref(false)
const documentoEliminado = ref(false)
const codigoBusqueda = ref('')

// Buscar documento por código
const buscarPorCodigo = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.get(`http://localhost:3000/api/documentos/${codigoBusqueda.value}`)
    Object.assign(documento.value, res.data)
    editando.value = true
    documentoEliminado.value = !!res.data.eliminado
  } catch (err) {
    error.value = 'Documento no encontrado'
  } finally {
    loading.value = false
  }
}

// Registrar nuevo documento
const registrarDocumento = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.post('http://localhost:3000/api/documentos', documento.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    snackbar.value = true
    Object.keys(documento.value).forEach(k => documento.value[k] = (typeof documento.value[k] === 'boolean' ? false : ''))
    editando.value = false
    codigoBusqueda.value = ''
  } catch (err) {
    manejarError(err)
  } finally {
    loading.value = false
  }
}

// Actualizar documento existente
const actualizarDocumento = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.put(`http://localhost:3000/api/documentos/${documento.value.codigo}`, documento.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    snackbar.value = true
  } catch (err) {
    manejarError(err)
  } finally {
    loading.value = false
  }
}

// Eliminar documento
const eliminarDocumento = async () => {
  try {
    await axios.delete(`http://localhost:3000/api/documentos/${documento.value.codigo}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    snackbar.value = true
    documentoEliminado.value = true
  } catch (err) {
    manejarError(err)
  }
}

// Restaurar documento
const restaurarDocumento = async () => {
  try {
    await axios.patch(`http://localhost:3000/api/documentos/${documento.value.codigo}/restaurar`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    snackbar.value = true
    documentoEliminado.value = false
  } catch (err) {
    manejarError(err)
  }
}

const manejarError = (err) => {
  if (err.response?.status === 401 || err.response?.status === 403) {
    error.value = 'No autorizado'
  } else if (err.response?.status === 400) {
    error.value = 'Datos inválidos'
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
      </v-card-title>

      <!-- Buscar por código -->
      <v-text-field
        v-model="codigoBusqueda"
        label="Buscar por código"
        append-inner-icon="mdi-magnify"
        @click:append-inner="buscarPorCodigo"
        class="mb-4"
      />

      <!-- Formulario -->
      <v-form @submit.prevent="editando ? actualizarDocumento() : registrarDocumento()">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.codigo" label="Código" :disabled="editando" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.tipo" label="Tipo" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.fuente" label="Fuente" :disabled="editando" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.relevancia" label="Relevancia" />
          </v-col>
          <v-col cols="12">
            <v-textarea v-model="documento.descripcion" label="Descripción" rows="3" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.anio" label="Año" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.enlace" label="Enlace" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="documento.aplicacion_id" label="ID Aplicación" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.aplicacion" label="Aplicación" />
          </v-col>
          <v-col cols="12">
            <v-text-field v-model="documento.conceptos_cpe" label="Conceptos CPE" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="documento.creado_por" label="Creado por (usuario_id)" type="number" />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model.number="documento.jerarquia" label="Jerarquía" type="number" />
          </v-col>
          <v-col cols="12">
            <v-checkbox v-model="documento.vigente" label="¿Vigente?" />
          </v-col>
        </v-row>

        <!-- Botones -->
        <v-btn type="submit" color="primary" :loading="loading" class="mt-4">
          {{ editando ? 'Actualizar Documento' : 'Registrar Documento' }}
        </v-btn>

        <v-btn
          v-if="editando && !documentoEliminado"
          color="red"
          class="mt-4 ml-2"
          @click="eliminarDocumento"
        >
          Eliminar Documento
        </v-btn>

        <v-btn
          v-if="editando && documentoEliminado"
          color="green"
          class="mt-4 ml-2"
          @click="restaurarDocumento"
        >
          Restaurar Documento
        </v-btn>

        <p v-if="error" class="mt-3 text-red" style="color: #cf2e2e;">{{ error }}</p>
      </v-form>
    </v-card>

    <v-snackbar v-model="snackbar" color="green" timeout="3000">
      Operación exitosa
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.v-card-title {
  font-family: "Roboto", sans-serif;
}
</style>
