<template>
  <div id="plant-search">
    <widget initHeight="full" initWidth="41%">
      <search-bar />
      <loading
        v-if="plantListLoading"
        :loadingText="messages.searchBar.loading"
      />
      <template v-if="plantList.length">
        <page-nav />
        <plant-list />
      </template>
    </widget>
    <widget v-if="plantList.length || loadingPlant" initWidth="59%">
      <loading
        v-if="loadingPlant"
        :loadingText="messages.activePlant.loading"
      />
      <active-plant v-else />
    </widget>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import Widget from "@/components/Widget.vue"
import Loading from "@/components/Loading.vue"
import SearchBar from "@/components/SearchBar.vue"
import PlantList from "@/components/PlantList.vue"
import PageNav from "@/components/PageNav.vue"
import ActivePlant from "@/components/ActivePlant.vue"
import messages from "@/fixtures/Messages"
import GardenMixin from "@/mixins/GardenMixin.vue"

@Component({
  components: {
    Widget,
    Loading,
    SearchBar,
    PlantList,
    PageNav,
    ActivePlant
  }
})
export default class PlantSearch extends GardenMixin {
  public get messages() {
    return messages
  }
}
</script>

<style scoped></style>
