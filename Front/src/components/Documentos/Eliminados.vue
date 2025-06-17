<template>
  <div class="documentos-eliminados">
    <h2>Documentos Eliminados</h2>
    
    <div v-if="loading" class="loading">
      Cargando documentos eliminados...
    </div>
    
    <div v-if="error" class="error">
      {{ error }}
    </div>
    
    <table v-if="documentos.length > 0" class="documentos-table">
      <thead>
        <tr>
          <th>Código</th>
          <th>Tipo</th>
          <th>Descripción</th>
          <th>Año</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="doc in documentos" :key="doc.codigo">
          <td>{{ doc.codigo }}</td>
          <td>{{ doc.tipo }}</td>
          <td>{{ doc.descripcion }}</td>
          <td>{{ doc.anio }}</td>
          <td>
            <button @click="restaurarDocumento(doc.codigo)" class="btn-restaurar">
              Restaurar
            </button>
            <button @click="mostrarDetalles(doc)" class="btn-detalles">
              Detalles
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <div v-else-if="!loading" class="no-documentos">
      No hay documentos eliminados para mostrar.
    </div>
    
    <!-- Modal para detalles del documento -->
    <div v-if="documentoSeleccionado" class="modal">
      <div class="modal-content">
        <span class="close" @click="documentoSeleccionado = null">&times;</span>
        <h3>Detalles del Documento</h3>
        <div class="detalles">
          <p><strong>Código:</strong> {{ documentoSeleccionado.codigo }}</p>
          <p><strong>Tipo:</strong> {{ documentoSeleccionado.tipo }}</p>
          <p><strong>Fuente:</strong> {{ documentoSeleccionado.fuente }}</p>
          <p><strong>Descripción:</strong> {{ documentoSeleccionado.descripcion }}</p>
          <p><strong>Relevancia:</strong> {{ documentoSeleccionado.relevancia }}</p>
          <p><strong>Año:</strong> {{ documentoSeleccionado.anio }}</p>
          <p><strong>Enlace:</strong> 
            <a :href="documentoSeleccionado.enlace" target="_blank">{{ documentoSeleccionado.enlace }}</a>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DocumentosEliminados',
  data() {
    return {
      documentos: [],
      loading: true,
      error: null,
      documentoSeleccionado: null
    }
  },
  async created() {
    await this.cargarDocumentosEliminados();
  },
  methods: {
    async cargarDocumentosEliminados() {
      try {
        this.loading = true;
        // Asumo que la API puede filtrar documentos no vigentes (eliminados lógicamente)
        const response = await fetch('http://localhost:3000/api/documentos?vigente=0');
        if (!response.ok) throw new Error('Error al cargar documentos');
        
        this.documentos = await response.json();
        this.error = null;
      } catch (err) {
        this.error = err.message;
        console.error('Error:', err);
      } finally {
        this.loading = false;
      }
    },
    
    async restaurarDocumento(codigo) {
      try {
        const response = await fetch(`/api/documentos/${codigo}/restaurar`, {
          method: 'PATCH'
        });
        
        if (!response.ok) throw new Error('Error al restaurar documento');
        
        // Recargar la lista después de restaurar
        await this.cargarDocumentosEliminados();
        alert('Documento restaurado exitosamente');
      } catch (err) {
        alert(err.message);
        console.error('Error:', err);
      }
    },
    
    mostrarDetalles(documento) {
      this.documentoSeleccionado = documento;
    }
  }
}
</script>

<style scoped>
.documentos-eliminados {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.loading, .error, .no-documentos {
  padding: 20px;
  text-align: center;
  font-size: 1.2em;
}

.error {
  color: #d32f2f;
}

.documentos-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.documentos-table th, .documentos-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.documentos-table th {
  background-color: #f2f2f2;
}

.btn-restaurar {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 5px 10px;
  margin-right: 5px;
  cursor: pointer;
  border-radius: 3px;
}

.btn-restaurar:hover {
  background-color: #388e3c;
}

.btn-detalles {
  background-color: #2196f3;
  color: white;
  border: none;
  padding: 5px 10px;
  cursor: pointer;
  border-radius: 3px;
}

.btn-detalles:hover {
  background-color: #1976d2;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  width: 80%;
  max-width: 600px;
  position: relative;
}

.close {
  position: absolute;
  top: 10px;
  right: 20px;
  font-size: 24px;
  cursor: pointer;
}

.detalles p {
  margin: 10px 0;
}
</style>