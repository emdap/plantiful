<template>
  <div
    :id="entityData.id"
    :style="styleObj(entityData)"
    class="absolute"
    :class="{ 'outline-black': isActive }"
    @dblclick="setActive()"
  >
    <branch
      v-for="(branch, index) in entityData.branches"
      :key="makeGrowId('branch', entityData.id, index)"
      :branchData="branch"
    />
    <leaf-cluster
      v-for="(leafCluster, index) in entityData.leafClusters"
      :key="makeGrowId('leaf-cluster', entityData.id, index)"
      :leafClusterData="leafCluster"
    />
  </div>
</template>

<script lang="ts">
import { GrowEntity } from "@/store/interfaces"
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
export default class Entity extends GrowMixin {
  @Prop() entityData!: GrowEntity

  public mounted() {
    if (!this.entityData) {
      throw console.error("no entity provided!")
    }
  }

  public get isActive(): boolean {
    return grow.activeEntity?.id == this.entityData.id
  }

  public setActive() {
    if (this.isActive) {
      grow.removeActiveEntity()
    } else {
      grow.setActiveEntity(this.entityData)
    }
  }
}
</script>
