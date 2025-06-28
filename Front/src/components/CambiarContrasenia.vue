<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">Cambiar Contraseña</h2>

      <form @submit.prevent="cambiarContrasenia">
        <div class="login-input">
          <input
            :type="verActual ? 'text' : 'password'"
            v-model="actual"
            placeholder="Contraseña actual"
            required
          />
          <button type="button" class="ver-btn" @click="verActual = !verActual">
            <span class="material-icons">
              {{ verActual ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        </div>

        <div class="login-input">
          <input
            :type="verNueva ? 'text' : 'password'"
            v-model="nueva"
            placeholder="Nueva contraseña"
            required
          />
          <button type="button" class="ver-btn" @click="verNueva = !verNueva">
            <span class="material-icons">
              {{ verNueva ? 'visibility_off' : 'visibility' }}
            </span>
          </button>
        </div>

        <button class="login-btn" type="submit" :disabled="cargando">
          {{ cargando ? 'Cambiando...' : 'Cambiar Contraseña' }}
        </button>

        <p v-if="mensaje" :class="['error-text', exito ? 'exito-text' : '']">
          {{ mensaje }}
        </p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const actual = ref('')
const nueva = ref('')
const verActual = ref(false)
const verNueva = ref(false)

const mensaje = ref('')
const exito = ref(false)
const cargando = ref(false)

const cambiarContrasenia = async () => {
  cargando.value = true
  mensaje.value = ''
  exito.value = false

  try {
    const token = localStorage.getItem('token')

    const response = await fetch('http://localhost:3000/api/usuarios/cambiar-contrasenia', {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        actual: actual.value,
        nueva: nueva.value,
      }),
    })

    const data = await response.json()

    if (response.ok) {
      mensaje.value = data.mensaje || 'Contraseña actualizada correctamente.'
      exito.value = true
      actual.value = ''
      nueva.value = ''
    } else {
      mensaje.value = data.mensaje || 'Ocurrió un error'
    }
  } catch (error) {
    mensaje.value = 'Error de red o del servidor'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap');
@import url('https://fonts.googleapis.com/icon?family=Material+Icons');

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

.login-input {
  position: relative;
}

.login-input input {
  width: 100%;
  padding: 12px 40px 12px 14px;
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

.ver-btn {
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  cursor: pointer;
  color: #7b1fa2;
  font-size: 1.5rem;
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

.exito-text {
  color: #4caf50;
}
</style>
