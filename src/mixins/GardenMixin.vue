<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import { grid } from "@/mixins/GridMixin.vue"
import GardenModule from "@/store/modules/garden"
import { gardenMessages } from "@/fixtures/Messages"

export const garden = getModule(GardenModule)

@Component({})
export default class GardenMixin extends Vue {
  // TODO: revisit these fetching functions
  public toggleActivePlant(forceShow?: boolean) {
    if (grid.getWidget("active-plant").open != forceShow) {
      grid.toggleWidgetName({ name: "active-plant", forceShow })
    }
  }

  public get gardenMessages() {
    return gardenMessages
  }

  public get plantList() {
    return garden.plantList
  }

  public get pageLinks() {
    return garden.pageLinks
  }

  public get activePlant() {
    return garden.activePlant
  }

  public get currentPage() {
    return garden.currentPage
  }

  public get lastPage() {
    return garden.lastPage
  }

  public get plantListLoading() {
    return garden.loading.plantList
  }

  public get plantLoading() {
    return garden.loading.plant
  }
}
</script>
