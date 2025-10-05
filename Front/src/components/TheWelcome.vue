<template>
  <v-container>
    <v-row class="justify-center text-center">
      <h1>“Escuelas que nutren”</h1>
    </v-row>
    <v-row class="mt-8 align-center">
      <v-col cols="12" sm="5">
        <v-img src="/assets/MIGA_EscuelasQueNutren.png" maxHeight="350"></v-img>
      </v-col>
      <v-col cols="12" sm="7">
        <h2>¿De qué trata el proyecto?</h2>
        <p>
          El proyecto “Sembrando Saberes y Sabores – Escuelas que Nutren”
          tiene como objetivo que los niñas y niños aprendan a alimentarse de
          forma saludable y con identidad boliviana.

          Con la ayuda de los MIGAFONOS, una serie infantil creada por MIGA,
          la escuela se convierte en un espacio divertido para hablar de
          alimentos locales, nutrición y cultura. Al mismo tiempo, madres,
          padres y docentes fortalecen su rol como guardianes de la
          alimentación, compartiendo saberes y mejorando las meriendas
          escolares, en entorno al Patrimonio Alimentario.
        </p>
      </v-col>
    </v-row>
    <v-row class="align-center">
      <v-col cols="12" sm="7">
        <h2>¿Quiénes son los MIGAFONOS?</h2>
        <p>
          MIGAFONOS es una herramienta de educación alimentaria.

          Esta propuesta lúdica cobra vida a través de una banda de música conformada por amigos Asaí, Chilto, 
          Isaño y Muña. Desde un inicio, querían ser una banda de rock, y gracias a la ayuda de una vecina, 
          una abuelita que los adoptó como sus nietos, deciden hacer música original, moderna, pero con un toque tradicional boliviano.
        </p>
      </v-col>
      <v-col cols="12" sm="5">
        <v-img src="/assets/MIGA_Migafonos.png" maxHeight="300"></v-img>
      </v-col>
    </v-row>
    <v-row class="pa-8" justify="center">
      <v-btn class="btn ma-2" :href="'https://miga.org.bo/'" target="_blank"><strong>Conoce sobre MIGA</strong></v-btn>
      <v-btn class="btn ma-2" :href="'https://www.facebook.com/migaboliviaong'" target="_blank"><strong>Siguenos en Redes Sociales</strong></v-btn>
    </v-row>

    <v-row class="pt-8 pb-4" justify="center">
      <h2>Objetivos del Proyecto</h2>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-end" cols="12" sm="6">
        <v-card class="card-square">
          <v-card-text class="align-center card-square-text" style="padding-right: 72px;">
            Sensibilizar y capacitar en alimentación saludable.
          </v-card-text>
          <div class="color-square-right" style="background-color: #b7c8dd;"></div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card class="card-square">
          <div class="color-square-left" style="background-color: #d1dab3;"></div>
          <v-card-text class="align-center card-square-text" style="padding-left: 72px;">
             Fortalecer el rol de las mujeres como guardianas de la alimentación.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col class="d-flex justify-end" cols="12" sm="6">
        <v-card class="card-square">
          <v-card-text class="card-square-text align-center" style="padding-right: 72px;">
            Escuelas como agentes de cambio en buenas prácticas alimentarias.
          </v-card-text>
          <div class="color-square-right" style="background-color: #e6d1e2;"></div>
        </v-card>
      </v-col>
      <v-col cols="12" sm="6">
        <v-card class="card-square">
          <div class="color-square-left" style="background-color: #f9b5a9;"></div>
          <v-card-text class="align-center card-square-text" style="padding-left: 72px;">
             Articulación con políticas públicas para incidir en el desarrollo local.
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row  class="pt-8 pb-4" justify="center">
      <h2>Alcance del Proyecto</h2>
    </v-row>
    <v-row>
      <v-col cols="12" sm=6>
        <p>UNIDADES EDUCATIVAS</p>
        <ul>
          <li class="list-item">Faro Murillo.</li>
          <li class="list-item">José Santos Vargas.</li>
          <li class="list-item">Marcelo Quiroga Santa Cruz.</li>
          <li class="list-item">Luis Espinal Camps.</li>
          <li class="list-item">Jaime Escalante.</li>
        </ul>
      </v-col>
      <v-col cols="12" sm="6">
        <ul>
          <li class="list-item">Comunidad Educativa
            <ul>
              <li class="list-item2">250 niños/niñas de 6to de primaria</li>
              <li class="list-item2">25 maestros/maestras</li>
              <li class="list-item2">5 directoras</li>
            </ul>
          </li>
          <li class="list-item">Guardianas de la alimentación
            <ul>
              <li class="list-item2">60 mujeres/varones del entorno educativo</li>
            </ul>
          </li>
          <li class="list-item">Actores en incidencia de politica pública
            <ul>
              <li class="list-item2">30 autoridades locales, representantes de las comunidades educativas</li>
            </ul>
          </li>
        </ul>
      </v-col>
    </v-row>
    <v-row class="pt-8">
      <h2>Grupo meta y resultados</h2>
    </v-row>
    <v-row class="cards-section">
      <div class="card-container">
      <div class="flip-card" v-for="item in tarjetas" :key="item.titulo">
        <div class="flip-inner">
          <div class="flip-front">
            <h3>{{ item.titulo }}</h3>
            <ul>
              <li v-for="text in item.texto" :key="item.texto" class="list-item-card">{{ text }}</li>
            </ul>
          </div>
          <div class="flip-back">
            <img :src="item.img" class="img-card"/>
          </div>
        </div>
      </div>
    </div>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const tarjetas = ref([
  {
    titulo: 'Fortalecimiento de conocimientos en alimentación saludable y patrimonio alimentario',
    texto: [
      'Niñas, niños, maestras, directores, responsables de kiosko y actores del entorno educativo adquieren herramientas para elegir y promover una alimentación nutritiva, diversa y arraigada en el Patrimonio Alimentario.',
      'Se fortalecen hábitos que no solo previenen la malnutrición, sino que también promueven bienestar, identidad cultural y valoración de lo nuestro.'
    ],
    img: '/assets/MIGA_Card1.png'
  },
  {
    titulo: 'Revalorización de saberes locales y protagonismo de las mujeres',
    texto: [
      'Las Guardianas de la Alimentación son reconocidas como referentes comunitarias.',
      'Se fomenta el orgullo por los saberes ancestrales y la transmisión intergeneracional.',
      'Mujeres fortalecidas en su rol educativo, económico y cultural.'
    ],
    img: '/assets/MIGA_Card2.png'
  },
  {
    titulo: 'Escuelas como agentes de cambio e incidencia en políticas públicas',
    texto: [
      'Las unidades educativas se consolidan como espacios que promueven prácticas alimentarias saludables.',
      'La experiencia escolar aporta insumos y evidencia para articular acciones con políticas locales y nacionales de alimentación.',
      'Se sientan bases para la sostenibilidad y escalamiento del modelo.'
    ],
    img: '/assets/MIGA_Card3.png'
  }
])

gsap.registerPlugin(ScrollTrigger)

onMounted(() => {
  gsap.to('.letter', {
    duration: 1,
    yPercent: 100,
    ease: 'expo.inOut',
    repeat: -1,
    yoyo: true,
    repeatDelay: 2,
    stagger: {
      each: 0.04,
      from: 'random'
    }
  })

  gsap.from('.flip-card', {
    opacity: 0,
    y: 50,
    duration: 1,
    stagger: 0.2,
    scrollTrigger: {
      trigger: '.cards-section',
      start: 'top 80%'
    }
  })
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand:wght@400;600&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');

body {
  margin: 0;
  font-family: 'Quicksand', sans-serif;
  background-color: #fffafc;
  color: #3b3b3b;
}

h1{
  font-family: 'Montserrat', sans-serif;
  font-weight: bold;
  font-size: xx-large;
}

h2{
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: x-large;
  padding-bottom: 10px;
}

p{
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: larger;
  text-align: justify;
}

.list-item{
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: larger;
  text-align: justify;
  margin-left: 20px;
}

.list-item2{
  font-family: 'Quicksand', sans-serif;
  font-weight: 600;
  font-size: large;
  text-align: justify;
  margin-left: 20px;
}

.img-card{
  max-width: 300;
}

.btn{
  background: linear-gradient(135deg, #f6d365, #fda085);
  font-family: "Quicksand", sans-serif;
  font-size: medium;
  border-radius: 20px;
  min-width: 150px;
  min-height: 100%;
}

.card-square{
  font-family: 'Quicksand', sans-serif;
  text-align: center;
  background-color: #faf0e6;
  width: 100%;
  height: 70px;
}

.card-square-text{
  font-weight: bolder; 
  font-size: small; 
}

@media (min-width: 1024px){
  .card-square-text{
    font-size: medium;
  }
}

.color-square-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 70px;
  height: 100%;
}

.color-square-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 70px;
  height: 100%;
}

/* Flip Cards */
.card-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  margin: 2rem auto 4rem auto;
  max-width: 1200px;
}

.flip-card {
  width: 350px;
  height: 450px;
  perspective: 1000px;
}

.flip-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 1s;
  transform-style: preserve-3d;
}

.flip-card:hover .flip-inner {
  transform: rotateY(180deg);
}

.flip-front,
.flip-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
}

.flip-front {
  background: #f4f6f6;
  display: flex;
  flex-direction: column;
  justify-content: start;
  color: #1f2937;
  padding: 25px;
}

.flip-back img {
  object-fit: contain;
  border-radius: 10px;
  width: 320px;
}

.flip-back {
  background: #f4f6f6;
  color: #1f2937;
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  font-size: 1rem;
}

h3{
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: medium;
  padding-bottom: 15px;
}

.list-item-card{
  font-family: 'Quicksand', sans-serif;
  font-weight: 700;
  font-size: medium;
  text-align: justify;
  margin-left: 20px;
  text-align: justify;
}
</style>
