<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import GardenModule from "@/store/modules/garden"

export const garden = getModule(GardenModule)

@Component({})
export default class GardenMixin extends Vue {
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
