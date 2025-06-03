<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

// Refs y variables
const token = localStorage.getItem('token')
const usuario = ref(null)
const rol = ref(null)

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
const tiposDocumento = [
  'Ley',
  'Decreto Supremo',
  'Resolución Ministerial',
  'Plan',
  'Norma',
  'Resolución Municipal',
  'Otro'
]

// Cargar perfil automáticamente si hay token
const obtenerPerfil = async () => {
  if (!token) return
  try {
    const res = await axios.get('http://localhost:3000/api/usuarios/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    })
    usuario.value = res.data
    rol.value = res.data.rol || 'sin rol'
    console.log('Perfil cargado:', usuario.value)
  } catch (err) {
    error.value = 'Error al cargar perfil'
    localStorage.removeItem('token') // token inválido
  }
}

onMounted(() => {
  obtenerPerfil()
})

// Funciones
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

const registrarDocumento = async () => {
  error.value = ''
  loading.value = true
  try {
    await axios.post('http://localhost:3000/api/documentos', documento.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    snackbar.value = true
    Object.keys(documento.value).forEach(k => documento.value[k] = typeof documento.value[k] === 'boolean' ? false : '')
    editando.value = false
    codigoBusqueda.value = ''
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
    await axios.put(`http://localhost:3000/api/documentos/${documento.value.codigo}`, documento.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    snackbar.value = true
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
    snackbar.value = true
    documentoEliminado.value = true
  } catch (err) {
    manejarError(err)
  }
}

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
//amatista piedra fav de Nico
</script>

<template>
  <v-container class="py-8">
    <v-card class="mx-auto pa-6" max-width="800">
      <v-card-title class="text-h6 mb-4">
        {{ editando ? 'Modificar Documento' : 'Registrar Documento' }}
      </v-card-title>

      <div class="mb-4" v-if="usuario">
        <p><strong>Usuario:</strong> {{ usuario.nombre }}</p>
        <p><strong>Rol:</strong> {{ rol }}</p>
      </div>

      <v-text-field
        v-model="codigoBusqueda"
        label="Buscar por código"
        append-inner-icon="mdi-magnify"
        @click:append-inner="buscarPorCodigo"
        class="mb-4"
      />

      <v-form @submit.prevent="editando ? actualizarDocumento() : registrarDocumento()">
        <v-row dense>
          <v-col cols="12" sm="6">
            <v-text-field v-model="documento.codigo" label="Código" :disabled="editando" required />
          </v-col>
          <v-col cols="12" sm="6">
            <v-select
              v-model="documento.tipo"
              :items="tiposDocumento"
              label="Tipo de documento"
              outlined
              required
            ></v-select>
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
            <v-combobox
              v-model="documento.aplicacion"
              :items="[
                { title: 'Nacional', value: 1 },
                { title: 'Departamental', value: 2 },
                { title: 'Municipal', value: 3 }
              ]"
              label="Aplicación"
              item-title="title"
              item-value="value"
              return-object="false"
              required
            />
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

        <p v-if="error" class="mt-3" style="color: #cf2e2e;">{{ error }}</p>
      </v-form>
    </v-card>

    <v-snackbar v-model="snackbar" color="green" timeout="3000">
      Operación exitosa
    </v-snackbar>
  </v-container>
</template>

<style scoped>
.v-container {
  background: linear-gradient(145deg, #fdf6f0, #f3f8ff); /* degradado suave pastel */
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
  color: #6b4c9a; /* lavanda fuerte */
  text-align: center;
}

.v-text-field input,
.v-textarea textarea {
  background-color: #fff9fb;
  border-radius: 10px;
  padding-left: 10px;
}

.v-text-field,
.v-textarea {
  background-color: #fefefe;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.v-text-field:hover,
.v-textarea:hover {
  background-color: #f0f9ff;
}

/* Checkbox */
.v-checkbox {
  background-color: #f9f3ff;
  border-radius: 8px;
  padding: 10px;
}

/* Botones pastel */
.v-btn {
  font-weight: 600;
  font-family: "Poppins", sans-serif;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.v-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.v-btn[color="primary"] {
  background-color: #a3d8f4; /* azul pastel */
  color: #1f2d3d;
}

.v-btn[color="red"] {
  background-color: #ffccd5; /* rosa pastel */
  color: #5a2a2a;
}

.v-btn[color="green"] {
  background-color: #d4f8c4; /* verde suave */
  color: #2d4a2d;
}

/* Snackbar */
.v-snackbar {
  background-color: #e0ffe0;
  color: #256029;
  border-radius: 10px;
  font-weight: 600;
  font-family: "Poppins", sans-serif;
}

/* Mensaje de error */
.text-red {
  font-weight: bold;
  font-family: "Poppins", sans-serif;
  color: #cf3e3e !important;
  text-align: center;
  margin-top: 10px;
}

.v-select,
.v-text-field {
  background-color: #fdf6fb;
  border-radius: 12px;
}

.v-select:hover,
.v-text-field:hover {
  background-color: #f5faff;
}

.v-select .v-input__control,
.v-text-field .v-input__control {
  border: 1px solid #e0d7f3;
}

</style>