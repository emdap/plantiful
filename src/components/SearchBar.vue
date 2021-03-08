<template>
  <div id="search-bar">
    <input
      id="search-input"
      class="p-2 w-5/12 text-center"
      type="text"
      v-model="searchQuery"
      placeholder="Enter search terms (optional)"
      @keyup.enter="plantSearch(1)"
    />
    <button
      :disabled="!searchUpdated"
      @click="plantSearch(1)"
      class="btn-primary"
    >
      Search plants
    </button>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"

@Component({})
export default class SearchBar extends Vue {}
</script>

<style scoped></style>
