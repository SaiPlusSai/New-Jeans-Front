<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const correo = ref('')
const contraseña = ref('')
const error = ref('')
const loading = ref(false)
const showSnackbar = ref(false)
const usuarioPerfil = ref(null)

const login = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.post('http://localhost:3000/api/usuarios/login', {
      correo: correo.value,
      contraseña: contraseña.value
    })

    const token = res.data.token
    localStorage.setItem('token', token)
    await obtenerPerfil(token)

    showSnackbar.value = true
    location.reload() // 🔄 Refresca la página para actualizar el estado visible
  } catch (err) {
    if (err.response?.status === 401) {
      error.value = 'Credenciales inválidas'
    } else {
      error.value = 'Error del servidor'
    }
  } finally {
    loading.value = false
  }
}

const obtenerPerfil = async (token) => {
  try {
    const perfilRes = await axios.get('http://localhost:3000/api/usuarios/perfil', {
      headers: { Authorization: `Bearer ${token}` }
    })
    usuarioPerfil.value = perfilRes.data
    console.log('Perfil cargado automáticamente:', perfilRes.data)
  } catch (err) {
    localStorage.removeItem('token') // Si el token es inválido, lo borramos
  }
}

const logout = () => {
  localStorage.removeItem('token')
  usuarioPerfil.value = null
  correo.value = ''
  contraseña.value = ''
}

// Al cargar el componente, verificamos si ya hay un token
onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    obtenerPerfil(token)
  }
})
</script>

<template>
  <v-container class="login-container">
    <v-card class="login-card">
      <template v-if="!usuarioPerfil">
        <v-card-title class="login-title">Iniciar Sesión</v-card-title>
        <v-form @submit.prevent="login">
          <v-text-field
            v-model="correo"
            label="Correo electrónico"
            type="email"
            :rules="[v => !!v || 'Requerido']"
            class="login-input"
            variant="outlined"
          />
          <v-text-field
            v-model="contraseña"
            label="Contraseña"
            type="password"
            :rules="[v => !!v || 'Requerido']"
            class="login-input"
            variant="outlined"
          />
          <v-btn
            type="submit"
            class="login-btn"
            :loading="loading"
            block
            rounded
          >
            Entrar
          </v-btn>
          <p v-if="error" class="error-text">{{ error }}</p>
        </v-form>
      </template>

      <template v-else>
        <v-card-title class="login-title">Bienvenido, {{ usuarioPerfil.nombre }}</v-card-title>
        <v-card-text>
          <p><strong>Correo:</strong> {{ usuarioPerfil.correo }}</p>
          <p><strong>Rol:</strong> {{ usuarioPerfil.rol || 'Usuario' }}</p>
        </v-card-text>
        <v-btn class="login-btn" color="error" @click="logout" block rounded>
          Cerrar sesión
        </v-btn>
      </template>
    </v-card>

    <v-snackbar
      v-model="showSnackbar"
      class="login-snackbar"
      location="bottom"
      timeout="3000"
    >
      ¡Inicio de sesión exitoso!
    </v-snackbar>
  </v-container>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap');

@keyframes softBackground {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(120deg, #fcd5ce, #f9dcc4, #e0f7fa, #e1eecb);
  background-size: 500% 500%;
  animation: softBackground 18s ease infinite;
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