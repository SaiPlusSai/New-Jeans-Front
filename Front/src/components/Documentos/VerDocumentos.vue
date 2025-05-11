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
            v-for="(doc, index) in docs"
            :key="index"
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
    clearFilters();

    if(searchWord.value !== null){
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

onMounted(() => {
    fetchDocs();
});

</script>