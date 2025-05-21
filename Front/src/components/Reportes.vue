<template>

<v-container>
    <v-row justify="center">
        <h1>Reportes</h1>
    </v-row>
    <v-row justify="left">
        <v-col cols="6" sm="10">
            <h2>Consultas</h2>
        </v-col>
        <v-col cols="6" sm="2">
            <v-btn @click="consultasPDF" color="primary">
                Descargar PDF
            </v-btn>
        </v-col>
    </v-row>
    <v-row>
        <v-col
            v-for="(consulta, index) in consultas"
            :key="index"
            cols="6"
            sm="12"
        >
        <v-card plain>
          <v-card-title>Palabra: {{ consulta.palabra }}</v-card-title>
          <v-card-text>
            <p v-if="consulta.buscado_donde === 'ambos'"> Relevancia y descripción </p>
            <p v-if="consulta.buscado_donde != 'ambos'"> {{ consulta.buscado_donde }} </p>
            <p>Fecha: {{ consulta.buscado_en }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
        <v-col cols="6" sm="10">
            <h2>Documentos vigentes</h2>
        </v-col>
        <v-col cols="6" sm="2">
            <v-btn @click="docsPDF" color="primary">
                Descargar PDF
            </v-btn>
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
        <v-card plain>
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

const consultas = ref([]);
const docs = ref([]);
const snackbar = ref(false);
const snackbarContent = ref('');
const filterVisible = ref(false);
const tipos = ref(['ley', 'decreto', 'resolucion', 'circular', 'reglamento', 'otro']);
const selectedTipo = ref(null);
const searchAnio = ref(null);

const token = localStorage.getItem('token');
console.log(token);

const fetchConsultas = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/reportes/consultas', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    consultas.value = response.data;
  } catch (error) {
    console.error('Error al obtener consultas:', error);
  }
};

const fetchDocs = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/reportes/documentos', {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
    docs.value = response.data;
  } catch (error) {
    console.error('Error al obtener documentos:', error);
  }
};

const applyFilters = async () => {
    if(selectedTipo != null && searchAnio != null){
        snackbar.value = true;
        snackbarContent.value = 'Solo puede aplicar un filtro a la vez.';
    } else {
        if(selectedTipo != null){
            try {
                const response = await axios.get(`http://localhost:3000/api/reportes/documentos/tipo/${selectedTipo}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                docs.value = response.data;
            } catch (error) {
                console.error('Error al obtener documentos por tipo:', error);
            }
        } else if(searchAnio != null) {
            try {
                const response = await axios.get(`http://localhost:3000/api/reportes/documentos/anio/${searchAnio}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                docs.value = response.data;
            } catch (error) {
                console.error('Error al obtener documentos por año:', error);
            }
        }
    }
};

const clearFilters = () => {
    selectedTipo.value = null;
    searchAnio.value = null;
    fetchDocs();
};

const consultasPDF = async () => {
    try {
        const response = await axios.get('http://localhost:3000/api/reportes-pdf/consultas', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        snackbar.value = true;
        snackbarContent.value = response.data;
    } catch (error) {
        console.error('Error al descargar PDF:', error);
    }
};

const docsPDF = async () => {
    if((selectedTipo != null && searchAnio != null) || (selectedTipo == null && searchAnio == null)){
        try {
            const response = await axios.get('http://localhost:3000/api/reportes-pdf/documentos', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            snackbar.value = true;
            snackbarContent.value = response.data;
        } catch (error) {
            console.error('Error al descargar PDF:', error);
        }
    } else {
        if(selectedTipo != null){
            try {
                const response = await axios.get(`http://localhost:3000/api/reportes-pdf/documentos/tipo/${selectedTipo}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                snackbar.value = true;
                snackbarContent.value = response.data;
            } catch (error) {
                console.error('Error al descargar PDF:', error);
            }
        } else if(searchAnio != null){
            try {
                const response = await axios.get(`http://localhost:3000/api/reportes-pdf/documentos/${searchAnio}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                snackbar.value = true;
                snackbarContent.value = response.data;
            } catch (error) {
                console.error('Error al descargar PDF:', error);
            }
        }
    }
};

onMounted(() => {
    fetchConsultas();
    fetchDocs();
});

</script>