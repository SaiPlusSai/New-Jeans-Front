<template>
  <section class="intro-section">
    <svg class="blob-bg" viewBox="0 0 600 600">
      <g transform="translate(300,300)">
        <path d="M120,-172.3C160.2,-141.5,194.7,-106.3,202.5,-67.9C210.2,-29.4,191.1,12.4,172.7,54.6C154.2,96.9,136.5,139.7,105.3,158.6C74.2,177.4,29.6,172.3,-11.1,176.6C-51.9,181,-103.7,194.8,-134.8,178.8C-165.9,162.9,-176.3,117.2,-178.1,76.3C-180,35.4,-173.3,-0.8,-166.7,-42.7C-160.2,-84.6,-153.8,-132.3,-123.4,-168.8C-93,-205.3,-39,-230.7,5.2,-237.8C49.4,-244.9,98.7,-233.2,120,-172.3Z" fill="#fcdce1"/>
      </g>
    </svg>
    <h1>Los MIGAFONOS: Escuelas que nutren</h1>
    <p>
      Este sistema forma parte de la iniciativa <strong>"Los MIGAFONOS: Escuelas que nutren"</strong>, que promueve la <strong>alimentación saludable, soberana y sostenible</strong> desde una mirada integral.
    </p>
    <p>
      Inspirado en la serie infantil <em>Los MIGAFONOS</em>, busca sensibilizar a la comunidad educativa y autoridades a través de herramientas lúdicas que integran <strong>saberes, cultura y bienestar</strong>.
    </p>
    <p>
      Este sistema refuerza el componente de <strong>incidencia pública</strong>, facilitando el acceso a normativas y conocimientos clave.
    </p>
    <a class="cta-button" href="https://miga.org.bo/" target="_blank">Conocer más sobre MIGA</a>
  </section>

  <section class="highlight-section">
    <div class="wrapper">
      <ul class="text-lines">
        <li>
          <span class="letter" v-for="l in 'Alimentación'" :key="l"><span>{{ l }}</span><span>{{ l }}</span></span>
        </li>
        <li>
          <span class="letter" v-for="l in 'Saludable'" :key="l"><span>{{ l }}</span><span>{{ l }}</span></span>
        </li>
        <li>
          <span class="letter" v-for="l in 'Estudiantil'" :key="l"><span>{{ l }}</span><span>{{ l }}</span></span>
        </li>
      </ul>
    </div>
  </section>

  <section class="carousel-section">
    <div class="carousel">
      <div class="carousel-track">
        <img src="https://www.urgente.bo/sites/default/files/79174b49-25bf-4fbe-9795-f0965aa7172a_0.jpg" alt="Frutas" />
        <img src="https://scontent-lim1-1.xx.fbcdn.net/v/t39.30808-6/482220959_983164950592201_6431649538134000164_n.jpg" alt="Verduras" />
        <img src="https://hemeroteca.larazon.bo/wp-content/uploads/2025/02/DESAYUNO-ESCOLAR-AMUN.jpg" alt="Agua" />
        <img src="https://laprensa.bo/sites/default/files/styles/imagen_content/public/portadas/2025-01/Captura%20de%20pantalla%202025-01-14%201.jpg.webp" alt="Desayuno" />
      </div>
    </div>
  </section>

  <section class="cards-section">
    <h2 class="section-title">Descubre los beneficios</h2>
    <div class="card-container">
      <div class="flip-card" v-for="item in tarjetas" :key="item.titulo">
        <div class="flip-inner">
          <div class="flip-front">
            <h3>{{ item.titulo }}</h3>
            <img :src="item.img" :alt="item.titulo" />
          </div>
          <div class="flip-back">
            <p>{{ item.texto }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="scroll-section">
    <div class="scrolling-container">
      <div class="scrolling-text">
        El municipio de La Paz complementa con normas que aplican en comunidades educativas y puede ir adicionando en el tiempo con las que se aprueben. Las comunidades escolares requieren acceder a esta normativa para identificar aspectos a cumplir según sus proyectos y entornos alimentarios saludables. La academia de MIGA puede usar este módulo para compartir conocimiento normativo relevante.
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const tarjetas = ref([
  {
    titulo: 'Tradición y Futuro',
    texto: 'Promueve una alimentación saludable conectada con nuestras raíces y cultura.',
    img: 'https://cdn.pixabay.com/photo/2020/02/14/08/11/bolivia-4845928_1280.jpg'
  },
  {
    titulo: 'Educación Lúdica',
    texto: 'Materiales inspirados en Los MIGAFONOS para enseñar jugando a niñas y niños.',
    img: 'https://cdn.pixabay.com/photo/2018/02/01/15/50/child-3120179_1280.jpg'
  },
  {
    titulo: 'Enfoque Integral',
    texto: 'Nutrimos con alimentos, saberes y valores para transformar el presente.',
    img: 'https://cdn.pixabay.com/photo/2021/09/07/13/34/community-6604559_1280.jpg'
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

body {
  margin: 0;
  font-family: 'Quicksand', sans-serif;
  background-color: #fffafc;
  color: #3b3b3b;
}

/* Intro */
.intro-section {
  position: relative;
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(135deg, #FFE6BB 0%, #FCDCE1 100%);
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05);
  margin: 2rem auto;
  max-width: 1000px;
  z-index: 1;
}

.blob-bg {
  position: absolute;
  top: -100px;
  left: -100px;
  width: 900px;
  height: 900px;
  z-index: -1;
  opacity: 0.12;
}

.intro-section h1 {
  color: #A64E7A;
  font-size: 2.5rem;
  margin-bottom: 1.2rem;
  font-weight: 700;
}

.intro-section p {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  line-height: 1.6;
}

.cta-button {
  display: inline-block;
  background-color: #E9D8FD;
  color: #4B0082;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  font-weight: bold;
  margin-top: 1rem;
  text-decoration: none;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.cta-button:hover {
  background-color: #d7c3f3;
  transform: scale(1.05);
}

/* Letras flotantes */
.wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  width: 100%;
  overflow: hidden;
  margin-top: 2rem;
}

.text-lines {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: clamp(2rem, 8vw, 6rem);
  line-height: 1;
  list-style: none;
  padding: 0;
  margin: 0;
  color: #A64E7A;
}

li {
  display: flex;
  overflow: hidden;
}

.letter {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 1em;
  line-height: 1em;
  overflow: hidden;
  font-family: 'Impact', Haettenschweiler, 'Arial Narrow Bold', sans-serif;
}

.letter span {
  display: block;
  text-align: center;
  height: 1em;
}

/* Carrusel */
.carousel {
  width: 100%;
  max-width: 800px;
  height: 400px;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);
  margin: 3rem auto 1rem auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.carousel-track {
  display: flex;
  width: 400%;
  animation: slide 16s infinite ease-in-out;
}

.carousel-track img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  flex-shrink: 0;
}

@keyframes slide {
  0%, 20% { transform: translateX(0%); }
  25%, 45% { transform: translateX(-100%); }
  50%, 70% { transform: translateX(-200%); }
  75%, 95% { transform: translateX(-300%); }
  100% { transform: translateX(0%); }
}

/* Flip Cards */
.card-container {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  margin: 4rem auto;
  max-width: 1200px;
}

.flip-card {
  width: 250px;
  height: 300px;
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
  background: #CFE6F7;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #1f2937;
  padding: 1rem;
}

.flip-front h3 {
  margin-bottom: 0.5rem;
  font-size: 1.3rem;
}

.flip-front img {
  width: 100%;
  height: 70%;
  object-fit: cover;
  border-radius: 10px;
  margin-top: 0.5rem;
}

.flip-back {
  background: #D2F5E3;
  color: #4b5563;
  transform: rotateY(180deg);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  text-align: center;
  font-size: 1rem;
}

/* Texto horizontal animado */
.scrolling-container {
  width: 100%;
  overflow: hidden;
  background: linear-gradient(to right, #FFE6BB, #FCDCE1);
  border-top: 2px solid #FBCFE8;
  border-bottom: 2px solid #FBCFE8;
  padding: 1rem 0;
  position: relative;
}

.scrolling-text {
  display: inline-block;
  white-space: nowrap;
  animation: scroll-left 60s linear infinite;
  color: #3b3b3b;
  font-size: 1.1rem;
  padding-left: 100%;
}

@keyframes scroll-left {
  0% { transform: translateX(0%); }
  100% { transform: translateX(-100%); }
}

.scrolling-container:hover .scrolling-text {
  animation-play-state: paused;
}
</style>
