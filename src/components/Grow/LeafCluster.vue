<template>
  <!-- TODO: add tailwind utilities for transform-origin -->
  <!-- TODO/NOTE : having top part of leaf positioned above container, w/ transform origin right, had cool effect -->
  <div class="leaf-cluster absolute z-20" :style="containerStyle">
    <div
      class="absolute"
      v-for="(leaf, index) in leafClusterData.leaves"
      :key="makeGrowId('leaf', leafClusterData.id, index)"
      :style="styleObj(leaf)"
      style="transform-origin: bottom"
    >
      <shape
        v-for="(shape, index) in leaf.shapes"
        :key="makeGrowId('shape', leafClusterData.id, index)"
        :growData="shape"
      />
    </div>
  </div>
</template>

<script lang="ts">
import GrowMixin from "@/mixins/GrowMixin.vue"
import { GrowLeafCluster } from "@/store/interfaces"
import { Prop } from "vue-property-decorator"
import Shape from "@/components/Grow/Shape.vue"
import Component from "vue-class-component"

@Component({
  components: {
    Shape
  }
})
export default class LeafCluster extends GrowMixin {
  @Prop() leafClusterData!: GrowLeafCluster

  mounted() {
    // TODO: the public is unnecessary right?
    if (!this.leafClusterData) {
      // TODO: global errors for missing required props
      throw console.error("missing branch prop!")
    }
  }

  public get containerStyle() {
    const growData = {
      rotation: {
        x: 0,
        y: 0,
        z: this.leafClusterData.rotation.z,
        translate: 0
      },
      position: {
        x: this.leafClusterData.position.x - this.leafClusterData.height / 2,
        y:
          this.leafClusterData.position.y -
          this.leafClusterData.height / 2 +
          this.leafClusterData.offSet.top
      },
      height: this.leafClusterData.height,
      width: 75
    }
    return this.styleObj(growData, true)
  }
}
</script>

<style scoped>
.branch {
  border: 1px solid orange;
}
</style>
