<template>
    <v-container>
        <v-tabs v-model="tab">
            <v-tab value="users">Usuarios</v-tab>
            <v-tab value="macros">Macrodistritos</v-tab>
            <v-tab value="ambitos">Ámbitos de actividad</v-tab>
        </v-tabs>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="users">
                <GestionUsuarios />
            </v-tabs-window-item>
        </v-tabs-window>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="macros">
                <GestionMacros />
            </v-tabs-window-item>
        </v-tabs-window>

        <v-tabs-window v-model="tab">
            <v-tabs-window-item value="ambitos">
                <GestionAmbitos />
            </v-tabs-window-item>
        </v-tabs-window>

    </v-container>
</template>

<script setup>
    import { ref } from 'vue'
    import GestionUsuarios from '../Usuarios/GestionUsuarios.vue'
    import GestionMacros from '../Usuarios/GestionMacros.vue'
    import GestionAmbitos from '../Usuarios/GestionAmbitos.vue'

    const tab = ref(null)
</script>

<style scoped   >
.v-container {
  background: linear-gradient(145deg, #f5f7fa, #e4e8f0);
  min-height: 100vh;
  padding: 2rem;
}
</style>