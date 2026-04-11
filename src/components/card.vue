<template>
  <div class="card">
    <h3>{{ title }}</h3>
    <p>{{ description }}</p>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
  };
};
</script>

<style scoped>
.card {
  border: 1px solid #ccc;
  padding: 16px;
  border-radius: 4px;
  margin: 10px;
  background-color: #f9f9f9;
}
</style>
