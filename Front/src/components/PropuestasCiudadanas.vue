<template>
  <div class="propuestas" v-if="esMIGA">
    <h2>Gestión de Propuestas (MIGA)</h2>

    <div v-if="cargando">Cargando propuestas...</div>
    <div v-else-if="propuestas.length === 0">No hay propuestas registradas.</div>

    <ul v-else>
      <li v-for="propuesta in propuestas" :key="propuesta.id" class="propuesta-item">
        <strong>{{ propuesta.titulo }}</strong> - Estado actual: <em>{{ propuesta.estado }}</em>
        <p>{{ propuesta.descripcion }}</p>

        <label for="estado">Cambiar estado: </label>
        <select v-model="propuesta.nuevoEstado">
          <option disabled value="">Seleccione estado</option>
          <option value="pendiente">Pendiente</option>
          <option value="aceptada">Aceptada</option>
          <option value="rechazada">Rechazada</option>
        </select>
        <button @click="actualizarEstado(propuesta)">Actualizar</button>
      </li>
    </ul>

    <div v-if="mensaje" class="mensaje">{{ mensaje }}</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>

  <div v-else>
    <p>No tienes permisos para acceder a esta sección.</p>
  </div>
</template>

<script>
import axios from 'axios';

axios.defaults.baseURL = 'http://localhost:3000'; // Ajusta si tu backend está en otro host

export default {
  name: 'GestionPropuestasMIGA',
  data() {
    return {
      propuestas: [],
      mensaje: '',
      error: '',
      cargando: false,
      esMIGA: false  // Variable para verificar si el usuario tiene rol MIGA
    };
  },
  methods: {
    // Método para cargar las propuestas
    async cargarPropuestas() {
      this.cargando = true;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('/api/propuestas', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        this.propuestas = res.data.map(p => ({
          ...p,
          nuevoEstado: p.estado
        }));

        this.error = '';
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al cargar propuestas.';
      } finally {
        this.cargando = false;
      }
    },
    // Método para actualizar el estado de una propuesta
    async actualizarEstado(propuesta) {
      try {
        const token = localStorage.getItem('token');
        await axios.patch(`/api/propuestas/${propuesta.id}/estado`, {
          estado: propuesta.nuevoEstado
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.mensaje = `Estado de la propuesta "${propuesta.titulo}" actualizado a "${propuesta.nuevoEstado}".`;
        this.error = '';
        this.cargarPropuestas(); // refrescar después del cambio
      } catch (err) {
        this.error = err.response?.data?.message || 'Error al actualizar estado.';
        this.mensaje = '';
      }
    },
    // Método para verificar el rol del usuario
    async verificarRol() {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('/api/usuarios/perfil', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.usuario.rol === 'MIGA') {
          this.esMIGA = true; // Si el rol es MIGA, habilitamos la vista
          this.cargarPropuestas(); // Cargamos las propuestas solo si el rol es MIGA
        } else {
          this.esMIGA = false; // Si no es MIGA, no mostramos la vista
        }
      } catch (err) {
        this.error = 'No se pudo verificar el rol del usuario.';
      }
    }
  },
  mounted() {
    this.verificarRol(); // Verificamos el rol al montar el componente
  }
};
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
</style>
