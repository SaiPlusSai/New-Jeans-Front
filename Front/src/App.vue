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

      const res = await axios.get('https://newjeans-back.onrender.com/api/usuarios/perfil', {
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
          <v-tooltip text="Ir al inicio" location="bottom">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn1" to="/" exact tag="RouterLink">
                <v-icon start>mdi-home</v-icon>Inicio
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Ver leyes y normativas" location="bottom" v-if="isMiga">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn2" to="/TPS" tag="RouterLink">
                <v-icon start>mdi-gavel</v-icon>Leyes
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Aquí podrá acceder a todas las normativas organizadas y clasificadas para su consulta." location="bottom">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn4" to="/docs" tag="RouterLink">
                <v-icon start>mdi-file-document</v-icon>Documentos
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Espacio para guardar y acceder rápidamente a los documentos más relevantes según su interés." location="bottom" v-if="isLogged">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn5" to="/favs" tag="RouterLink">
                <v-icon start>mdi-heart</v-icon>Favoritos
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Gestionar usuarios registrados" location="bottom" v-if="isMiga">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn6" to="/usuarios" tag="RouterLink">
                <v-icon start>mdi-account</v-icon>Usuarios
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Ver estadísticas y reportes del sistema" location="bottom" v-if="isMiga">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn6" to="/reportes" tag="RouterLink">
                <v-icon start>mdi-chart-bar</v-icon>Reportes
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Sección destinada a la presentación y consulta de nuevas ideas o iniciativas relacionadas con la alimentación saludable." location="bottom" v-if="!isCommunity">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn7" to="/propuestas" tag="RouterLink">
                <v-icon start>mdi-lightbulb-on</v-icon>Propuestas
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Ver tus propuestas enviadas" location="bottom" v-else-if="isCommunity">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn7" to="/propuestas" tag="RouterLink">
                <v-icon start>mdi-lightbulb-on</v-icon>Mis propuestas
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Área de acceso para usuarios registrados, que les permitirá gestionar sus favoritos, propuestas y personalizar su experiencia en la plataforma." location="bottom" v-if="!isLogged">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn3" to="/login" tag="RouterLink">
                <v-icon start>mdi-login</v-icon>Login
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Crear una nueva cuenta" location="bottom" v-if="!isLogged">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn3" to="/register" tag="RouterLink">
                <v-icon start>mdi-account-plus</v-icon>Registrarse
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Cerrar sesión de tu cuenta actual" location="bottom" v-if="isLogged">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn8" @click="logout()" to="/" tag="RouterLink">
                <v-icon start>mdi-login</v-icon>Cerrar sesión
              </v-btn>
            </template>
          </v-tooltip>
          <v-tooltip text="Actualizar tu contraseña" location="bottom" v-if="isLogged">
            <template #activator="{ props }">
              <v-btn v-bind="props" class="nav-button btn8" to="/cambiar" tag="RouterLink">
                <v-icon start>mdi-lock-reset</v-icon>Cambiar contraseña
              </v-btn>
            </template>
          </v-tooltip>
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

        <v-list-item v-if="isMiga" to="/usuarios">
          <v-list-item-title>Usuarios</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isMiga" to="/reportes">
          <v-list-item-title>Reportes</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="!isCommunity" to="/propuestas">
          <v-list-item-title>Propuestas</v-list-item-title>
        </v-list-item>
        <v-list-item v-else-if="isCommunity" to="/propuestas">
          <v-list-item-title>Mis propuestas</v-list-item-title> 
        </v-list-item>

        <v-list-item v-if="!isLogged" to="/login">
          <v-list-item-title>Login</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isLogged" @click="logout()" to="/">
          <v-list-item-title>Cerrar sesión</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="!isLogged" to="/register">
          <v-list-item-icon><v-icon>mdi-account-plus</v-icon></v-list-item-icon>
          <v-list-item-title>Registrarse</v-list-item-title>
        </v-list-item>

        <v-list-item v-if="isLogged" to="/cambiar">
          <v-list-item-icon><v-icon>mdi-lock-reset</v-icon></v-list-item-icon>
          <v-list-item-title>Cambiar contraseña</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-main class="main-background">
      <v-container class="fade-in">
        <RouterView />
      </v-container>
    </v-main>

    <v-footer class="footer">
      <v-row>
        <v-col class="pt-6" cols="12" sm="4">
          <p>Financiado por:</p>
          <v-row class="pt-6 justify-center align-center">
            <v-btn class="logo-btn" variant="plain" :href="'https://cooperacion.asturias.es/'" target="_blank">
              <v-img class="footer-img" src="/assets/logos/agenciaAsturiana_logo.png"/>
            </v-btn>
            <v-btn class="logo-btn" variant="plain" :href="'https://www.asturias.es/ast/inicio'" target="_blank">
              <v-img class="footer-img" src="/assets/logos/GobiernodelPrincipadodeAsturias_logo.png"/>
            </v-btn>
            <v-btn class="logo-btn" variant="plain" :href="'https://www.fundacionadsis.org/es'" target="_blank">
              <v-img class="footer-img" src="/assets/logos/fundacionAdsis_logo.png"/>
            </v-btn>
          </v-row>
        </v-col>
        <v-col class="pt-6" cols="12" sm="4">
          <p>Implementado por:</p>
          <v-row class="pt-6 justify-center align-center">
            <v-btn class="logo-btn" variant="plain" :href="'https://miga.org.bo/'" target="_blank">
              <v-img class="footer-img" src="/assets/logos/miga_logo.png"/>
            </v-btn>
          </v-row>
        </v-col>
        <v-col class="pt-6" cols="12" sm="4">
          <p>Con el apoyo de:</p>
          <v-row class="pt-6 justify-center align-center">
            <v-btn class="logo-btn" variant="plain" :href="'https://www.ucb.edu.bo/'" target="_blank">
              <v-img class="footer-img" src="/assets/logos/ucb_logo.png"/>
            </v-btn>
            <v-btn class="logo-btn" variant="plain" :href="'https://sis-ucb.online/'" target="_blank">
              <v-img class="footer-img" src="/assets/logos/sis_logo.png"/>
            </v-btn>
          </v-row>
        </v-col>
        <v-col class="pt-6" cols="12" sm="4">
          <p>Equipo Encargado del Proyecto</p>
          <v-col cols="12" md="8" lg="6">
              <v-list class="transparent-list">
                <v-list-item class="member">Alina Mollinedo Dávila</v-list-item>
                <v-list-item class="member">Raquel Osorio Mamani</v-list-item>
                <v-list-item class="member">Jean Marco Fernández Silva</v-list-item>
                <v-list-item class="member">Sergio Alejandro Arias Mayta</v-list-item>
              </v-list>
          </v-col>
        </v-col>
        <v-col class="pt-6" cols="12" sm="4">
          <p>Supervisores del Proyecto</p>
           <v-col cols="12" md="8" lg="6" class="mt-8">
              <v-list class="transparent-list">
                <v-list-item class="member">Ing. Miguel Ángel Pacheco Arteaga</v-list-item>
                <v-list-item class="member">Mgr. Lourdes Peredo Quiroga</v-list-item>
              </v-list>
          </v-col>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

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
  background: #e8dfd9;
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

.footer{
  padding-top: 30px;
  background-color: #e3d4c9;
  height: 500px;
  padding-bottom: 40px;
}

.footer p{
  font-family: 'Quicksand', sans-serif;
  font-weight: 900;
  font-size: larger;
  text-align: justify;
  padding-bottom: 10px;
}

.logo-btn{
  width: 30%;
  min-height: 100px;
  background-color: transparent;
  border-radius: 20px;
  margin: 5px;
}

.footer-img{
  height: 100px;
  width: 100px;
}

.transparent-list {
  background: transparent;
  font-family: 'Quicksand', sans-serif;
  font-weight: 900;
  font-size: larger;
}
</style>