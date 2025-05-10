<script setup>
import { ref } from 'vue'
import axios from 'axios'

//Ali con eso verificas que si paso el toker y auth de nuevo
const token = localStorage.getItem('token')
console.log(token)

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

const registrarDocumento = async () => {
  error.value = ''
  loading.value = true

  try {
    const token = localStorage.getItem('token')
    console.log(token)
    const res = await axios.post('http://localhost:3000/api/documentos', documento.value, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
    snackbar.value = true
    Object.keys(documento.value).forEach(k => documento.value[k] = (typeof documento.value[k] === 'boolean' ? false : ''))
  } catch (err) {
    if (err.response?.status === 401 || err.response?.status === 403) {
      error.value = 'No autorizado'
    } else if (err.response?.status === 400) {
      error.value = 'Datos inválidos'
    } else {
      error.value = 'Error en el servidor'
    }
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container class="py-8">
    <v-card class="mx-auto pa-6" max-width="800">
      <v-card-title class="text-h6 mb-4">Registrar Documento</v-card-title>

      <v-form @submit.prevent="registrarDocumento">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.codigo" label="Código" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.tipo" label="Tipo" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.fuente" label="Fuente" />
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

        <v-btn type="submit" color="primary" :loading="loading" class="mt-4">
          Registrar Documento
        </v-btn>

        <p v-if="error" class="mt-3 text-red" style="color: #cf2e2e;">{{ error }}</p>
      </v-form>
    </v-card>

    <v-snackbar v-model="snackbar" color="green" timeout="3000">
      Documento registrado exitosamente
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.v-card-title {
  font-family: "Roboto", sans-serif;
}
</style>
