<script setup>
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <v-app>
    <v-app-bar app color="black" dark flat>
      <v-toolbar-title class="text-white">ALIMENTACIÓN SALUDABLE</v-toolbar-title>
      <v-spacer />
      <v-btn text to="/" exact tag="RouterLink">Inicio</v-btn>
      <v-btn text to="/TPS" tag="RouterLink">Leyes</v-btn>
      <v-btn text to="/login" tag="RouterLink">Login</v-btn>
    </v-app-bar>
    <v-main>
      <v-container class="py-8">
        <RouterView />
      </v-container>
    </v-main>
  </v-app>
</template>

<style scoped>
.v-btn--active {
  font-weight: bold;
  border-bottom: 2px solid white;
}
</style>
