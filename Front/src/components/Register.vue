<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Registro de Comunidad</h2>

      <form @submit.prevent="registrarUsuario">
        <div class="login-input">
          <input v-model="form.nombres" type="text" placeholder="Nombres" required />
          <input v-model="form.apellidop" type="text" placeholder="Apellido Paterno" required />
          <input v-model="form.apellidom" type="text" placeholder="Apellido Materno" />
          <input v-model="form.carnet_ci" type="text" placeholder="Carnet de Identidad (CI)" required />
          <input v-model="form.correo" type="email" placeholder="Correo electrónico" />
          <v-select
            v-model="form.macrodistrito_id"
            :items="macrodistritos"
            item-title="nombre"
            item-value="id"
            label="Macrodistrito"
            outlined
            required
            :rules="[v => !!v || 'Macrodistrito es requerido']"
          />
          <v-select
            v-model="form.zona_id"
            :items="zonas"
            item-title="nombre_zona"
            item-value="id"
            label="Zona"
            outlined
            required
            :rules="[v => !!v || 'Zona es requerido']"
            :loading="loading"
            :disabled="!form.macrodistrito_id"
          />
          <v-select
            v-model="form.ambitoactividad_id"
            :items="ambitos"
            item-title="nombre"
            item-value="id"
            label="Ámbito de actividad"
            outlined
            required
            :rules="[v => !!v || 'Ámbito de actividad es requerido']"
          />
        </div>

        <button type="submit" class="login-btn">Registrarse</button>
      </form>

      <div v-if="mensaje" class="error-text">{{ mensaje }}</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      form: {
        nombres: "",
        apellidop: "",
        apellidom: "",
        carnet_ci: "",
        correo: null,
        contraseña: null,
        macrodistrito_id: null,
        zona_id: null,
        ambitoactividad_id: null
      },
      macrodistritos : [],
      zonas: [],
      ambitos: [],
      loading: false,
      mensaje: ""
    };
  },
  watch: {
    'form.macrodistrito_id'(newMacro){
      this.cargarZonas(newMacro)
    }
  },
  methods: {
    async registrarUsuario() {
      try {
      const res = await fetch("http://localhost:3000/api/usuarios/registro-comunidad", {
          method: "POST",
          headers: {
          "Content-Type": "application/json"
          },
          body: JSON.stringify(this.form)
      });

      const data = await res.json();

      if (res.status === 201) {
          this.mensaje = `✅ ${data.mensaje}. Usuario: ${data.Usuario_defecto}. Su contraseña es su CI.`;
      } else {
          this.mensaje = `⚠️ ${data.mensaje || 'Error en el registro'}`;
      }
      } catch (error) {
      this.mensaje = "❌ Error al conectar con el servidor";
      console.error(error);
      }
    },

    async cargarMacros() {
      try {
        const res = await fetch("http://localhost:3000/api/macrodistritos", {
            method: "GET"
        });

        this.macrodistritos = await res.json();

      } catch (error) {
        this.mensaje = "❌ Error al conectar con el servidor";
        console.error(error);
      }
    },

    async cargarZonas(idMacro) {
      if (!idMacro) {
        this.zonas = []
        return
      }
      
      this.loading = true

      try {
        const res = await fetch(`http://localhost:3000/api/macrodistrito/${idMacro}/zonas`, {
            method: "GET"
        });

        this.zonas = await res.json();

      } catch (error) {
        this.mensaje = "❌ Error al conectar con el servidor";
        console.error(error);
      } finally {
        this.loading = false
      }
    },

    async cargarAmbitos() {
      try {
        const res = await fetch("http://localhost:3000/api/ambitos", {
            method: "GET"
        });

        this.ambitos = await res.json();

      } catch (error) {
        this.mensaje = "❌ Error al conectar con el servidor";
        console.error(error);
      }
    },
  },
  mounted() {
    this.cargarMacros(),
    this.cargarAmbitos()
  }
};
</script>
          
<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap');

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  padding: 32px;
  max-width: 420px;
  width: 100%;
  border-radius: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 0 12px 45px rgba(0, 0, 0, 0.15);
  transition: transform 0.4s ease, box-shadow 0.4s ease;
}

.login-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.2);
}

.login-title {
  font-family: "Quicksand", sans-serif;
  font-weight: 600;
  text-align: center;
  margin-bottom: 1.5rem;
  font-size: 1.7rem;
  color: #b388eb;
  text-shadow: 0 1px 2px #ddd;
}

.login-input input {
  width: 100%;
  padding: 12px 14px;
  margin-bottom: 14px;
  border-radius: 10px;
  border: 1.5px solid #e1bee7;
  font-family: "Quicksand", sans-serif;
  background-color: #f3e5f5;
  font-size: 1rem;
  transition: border 0.3s ease, background-color 0.3s ease;
}

.login-input input:focus {
  border-color: #ce93d8;
  background-color: #fce4ec;
  outline: none;
}

.v-select {
  width: 100%;
  margin-bottom: 14px;
  border-radius: 10px;
  border: 1.5px solid #e1bee7;
  font-family: "Quicksand", sans-serif;
  background-color: #f3e5f5;
  font-size: 1rem;
  transition: border 0.3s ease, background-color 0.3s ease;
}

.v-select:focus {
  border-color: #ce93d8;
  background-color: #fce4ec;
  outline: none;
}

.login-btn {
  width: 100%;
  margin-top: 1rem;
  height: 48px;
  background: linear-gradient(to right, #b2ebf2, #b39ddb);
  color: white;
  font-weight: 600;
  border: none;
  border-radius: 10px;
  font-family: "Quicksand", sans-serif;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.4s ease, transform 0.2s ease;
}

.login-btn:hover {
  background: linear-gradient(to right, #80deea, #9575cd);
  transform: scale(1.02);
}

.error-text {
  color: #ef5350;
  margin-top: 14px;
  font-size: 0.9rem;
  text-align: center;
  font-family: "Quicksand", sans-serif;
}
</style>
