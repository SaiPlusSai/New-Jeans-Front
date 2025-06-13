<template>
  <v-container class="propuestas">
    <v-row>
      <h2 v-if="esMIGA">Gestión de Propuestas (MIGA)</h2>
      <h2 v-if="esComunidad">Mis Propuestas</h2>
      <h2 v-if="notLogged">Propuestas</h2>
    </v-row>

    <v-row>
      <div v-if="cargando">Cargando propuestas...</div>
      <div v-else-if="propuestas.length === 0">No hay propuestas registradas.</div>

      <v-col 
        v-else
        v-for="propuesta in propuestas"
        :key="propuesta.id"
        cols="12"
      >
      <v-card outlined>
        <v-card-title>{{ propuesta.titulo }}</v-card-title>
        <v-card-subtitle>Estado actual: <em>{{ propuesta.estado }}</em></v-card-subtitle>
        <v-card-text>
          <p>{{ propuesta.descripcion }}</p>
        </v-card-text>
        <v-card-actions v-if="esMIGA">
          <label for="estado">Cambiar estado: </label>
          <select v-model="propuesta.nuevoEstado">
            <option disabled value="">Seleccione estado</option>
            <option value="pendiente">Pendiente</option>
            <option value="aceptada">Aceptada</option>
            <option value="rechazada">Rechazada</option>
          </select>
          <button @click="actualizarEstado(propuesta)">Actualizar</button>
        </v-card-actions>
      </v-card>
      </v-col>

    </v-row>

    <v-row>
      <v-btn
        v-if="esComunidad"
        class="add-btn"
        icon="mdi-plus"
        size="large"
        elevation="8"
        rounded="xl"
        fab
        @click="dialog = true"
      ></v-btn>
      <v-dialog v-model="dialog" max-width="600">
        <v-card>
          <v-card-title>Nueva Propuesta</v-card-title>
          
          <v-card-text>
            <v-text-field
              v-model="propuesta.titulo"
              label="Título"
              :rules="[v => !!v || 'Este campo no puede estar vacío']"
              required
            ></v-text-field>
            
            <v-textarea
              v-model="propuesta.descripcion"
              label="Descripción"
              rows="3"
            ></v-textarea>
          </v-card-text>

          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn
              color="grey-darken-1"
              variant="text"
              @click="dialog = false"
            >
              Cancelar
            </v-btn>
            
            <v-btn
              color="primary"
              variant="tonal"
              @click="enviarPropuesta"
              :disabled="!propuesta.titulo"
            >
              Enviar
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>

    <v-row>
      <v-snackbar v-model="snackbar" timeout="3000">
        {{ snackbarContent }}
      </v-snackbar>
    </v-row>

  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'

axios.defaults.baseURL = 'http://localhost:3000'; // Ajusta si tu backend está en otro host

const propuestas = ref([]);
const cargando = ref(false);
const esMIGA = ref(false);
const esComunidad = ref(false);
const notLogged = ref(false);
const dialog = ref(false);
const propuesta = ref({
  titulo: '',
  descripcion: '',
});
const snackbar = ref(false);
const snackbarContent = ref('');

const cargarPropuestas = async () => {
  cargando.value = true;
  try {
    const token = localStorage.getItem('token');
    var res;
    if(notLogged.value){
      res = await axios.get('/api/propuestas/publicas');
    } else if(esMIGA.value){
      res = await axios.get('/api/propuestas', {
        headers: { Authorization: `Bearer ${token}` }
      });
    } else if(esComunidad.value){
      res = await axios.get('/api/propuestas/mis', {
        headers: { Authorization: `Bearer ${token}` }
      });
    }

    propuestas.value = res.data.map(p => ({
      ...p,
      nuevoEstado: p.estado
    }));
  } catch (err) {
    console.log(err);
    snackbar.value = true;
    snackbarContent.value = err.response?.data?.message || 'Error al cargar propuestas.';
  } finally {
    cargando.value = false;
  }
};

const actualizarEstado = async (propuesta) => {
  try {
    const token = localStorage.getItem('token');
    await axios.patch(`/api/propuestas/${propuesta.id}/estado`, {
      estado: propuesta.nuevoEstado
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    snackbar.value = true;
    snackbarContent.value = `Estado de la propuesta "${propuesta.titulo}" actualizado a "${propuesta.nuevoEstado}".`;
    cargarPropuestas(); // refrescar después del cambio
  } catch (err) {
    snackbar.value = true;
    snackbarContent.value = err.response?.data?.message || 'Error al actualizar estado.';
  }
};

const enviarPropuesta = async () => {
  try {
    const token = localStorage.getItem('token');
    await axios.post('/api/propuestas', propuesta.value, {
      headers: { Authorization: `Bearer ${token}` }
    })
    snackbar.value = true
    snackbarContent.value = 'Propuesta enviada correctamente';
  } catch (err) {
    snackbar.value = true;
    snackbarContent.value = err.response?.data?.message || 'Error al enviar propuesta.';
  }
   dialog.value = false;
  cargarPropuestas();
}

const verificarRol = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get('/api/usuarios/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.data.usuario.rol === 'MIGA') {
      esMIGA.value = true; 
    } else if (res.data.usuario.rol === 'COMUNIDAD') {
      esComunidad.value = true; 
    }
    cargarPropuestas(); 
  } catch (err) {
    snackbar.value = true;
    snackbarContent.value = 'No se pudo verificar el rol del usuario.';
  }
};

onMounted(() => {
  const token = localStorage.getItem('token');
  if(!token){
    notLogged.value = true;
    cargarPropuestas();
  } else {
    verificarRol();
  }
});

</script>

<style scoped>
.propuestas {
  max-width: 700px;
  margin: 0 auto;
  padding: 20px;
}

.propuesta-item {
  margin-bottom: 20px;
  border-bottom: 1px solid #ccc;
  padding-bottom: 10px;
}

select {
  margin-right: 10px;
}

button {
  padding: 5px 10px;
}

.mensaje {
  margin-top: 20px;
  color: green;
}

.error {
  margin-top: 20px;
  color: red;
}

.add-btn{
  margin: 25px 10px;
  background-image: linear-gradient(135deg, #a1c4fd, #c2e9fb);
}
</style>
