<template>

<v-container>
    <v-row justify="center">
        <h1>Documentos MIGA</h1>
    </v-row>
    <v-row>
      <v-col cols="12">
        <v-text-field
            v-model="searchWord"
            append-inner-icon="mdi-magnify"
            density="compact"
            label="Buscar documentos"
            variant="solo"
            hide-details
            single-line
            clearable
            @keydown.enter="searchDocs"
            @click:append-inner="searchDocs"
        />
      </v-col>
    </v-row>
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
                        :items="tipos"
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
                        :error-messages="inputError"
                        ></v-text-field>
                    </v-form>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn @click="applyFilters" color="primary">
                            Aplicar filtros
                        </v-btn>
                        <v-btn @click="clearFilters" color="red">
                            Limpiar filtros
                        </v-btn>
                    </v-card-actions>
                </v-card>
            </v-expand-transition>
        </v-col>
    </v-row>
    <v-row>
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
            <p>Creador por: {{ doc.creado_por_nombre || 'Anónimo'}}</p>
            <p v-if="doc.vigente === 1">Vigente</p>
            <p v-if="doc.vigente === 0">No está vigente</p>
          </v-card-text>
          <v-card-actions>
            <v-btn
                v-if="isToken"
                elevation="0"
                icon
                class="favorite-btn"
                @click="toggleFavorite(doc.codigo)"
                :aria-label="isFavorite(doc.codigo) ? 'Eiminar de Favoritos' : 'Añadir a Favoritos'"
            >
                <v-icon color="yellow">
                {{ isFavorite(doc.codigo) ? 'mdi-star' : 'mdi-star-outline' }}
                </v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
        <v-col>
            <v-snackbar v-model="snackbar" timeout="3000">
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
const favs = ref([]);
const isToken = ref(false);
const snackbar = ref(false);
const snackbarContent = ref('');
const searchWord = ref('');
const filterVisible = ref(false);
const tipos = ref(['ley', 'decreto', 'resolucion', 'circular', 'reglamento', 'otro']);
const selectedTipo = ref(null);
const searchFuente = ref(null);
const searchAnio = ref(null);
const inputError = ref('');

const fetchDocs = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/documentos');
    docs.value = response.data;
  } catch (error) {
    console.error('Error al obtener documentos:', error);
  }
};

const searchDocs = async () => {
    selectedTipo.value = null;
    searchFuente.value = null;
    searchAnio.value = null;
    
    if(searchWord.value !== null && searchWord.value !== ''){
        searchWord.value = searchWord.value.trim();
        if(searchWord.value.split(/\s+/).length === 1){
            try {
                const encodedWord = encodeURIComponent(searchWord.value);
                const url = `http://localhost:3000/api/historial-busqueda?palabra=${encodedWord}`;
                const response = await axios.get(url);
                docs.value = response.data;
                if(docs.value.length === 0){
                    snackbar.value = true;
                    snackbarContent.value = 'Sin resultados de búsqueda.';
                }
            } catch (error) {
                console.error('Error al obtener documentos:', error);
            }
        } else {
            try {
                const encodedWords = encodeURIComponent(searchWord.value);
                const url = `http://localhost:3000/api/historial-busqueda/google-like?frase=${encodedWords}`;
                const response = await axios.get(url);
                docs.value = response.data;
                if(docs.value.length === 0){
                    snackbar.value = true;
                    snackbarContent.value = 'Sin resultados de búsqueda.';
                }
            } catch (error) {
                console.error('Error al obtener documentos:', error);
            }
        }
    } else {
        searchWord.value = '';
        fetchDocs();
    }
};

const applyFilters = async () => {
    searchWord.value = '';

    let filters = ['', '', ''], filtersString = '';
    if(selectedTipo.value !== null){
        filters[0] = `tipo=${encodeURIComponent(selectedTipo.value)}`;
    }
    if(searchFuente.value !== null){
        filters[1] = `fuente=${encodeURIComponent(searchFuente.value)}`;
    }
    if(searchAnio.value !== null){
        if(searchAnio.value < 2000 || searchAnio.value > 2024){
            inputError.value = 'El año debe estar entre 2000 y 2024'
        } else {
            filters[2] = `anio=${encodeURIComponent(searchAnio.value)}`;
        }
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
            const url = `http://localhost:3000/api/buscar?${filtersString}`;
            const response = await axios.get(url);
            docs.value = response.data;
            if(docs.value.length === 0){
                snackbar.value = true;
                snackbarContent.value = 'Sin resultados de búsqueda.';
            }
        } catch (error) {
            console.error('Error al obtener documentos:', error);
        }
    } else {
        snackbar.value = true;
        snackbarContent.value = 'Elija los filtros a aplicar.';
    }
};

const clearFilters = () => {
    selectedTipo.value = null;
    searchFuente.value = null;
    searchAnio.value = null;
    fetchDocs();
};

const token = localStorage.getItem('token');
console.log(token);

const fetchFavs = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/favoritos', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    favs.value = response.data;
  } catch (error) {
    console.error('Error al obtener documentos favoritos:', error);
  }
};

const isFavorite = (codigo) => {
    return favs.value.some(doc => doc.codigo === codigo);
};

const toggleFavorite = async (codigo) => {
    if (isFavorite(codigo)) {
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
    } else {
        try {
            const response = await axios.post(`http://localhost:3000/api/favoritos/${codigo}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            snackbar.value = true;
            snackbarContent.value = response.data.mensaje;
        } catch (error) {
            console.error('Error al añadir de favoritos:', error);
        }
    }
    fetchFavs();
};

onMounted(() => {
    fetchDocs();
    isToken.value = token != null;
    if(isToken.value){
        fetchFavs();
    }
});

</script>

<style scoped>
/* Tipografía animada */
h1 {
  font-family: 'Caviar Dreams', sans-serif;
  font-size: 2rem;
  color: #B48EAE;
  text-align: center;
  margin-bottom: 1rem;
  animation: fadeInText 1s ease-in-out;
}

/* Animación para el texto */
@keyframes fadeInText {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Botones con estilo pastel y animaciones */
.v-btn {
  font-weight: bold;
  border-radius: 12px;
  transition: transform 0.2s ease, box-shadow 0.3s ease;
  animation: fadeInBtn 0.6s ease;
}

.v-btn:hover {
  transform: scale(1.04);
  box-shadow: 0 6px 12px rgba(150, 130, 160, 0.25);
}

/* Animación de entrada de botones */
@keyframes fadeInBtn {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Colores pastel */
.v-btn.primary {
  background-color: #F0D9EF !important;
  color: #5D4C63 !important;
}

.v-btn.red {
  background-color: #FCDCE1 !important;
  color: #6A3D4F !important;
}

/* Tarjetas con fondo pastel */
.v-card {
  background-color: #FFF8F0 !important;
  border: 1px solid #FCE4EC;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(240, 217, 239, 0.4);
  margin-bottom: 1rem;
  animation: fadeInCard 0.8s ease;
}

@keyframes fadeInCard {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Títulos y subtítulos */
.v-card-title {
  color: #8D6E97;
  font-family: 'Caviar Dreams', sans-serif;
}

.v-card-subtitle {
  color: #A188A6;
}

/* Inputs */
.v-text-field input {
  background-color: #FAF0F5 !important;
  color: #5D4C63 !important;
}

.v-text-field label {
  color: #A188A6 !important;
}

.v-select,
.v-text-field {
  border-radius: 8px;
}

/* Snackbar pastel
.v-snackbar {
  background-color: #FFE6BB !important;
  color: #5C4738 !important;
}*/

/* Ícono de favoritos */
.favorite-btn .v-icon {
  font-size: 24px;
  transition: transform 0.2s;
}

.favorite-btn .v-icon:hover {
  transform: scale(1.3);
}

</style>
