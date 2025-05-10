<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const correo = ref('')
const contraseña = ref('')
const error = ref('')
const loading = ref(false)
const showSnackbar = ref(false)

const login = async () => {
  error.value = ''
  loading.value = true
  try {
    const res = await axios.post('http://localhost:3000/api/usuarios/login', {
        correo: correo.value,
        contraseña: contraseña.value
    })

    localStorage.setItem('token', res.data.token)

    const token = res.data.token
    console.log('Token recibido:', token)

    // Enviar token a ATH (por ejemplo, obtener perfil del usuario)
    const perfilRes = await axios.get('http://localhost:3000/api/usuarios/perfil', {
        headers: {
        Authorization: `Bearer ${token}`
        }
    })

    console.log('Perfil recibido:', perfilRes.data)
    showSnackbar.value = true
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

onMounted(() => {
  const link = document.createElement('link')
  link.rel = 'prefetch'
  link.as = 'style'
  link.href = 'https://miga.org.bo/wp-content/themes/themify-ultra/themify/themify-builder/css/modules/menu_styles/mobile.css?ver=7.8.8'
  document.head.appendChild(link)
})
</script>

<template>
  <v-container class="login-container">
    <v-card class="login-card">
      <v-card-title class="login-title">
        Iniciar Sesión
      </v-card-title>

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
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  padding: 24px;
  max-width: 400px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0px 4px 20px rgba(0, 0, 0, 0.1);
}

.login-title {
  font-family: "Roboto", sans-serif;
  font-weight: bold;
  text-align: center;
  margin-bottom: 1rem;
  font-size: 1.25rem;
  color: #6EC1E4;
}

.login-input input {
  font-family: "Roboto", sans-serif;
}

.login-btn {
  margin-top: 1rem;
  height: 45px;
  background-color: #6EC1E4;
  color: white;
  font-weight: bold;
}

.error-text {
  color: #cf2e2e;
  margin-top: 12px;
}
</style>
