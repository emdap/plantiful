<template>
  <!-- <adjustable :widgetData="widget"> -->
  <div>
    <search-bar class="p-4" />
    <div class="relative">
      <loading
        class="absolute text-center mt-8 h-full w-full"
        v-if="plantListLoading"
        :loadingText="gardenMessages.searchBar.loading"
      />
    </div>
    <template v-if="plantList.length">
      <h3 :class="plantListLoading ? 'text-gray-300' : 'text-green-800'">
        Page {{ currentPage }} of {{ lastPage }}
      </h3>
      <plant-list
        @show-active="showActivePlant"
        @grow-plant="$emit('grow-plant', $event)"
        class="p-4"
      />
      <page-nav
        :class="plantListLoading ? 'text-gray-300' : 'text-green-800'"
      />
    </template>
    <!-- </adjustable> -->
  </div>
  <!-- <adjustable
      v-if="plantList.length || plantLoading"
      :widgetData="activePlantWidget"
    >
      <active-plant>
        <button class="btn-primary" @click="$emit('grow-plant', $event)">
          Grow
        </button>
      </active-plant>
    </adjustable> -->
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import Adjustable from "@/components/Adjustable.vue"
import Loading from "@/components/Loading.vue"
import SearchBar from "@/components/SearchBar.vue"
import PlantList from "@/components/PlantList.vue"
import PageNav from "@/components/PageNav.vue"
import ActivePlant from "@/components/ActivePlant.vue"
import GardenMixin from "@/mixins/GardenMixin.vue"
import ContainerMixin, { container } from "@/mixins/ContainerMixin.vue"
import { Widget, WidgetCopy } from "@/store/interfaces"
import { Prop } from "vue-property-decorator"

@Component({
  components: {
    Adjustable,
    Loading,
    SearchBar,
    PlantList,
    PageNav,
    ActivePlant
  }
})
export default class PlantSearch extends mixins(GardenMixin, ContainerMixin) {
  // @Prop({ default: 0 }) plantSearchSize!: number
  // @Prop({ required: true }) widget!: WidgetCopy
  // @Prop({ required: true }) activePlantWidget!: WidgetCopy
  // public mounted() {
  //   console.log(this.widget)
  // }
  // public showActivePlant() {
  //   if (!this.activePlantWidget.open) {
  //     container.toggleWidget(this.activePlantWidget)
  //   }
  // }
}
</script>
