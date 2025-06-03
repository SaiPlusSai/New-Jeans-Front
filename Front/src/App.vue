<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar app class="custom-navbar" flat>
      <v-row justify="center" align="center" no-gutters class="w-100">
        <v-col cols="auto">
          <v-btn class="nav-button btn1" to="/" exact tag="RouterLink">
            <v-icon start>mdi-home</v-icon>Inicio
          </v-btn>
          <v-btn class="nav-button btn2" to="/TPS" tag="RouterLink">
            <v-icon start>mdi-gavel</v-icon>Leyes
          </v-btn>
          <v-btn class="nav-button btn4" to="/docs" tag="RouterLink">
            <v-icon start>mdi-file-document</v-icon>Documentos
          </v-btn>
          <v-btn class="nav-button btn5" to="/favs" tag="RouterLink">
            <v-icon start>mdi-heart</v-icon>Favoritos
          </v-btn>
          <v-btn class="nav-button btn6" to="/reportes" tag="RouterLink">
            <v-icon start>mdi-chart-bar</v-icon>Reportes
          </v-btn>
          <v-btn class="nav-button btn7" to="/propuestas" tag="RouterLink">
            <v-icon start>mdi-lightbulb-on</v-icon>Propuestas
          </v-btn>
          <v-btn class="nav-button btn3" to="/login" tag="RouterLink">
            <v-icon start>mdi-login</v-icon>Login
          </v-btn>
        </v-col>
      </v-row>
    </v-app-bar>

    <v-main class="main-background">
      <v-container class="fade-in">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
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

.nav-button:hover {
  background-position: right center;
  transform: scale(1.06);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.main-background {
  background: linear-gradient(to bottom right, #ffffff, #e0f7fa);
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

