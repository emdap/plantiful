<template>
  <div>
    <template v-if="plantList.length || loadingList">
      <div
        id="page-nav"
        :class="loadingList ? 'text-gray-200' : 'text-green-800'"
      >
        <h3>Page {{ currentPage }} of {{ lastPage }}</h3>
        <span class="text-sm">
          <button :disabled="currentPage == 1" @click="iteratePage('first')">
            First page
          </button>
          <button :disabled="currentPage == 1" @click="iteratePage('prev')">
            Previous page
          </button>
          <button
            :disabled="currentPage == lastPage"
            @click="iteratePage('next')"
          >
            Next page
          </button>
          <button
            :disabled="currentPage == lastPage"
            @click="iteratePage('last')"
          >
            Last page
          </button>
        </span>
      </div>
      <span v-if="loadingList">
        Loading ...
      </span>
      <div v-else id="search-results" class="flex-grow overflow-auto">
        <div
          v-for="(plant, index) in plantList"
          :key="`plant ${index}`"
          @click="selectPlant(plant.id)"
          class="cursor-pointer hover:bg-green-200"
        >
          <h3>{{ plant.common_name }}</h3>
          <h5>{{ plant.scientific_name }}</h5>
        </div>
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"

@Component({})
export default class PlantList extends Vue {}
</script>

<style scoped></style>
