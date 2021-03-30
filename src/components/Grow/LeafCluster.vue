<template>
  <!-- TODO: add utilities for transform-origin -->
  <!-- TODO/NOTE : having top part of leaf positioned above container, w/ transform origin right, had cool effect -->
  <div class="leaf-cluster absolute bg-blue-400" :style="containerStyle">
    <div
      class="absolute"
      v-for="(leaf, index) in leafClusterData.leaves"
      :key="makeKey('leaf-cluster', entityId, index)"
      :style="styleObj(leaf)"
      style="transform-origin: bottom"
    >
      <shape
        v-for="(shape, index) in leaf.shapes"
        :key="makeKey('leaf', entityId, index)"
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
  // only using entityId to generate unique keys on v-for over leaves
  @Prop() entityId!: number

  mounted() {
    // TODO: the public is unnecessary right?
    if (!this.leafClusterData) {
      // TODO: global errors for missing required props
      throw console.error("missing branch prop!")
    }
  }

  public get containerStyle() {
    // rotation, positioning, and dimensions of rectangle containing the leaves
    // const growData = {
    //   rotation: this.leafClusterData.rotation,
    //   position: {
    //     y: top,
    //     x: left
    //   },
    //   height,
    //   width,
    //   // temp
    //   zIndex: 10
    // }
    // return this.styleObj(growData)
    const tilt =
      this.leafClusterData.rotation.z > 0
        ? 90 + this.leafClusterData.rotation.z
        : 90 + this.leafClusterData.rotation.z
    const growData = {
      rotation: {
        x: 0,
        y: 0,
        z: tilt,
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

    return this.styleObj(growData)
  }
}
</script>

<style scoped>
.branch {
  border: 1px solid orange;
}
</style>
