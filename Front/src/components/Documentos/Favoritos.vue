<template>
  <v-container>
    <v-row justify="center">
      <h1>Documentos MIGA Favoritos</h1>
    </v-row>

    <!-- FILTROS ESTILIZADOS -->
    <v-row class="mb-6 px-2 py-3 rounded-lg" style="background-color: #f5f5f5;" dense>
      <v-col cols="12" md="4">
        <v-select
          v-model="filtros.tipo"
          :items="tiposDocumento"
          label="Tipo de documento"
          clearable
          variant="outlined"
          density="comfortable"
          color="indigo"
          class="rounded"
        />
      </v-col>
      <v-col cols="12" md="6">
        <v-text-field
          v-model="filtros.palabra"
          label="Palabra clave"
          clearable
          variant="outlined"
          density="comfortable"
          color="indigo"
          class="rounded"
        />
      </v-col>
      <v-col cols="12" md="2" class="d-flex align-end">
        <v-btn color="indigo-darken-2" @click="buscarFavoritos" class="mr-2" elevation="2">
          <v-icon left>mdi-magnify</v-icon>Buscar
        </v-btn>
        <v-btn text color="grey-darken-1" @click="limpiarFiltros">
          Limpiar
        </v-btn>
      </v-col>
    </v-row>

    <!-- LISTA DE DOCUMENTOS -->
    <v-row>
      <div v-if="isFavsNull">No tienes documentos favoritos.</div>
      <v-col
        v-for="(doc) in docs"
        :key="doc.codigo"
        cols="12"
      >
        <v-card outlined>
          <v-card-title>{{ doc.codigo }}: {{ doc.descripcion }}</v-card-title>
          <v-card-subtitle>{{ doc.fuente }}</v-card-subtitle>
          <v-card-text>
            <p>
              <a :href="doc.enlace" target="_blank" rel="noopener noreferrer">
                Link del documento
              </a>
            </p>
            <p>Tipo: {{ doc.tipo.charAt(0).toUpperCase() + doc.tipo.slice(1) || 'Sin tipo' }}</p>
            <p>Año: {{ doc.anio }}</p>
            <p>Relevancia: {{ doc.relevancia }}</p>
            <p>Conceptos CPE: {{ doc.conceptos_cpe }}</p>
            <p>Aplicación: {{ doc.aplicacion || '---'}}</p>
            <p>Creado por: {{ doc.creado_por_nombre || 'Anónimo' }}</p>
            <p v-if="doc.vigente === 1">Vigente</p>
            <p v-if="doc.vigente === 0">No está vigente</p>
          </v-card-text>
          <v-card-actions>
            <v-btn
              elevation="0"
              icon
              class="favorite-btn"
              @click="deleteFavorite(doc.codigo)"
              :aria-label="'Eliminar de Favoritos'"
            >
              <v-icon color="yellow">mdi-star</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <!-- SNACKBAR -->
    <v-row>
      <v-col>
        <v-snackbar v-model="snackbar" color="red" timeout="3000">
          {{ snackbarContent }}
        </v-snackbar>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const docs = ref([]);
const snackbar = ref(false);
const snackbarContent = ref('');
const token = localStorage.getItem('token');
const isFavsNull = ref(false);

const filtros = ref({
  tipo: '',
  palabra: '',
});

const tiposDocumento = [
  'ley',
  'decreto',
  'resolucion',
  'norma',
  'resolucion_municipal',
  'plan',
  'programa',
  'otro'
];

const fetchFavs = async () => {
  try {
    const response = await axios.get('https://newjeans-back-production.up.railway.app/api/favoritos', {
        headers: {
        Authorization: `Bearer ${token}`
        }
    });
    docs.value = response.data;
    isFavsNull.value = response.data.length === 0;
  } catch (error) {
    console.error('Error al obtener documentos:', error);
  }
};

const buscarFavoritos = async () => {
  try {
    const params = {};
    if (filtros.value.tipo) params.tipo = filtros.value.tipo;
    if (filtros.value.palabra) params.palabra = filtros.value.palabra;

    const response = await axios.get('http://localhost:3000/api/favoritos/buscar', {
      headers: { Authorization: `Bearer ${token}` },
      params
    });

    docs.value = response.data;
    isFavsNull.value = response.data.length === 0;
  } catch (error) {
    console.error('Error al buscar favoritos:', error);
  }
};

const limpiarFiltros = () => {
  filtros.value = {
    tipo: '',
    palabra: '',
  };
  fetchFavs();
};

const deleteFavorite = async (codigo) => {
    try {
        const response = await axios.delete(`https://newjeans-back-production.up.railway.app/api/favoritos/${codigo}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        snackbar.value = true;
        snackbarContent.value = response.data.mensaje;
    } catch (error) {
        console.error('Error al eliminar de favoritos:', error);
    }
    fetchFavs();
  };

onMounted(() => {
  fetchFavs();
});
</script>
