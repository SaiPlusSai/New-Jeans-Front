<template>

<v-container>
    <v-row justify="center">
        <h1>Reportes</h1>
    </v-row>
    <v-row>
        <h2>Consultas</h2>
    </v-row>
    <v-row>
        <v-col
            v-for="(consulta, index) in consultas"
            :key="index"
            cols="6"
            sm="4"
        >
        <v-card flat>
          <v-card-title>Palabra: {{ consulta.palabra }}</v-card-title>
          <v-card-text>
            <p v-if="consulta.buscado_donde === 'ambos'"> Buscado en: Relevancia y descripción </p>
            <p v-if="consulta.buscado_donde != 'ambos'"> Buscado en: {{ consulta.buscado_donde }} </p>
            <p>Fecha: {{ consulta.buscado_en }}</p>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row justify="end">
        <v-btn @click="consultasPDF" color="primary" prepend-icon="mdi-download">
            Descargar PDF
        </v-btn>
    </v-row>
    <v-row>
        <h2>Documentos vigentes</h2>
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
  item-title="text"
  item-value="value"
  label="Tipo"
  clearable
/>

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
    <v-row justify="end">
        <v-btn @click="docsPDF" color="primary" prepend-icon="mdi-download">
            Descargar PDF
        </v-btn>
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
const tipos = ref([
  { text: 'Ley', value: 'ley' },
  { text: 'Decreto', value: 'decreto' },
  { text: 'Resolución', value: 'resolucion' },
  { text: 'Plan', value: 'plan' },
  { text: 'Norma', value: 'norma' },
  { text: 'Resolución Municipal', value: 'resolucion_municipal' },
  { text: 'Otro', value: 'otro' }
])

const selectedTipo = ref(null);
const searchAnio = ref(null);
const inputError = ref('');
const tipoFilter = ref(false);
const anioFilter = ref(false);

const token = localStorage.getItem('token');

const fetchConsultas = async () => {
  try {
    const response = await axios.get('/api/reportes/consultas', {
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
    const response = await axios.get('/api/reportes/documentos', {
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
    if(selectedTipo.value != null && searchAnio.value != null){
        snackbar.value = true;
        snackbarContent.value = 'Solo puede aplicar un filtro a la vez.';
    } else {
        if(selectedTipo.value != null){
            try {
                const response = await axios.get(
  `/api/reportes/documentos/tipo/${selectedTipo.value}`,
 {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                docs.value = response.data;
            } catch (error) {
                console.error('Error al obtener documentos por tipo:', error);
            }
            tipoFilter.value = true;
            anioFilter.value = false;
        } else if(searchAnio.value != null) {
            const anioActual = new Date().getFullYear();

if (searchAnio.value < 1825 || searchAnio.value > anioActual) {
  inputError.value = `El año debe estar entre 1825 y ${anioActual}`;
} else {
                try {
                    const response = await axios.get(`/api/reportes/documentos/anio/${searchAnio.value}`, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    docs.value = response.data;
                } catch (error) {
                    console.error('Error al obtener documentos por año:', error);
                }
                tipoFilter.value = false;
                anioFilter.value = true;
            }
        }
    }
};

const clearFilters = () => {
    selectedTipo.value = null;
    searchAnio.value = null;
    tipoFilter.value = false;
    anioFilter.value = false;
    fetchDocs();
};

const consultasPDF = async () => {
    try {
        const response = await axios.get('/api/reportes/pdf/consultas', {
            headers: {
                Authorization: `Bearer ${token}`
            },
            responseType: 'blob'
        });
        snackbar.value = true;
        snackbarContent.value = 'PDF creado y descargado correctamente.';

        const pdfUrl = URL.createObjectURL(response.data);
        window.open(pdfUrl, '_blank');
        
        const link = document.createElement('a');
        link.href = pdfUrl;
        link.download = 'reporte-consultas.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);
    } catch (error) {
        console.error('Error al descargar PDF:', error);
    }
};

const docsPDF = async () => {
    if(tipoFilter.value){
        try {
            const response = await axios.get(`/api/reportes/pdf/documentos/tipo/${selectedTipo.value}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });
            snackbar.value = true;
            snackbarContent.value = 'PDF creado y descargado correctamente.';

            const pdfUrl = URL.createObjectURL(response.data);
            window.open(pdfUrl, '_blank');

            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'reporte-documentos.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
        }
    } else if(anioFilter.value){
        try {
            const response = await axios.get(`/api/reportes/pdf/documentos/anio/${searchAnio.value}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });
            snackbar.value = true;
            snackbarContent.value = 'PDF creado y descargado correctamente.';

            const pdfUrl = URL.createObjectURL(response.data);
            window.open(pdfUrl, '_blank');

            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'reporte-documentos.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
        }
    } else {
        try {
            const response = await axios.get('/api/reportes/pdf/documentos', {
                headers: {
                    Authorization: `Bearer ${token}`
                },
                responseType: 'blob'
            });
            snackbar.value = true;
            snackbarContent.value = 'PDF creado y descargado correctamente.';

            const pdfUrl = URL.createObjectURL(response.data);
            window.open(pdfUrl, '_blank');

            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'reporte-documentos.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(pdfUrl);
        } catch (error) {
            console.error('Error al descargar PDF:', error);
        }
    } 
};

onMounted(() => {
    fetchConsultas();
    fetchDocs();
});

</script>