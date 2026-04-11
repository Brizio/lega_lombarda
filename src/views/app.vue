
<!-- src/views/MainView.vue -->
<template>
  <div>
    <Card 
      v-for="card in cards" 
      :key="card.city" 
      :title="card.city" 
      :recruitmentOptions="card.recruitmentOptions" 
      :event="card.event" 
      :image="card.image" 
    />
  </div>
</template>

<script>
import { defineComponent } from 'vue';
import Card from '../components/Card.vue';

const cards = [
  { city: "Ancona", recruitmentOptions: ["Reclutamento semplice", "Reclutamento potenziato"], event: "Evento 1", image: "https://raw.githubusercontent.com/massibull/Lega_Lombarda/main/src/assets/images/ancona.png" },
  
];

export default defineComponent({
  components: {
    Card,
  },
  data() {
    return {
      cards,
    };
  },
});
</script>

