<template>
  <v-container class="propuestas">
    <v-row>
      <h2 v-if="esMIGA">Gestión de Propuestas (MIGA)</h2>
      <h2 v-if="esComunidad">Mis Propuestas</h2>
      <h2 v-if="notLogged">Propuestas</h2>
    </v-row>

    <!-- FILTRO POR PALABRAS CLAVE SOLO SI NO ES COMUNIDAD -->
    <v-row
      class="mb-4"
      justify="center"
      align="center"
      v-if="!esComunidad"
    >
      <v-col cols="12" sm="8" md="6">
        <v-text-field
          v-model="filtroTexto"
          label="Buscar por palabras clave"
          clearable
          @keyup.enter="buscarPropuestas"
          :disabled="cargando"
          dense
          outlined
          rounded
          append-inner-icon="mdi-magnify"
          @click:append-inner="buscarPropuestas"
          placeholder="Escribe y presiona Enter o clic en lupa"
        />
      </v-col>
      <v-col cols="12" sm="2" md="2">
        <v-btn
          color="secondary"
          block
          rounded
          @click="resetearFiltros"
          :disabled="cargando"
          title="Limpiar búsqueda"
        >
          Limpiar
        </v-btn>
      </v-col>
    </v-row>

    <!-- LISTA DE PROPUESTAS -->
    <v-row>
      <v-col cols="12" class="text-center" v-if="cargando">
        <v-progress-circular indeterminate color="primary" size="40"></v-progress-circular>
        <div class="mt-2">Cargando propuestas...</div>
      </v-col>

      <v-col cols="12" class="text-center" v-else-if="propuestas.length === 0">
        No hay propuestas registradas.
      </v-col>

      <v-col
        v-else
        v-for="propuesta in propuestas"
        :key="propuesta.id"
        cols="12"
      >
        <v-card outlined class="mb-4" elevation="3" rounded>
          <v-card-title class="font-weight-bold">{{ propuesta.titulo }}</v-card-title>
          <v-card-subtitle class="grey--text text--darken-1">
            Estado actual: <em>{{ propuesta.estado }}</em>
          </v-card-subtitle>
          <v-card-text class="pt-2">{{ propuesta.descripcion }}</v-card-text>
          <v-card-actions v-if="esMIGA" class="d-flex align-center">
            <label for="estado" class="mr-2">Cambiar estado:</label>
            <v-select
              v-model="propuesta.nuevoEstado"
              :items="['pendiente', 'aceptada', 'rechazada']"
              dense
              hide-details
              outlined
              style="max-width: 150px;"
            />
            <v-btn
              color="primary"
              small
              class="ml-3"
              @click="actualizarEstado(propuesta)"
              :disabled="propuesta.nuevoEstado === propuesta.estado"
            >
              Actualizar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- BOTÓN Y DIÁLOGO PARA NUEVA PROPUESTA -->
    <v-row justify="end">
      <v-btn
        v-if="esComunidad"
        class="add-btn"
        icon="mdi-plus"
        size="large"
        elevation="8"
        rounded="xl"
        fab
        @click="dialog = true"
        color="primary"
      ></v-btn>

      <v-dialog v-model="dialog" max-width="600">
        <v-card>
          <v-card-title class="headline">Nueva Propuesta</v-card-title>
          <v-card-text>
            <v-text-field
              v-model="propuesta.titulo"
              label="Título"
              :rules="[v => !!v || 'Este campo no puede estar vacío']"
              required
              dense
              outlined
              rounded
            />
            <v-textarea
              v-model="propuesta.descripcion"
              label="Descripción"
              rows="3"
              outlined
              rounded
              class="mt-3"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="grey" text @click="dialog = false">Cancelar</v-btn>
            <v-btn
              color="primary"
              :disabled="!propuesta.titulo"
              @click="enviarPropuesta"
              rounded
            >
              Enviar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <!-- SNACKBAR -->
    <v-snackbar v-model="snackbar" timeout="3000" top>
      {{ snackbarContent }}
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

axios.defaults.baseURL = 'https://newjeans-back-production.up.railway.app'; // Ajusta si tu backend está en otro host

const propuestas = ref([])
const cargando = ref(false)
const esMIGA = ref(false)
const esComunidad = ref(false)
const notLogged = ref(false)
const dialog = ref(false)
const propuesta = ref({ titulo: '', descripcion: '' })
const snackbar = ref(false)
const snackbarContent = ref('')

const filtroTexto = ref('')

const cargarPropuestas = async () => {
  cargando.value = true
  try {
    const token = localStorage.getItem('token')
    let res
    if (notLogged.value) {
      res = await axios.get('/api/propuestas/publicas')
    } else if (esMIGA.value) {
      res = await axios.get('/api/propuestas', { headers: { Authorization: `Bearer ${token}` } })
    } else if (esComunidad.value) {
      res = await axios.get('/api/propuestas/mis', { headers: { Authorization: `Bearer ${token}` } })
    }
    propuestas.value = res.data.map(p => ({ ...p, nuevoEstado: p.estado }))
  } catch (err) {
    snackbarContent.value = err.response?.data?.message || 'Error al cargar propuestas.'
    snackbar.value = true
  } finally {
    cargando.value = false
  }
}

const buscarPropuestas = async () => {
  // Esta función no se usa si esComunidad porque el filtro se oculta.
  if (!filtroTexto.value.trim()) {
    cargarPropuestas()
    return
  }
  cargando.value = true
  try {
    const token = localStorage.getItem('token')
    let res
    if (notLogged.value) {
      res = await axios.get('/api/propuestas-inteligente/buscar-titulo-descripcion', {
        params: { palabra: filtroTexto.value.trim(), frase: filtroTexto.value.trim() }
      })
    } else if (esMIGA.value) {
      res = await axios.get('/api/propuestas-inteligente/buscar-titulo-descripcion', {
        params: { palabra: filtroTexto.value.trim(), frase: filtroTexto.value.trim() },
        headers: { Authorization: `Bearer ${token}` }
      })
    }
    propuestas.value = res.data.map(p => ({ ...p, nuevoEstado: p.estado }))
  } catch (err) {
    snackbarContent.value = err.response?.data?.message || 'Error al buscar propuestas.'
    snackbar.value = true
  } finally {
    cargando.value = false
  }
}

const resetearFiltros = () => {
  filtroTexto.value = ''
  cargarPropuestas()
}

const actualizarEstado = async (propuesta) => {
  if (!propuesta.nuevoEstado || propuesta.nuevoEstado === propuesta.estado) {
    snackbarContent.value = 'No se hizo ningún cambio en el estado.'
    snackbar.value = true
    return
  }
  try {
    const token = localStorage.getItem('token')
    await axios.patch(`/api/propuestas/${propuesta.id}/estado`, { estado: propuesta.nuevoEstado }, {
      headers: { Authorization: `Bearer ${token}` }
    })
    snackbarContent.value = `Estado de "${propuesta.titulo}" actualizado a "${propuesta.nuevoEstado}".`
    snackbar.value = true
    cargarPropuestas()
  } catch (err) {
    snackbarContent.value = err.response?.data?.message || 'Error al actualizar estado.'
    snackbar.value = true
  }
}

const enviarPropuesta = async () => {
  try {
    const token = localStorage.getItem('token')
    await axios.post('/api/propuestas', propuesta.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    snackbarContent.value = 'Propuesta enviada correctamente'
    snackbar.value = true
    propuesta.value = { titulo: '', descripcion: '' }
    dialog.value = false
    cargarPropuestas()
  } catch (err) {
    snackbarContent.value = err.response?.data?.message || 'Error al enviar propuesta.'
    snackbar.value = true
  }
}

const verificarRol = async () => {
  const token = localStorage.getItem('token')
  try {
    const res = await axios.get('/api/usuarios/perfil', { headers: { Authorization: `Bearer ${token}` } })
    if (res.data.usuario.rol === 'MIGA') esMIGA.value = true
    else if (res.data.usuario.rol === 'COMUNIDAD') esComunidad.value = true
    cargarPropuestas()
  } catch {
    snackbarContent.value = 'No se pudo verificar el rol del usuario.'
    snackbar.value = true
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    notLogged.value = true
    cargarPropuestas()
  } else {
    verificarRol()
  }
})
</script>

<style scoped>
.propuestas {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 15px;
}

.add-btn {
  margin: 25px 15px;
  background-image: linear-gradient(135deg, #a1c4fd, #c2e9fb);
}

.v-text-field input {
  font-size: 1rem;
}
</style>
