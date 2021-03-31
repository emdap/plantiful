<template>
  <div
    :id="'plant-' + plantData.id"
    :style="styleObj(plantData)"
    class="absolute"
    :class="{ 'outline-black': isActive }"
    @dblclick="setActive()"
  >
    <branch
      v-for="branch in plantData.branches"
      :key="'branch-' + branch"
      :branchData="getEntity('branches', branch)"
    />
    <leaf-cluster
      v-for="leafCluster in plantData.leafClusters"
      :key="'-leaf-cluster-' + leafCluster"
      :leafClusterData="getEntity('leafClusters', leafCluster)"
    />
  </div>
</template>

<script lang="ts">
import { GrowPlant } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop } from "vue-property-decorator"
// import messages from "@/fixtures/Messages"
import Shape from "@/components/Grow/Shape.vue"
import Branch from "@/components/Grow/Branch.vue"
import LeafCluster from "@/components/Grow/LeafCluster.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"

@Component({
  components: {
    Shape,
    Branch,
    LeafCluster
  }
})
export default class Plant extends GrowMixin {
  @Prop() plantData!: GrowPlant

  public mounted() {
    if (!this.plantData) {
      throw console.error("no entity provided!")
    }
  }

  public get isActive(): boolean {
    return grow.activePlant?.id == this.plantData.id
  }

  public setActive() {
    if (this.isActive) {
      grow.removeActivePlant()
    } else {
      grow.setActivePlant(this.plantData.id)
    }
  }
}
</script>
