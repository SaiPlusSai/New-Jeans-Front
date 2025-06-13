<template>

<v-container>
    <v-row justify="center">
            <h1>Documentos MIGA Favoritos</h1>
    </v-row>
    <v-row>
      <div v-if="isFavsNull">No tienes documentos favoritos.</div>
        <v-col
          v-for="(doc) in docs"
          :key="doc.codigo"
          cols="12"
        >
        <v-card outlined>
          <v-card-title>{{ doc.descripcion }}</v-card-title>
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
            <p>Creador por: {{ doc.creado_por_nombre || 'Anónimo'}}</p>
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
                <v-icon color="yellow">
                {{ 'mdi-star' }}
                </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
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
var isFavsNull = ref(false);
console.log(token);

const fetchFavs = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/favoritos', {
        headers: {
        Authorization: `Bearer ${token}`
        }
    });
    
    if(response.data.length === 0){
      isFavsNull.value = true;
    }
    docs.value = response.data;
  } catch (error) {
    console.error('Error al obtener documentos:', error);
  }
};

const deleteFavorite = async (codigo) => {
    try {
        const response = await axios.delete(`http://localhost:3000/api/favoritos/${codigo}`, {
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