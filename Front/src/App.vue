<script setup>
  import { RouterLink, RouterView } from 'vue-router'
  import { ref, onMounted } from 'vue'
  import axios from 'axios'

  const drawer = ref(false);

  const isLogged = ref(false);
  const isMiga = ref(false);
  const isCommunity = ref(false);

  const verificarRol = async () => {
    const token = localStorage.getItem('token');
    try {
      isLogged.value = true;

      const res = await axios.get('http://localhost:3000/api/usuarios/perfil', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.usuario.rol === 'MIGA') {
        isMiga.value = true; 
      } else if (res.data.usuario.rol === 'COMUNIDAD'){
        isCommunity.value = true; 
      }
    } catch (err) {
      console.error('No se pudo verificar el rol del usuario: ', err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    isLogged.value = false;
    isMiga.value = false;
    isCommunity.value = false;
  }

  onMounted(() => {
    if(localStorage.getItem('token') !== null){
      verificarRol();
    }
  });
</script>

<template>
  <v-app>
    <v-app-bar app class="custom-navbar" flat>
      <v-app-bar-nav-icon @click="drawer = !drawer" class="hidden-md-and-up"></v-app-bar-nav-icon>
      <v-row justify="center" align="center" no-gutters class="w-100 hidden-sm-and-down">
        <v-col cols="auto">
          <v-btn class="nav-button btn1" to="/" exact tag="RouterLink">
            <v-icon start>mdi-home</v-icon>Inicio
          </v-btn>
          <v-btn
            v-if="isMiga"
            class="nav-button btn2"
            to="/TPS"
            tag="RouterLink"
          >
            <v-icon start>mdi-gavel</v-icon>Leyes
          </v-btn>
          <v-btn class="nav-button btn4" to="/docs" tag="RouterLink">
            <v-icon start>mdi-file-document</v-icon>Documentos
          </v-btn>
          <v-btn v-if="isLogged" class="nav-button btn5" to="/favs" tag="RouterLink">
            <v-icon start>mdi-heart</v-icon>Favoritos
          </v-btn>
          <v-btn v-if="isMiga" class="nav-button btn6" to="/reportes" tag="RouterLink">
            <v-icon start>mdi-chart-bar</v-icon>Reportes
          </v-btn>
          <v-btn v-if="isMiga" class="nav-button btn7" to="/propuestas" tag="RouterLink">
            <v-icon start>mdi-lightbulb-on</v-icon>Propuestas
          </v-btn>
          <v-btn v-else-if="isCommunity" class="nav-button btn7" to="/propuestas" tag="RouterLink">
            <v-icon start>mdi-lightbulb-on</v-icon>Mis propuestas
          </v-btn>
          <v-btn v-if="!isLogged" class="nav-button btn3" to="/login" tag="RouterLink">
            <v-icon start>mdi-login</v-icon>Login
          </v-btn>
          <v-btn v-if="isLogged" class="nav-button btn8" @click="logout()" to="/" tag="RouterLink">
            <v-icon start>mdi-login</v-icon>Cerrar sesión
          </v-btn>
        </v-col>
      </v-row>
    </v-app-bar>

    <v-navigation-drawer
      v-model="drawer"
      temporary
      app
      class="hidden-md-and-up"
    >
      <v-list nav dense>
        <v-list-item to="/" exact>
          <v-list-item-title>Inicio</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isMiga" to="/TPS">
          <v-list-item-title>Leyes</v-list-item-title>
        </v-list-item>

        <v-list-item to="/docs">
          <v-list-item-title>Documentos</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isLogged" to="/favs">
          <v-list-item-title>Favoritos</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isMiga" to="/reportes">
          <v-list-item-title>Reportes</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isMiga" to="/propuestas">
          <v-list-item-title>Propuestas</v-list-item-title>
        </v-list-item>
        <v-list-item v-if="isCommunity" to="/propuestas">
          <v-list-item-title>Mis propuestas</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="!isLogged" to="/login">
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isLogged" @click="logout()" to="/">
          <v-list-item-title>Cerrar sesión</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="main-background">
      <v-container class="fade-in">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>

@keyframes softBackground {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.custom-navbar {
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  animation: slideDown 0.7s ease;
  border-bottom: 1px solid #ddd;
  justify-content: center;
}

.nav-button {
  font-weight: 600;
  font-size: 16px;
  margin: 6px 6px;
  padding: 10px 20px;
  border-radius: 30px;
  color: rgb(0, 0, 0);
  background-size: 200% 200%;
  animation: popIn 0.5s ease;
  transition: all 0.4s ease;
  text-transform: none;
}

.btn1 { background-image: linear-gradient(135deg, #f6d365, #fda085); }
.btn2 { background-image: linear-gradient(135deg, #a1c4fd, #c2e9fb); }
.btn3 { background-image: linear-gradient(135deg, #d4fc79, #96e6a1); }
.btn4 { background-image: linear-gradient(135deg, #ffecd2, #fcb69f); }
.btn5 { background-image: linear-gradient(135deg, #fbc2eb, #a6c1ee); }
.btn6 { background-image: linear-gradient(135deg, #fad0c4, #ffd1ff); }
.btn7 { background-image: linear-gradient(135deg, #c1dfc4, #deecdd); }
.btn8 { background-image: linear-gradient(135deg, #F8A0AA, #FEECEE); }

.nav-button:hover {
  background-position: right center;
  transform: scale(1.06);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.main-background {
  background: linear-gradient(120deg, #fcd5ce, #f9dcc4, #e0f7fa, #e1eecb);
  min-height: 100vh;
}

.fade-in {
  animation: fadeIn 1s ease;
  padding-top: 90px;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes popIn {
  0% { transform: scale(0.95); opacity: 0; }
  100% { transform: scale(1); opacity: 1; }
}

@keyframes slideDown {
  from { transform: translateY(-30px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}
</style>

