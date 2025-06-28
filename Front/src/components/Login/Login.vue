<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'
import axios from 'axios'

const showPassword = ref(false);
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

    const token = res.data.token
    localStorage.setItem('token', token)

    showSnackbar.value = true
    setTimeout(() => {
      location.reload()
    }, 1000)
  } catch (err) {
    if (err.response.status === 401) {
      error.value = 'Credenciales inválidas'
    } else {
      error.value = 'Usuario no encontrado'
    }
  } finally {
    loading.value = false 
  }
}

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    const router = useRouter()
    router.push('/')
  }
})
</script>

<template>
  <v-container class="login-container">
    <v-card class="login-card">
      <v-card-title class="login-title">Iniciar Sesión</v-card-title>
      <v-form @submit.prevent="login">
        <v-text-field
          v-model="correo"
          label="Correo electrónico"
          type="email"
          :rules="[v => !!v || 'Este campo no puede estar vacío.']"
          class="login-input"
          variant="outlined"
        />
        <v-text-field
          v-model="contraseña"
          label="Contraseña"
          :type="showPassword ? 'text' : 'password'"
          :rules="[v => !!v || 'Este campo no puede estar vacío.']"
          class="login-input"
          variant="outlined"
          :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword"
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
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap');

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
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