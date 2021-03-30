<template>
  <div class="branch absolute" :style="containerStyle">
    <div
      class="absolute bg-black z-10"
      style="transform-origin: bottom center"
      :style="styleObj(branchData)"
    />
  </div>
</template>

<script lang="ts">
import GrowMixin from "@/mixins/GrowMixin.vue"
import { GrowBranch } from "@/store/interfaces"
import { Prop } from "vue-property-decorator"
import Component from "vue-class-component"
import { NO_ROTATION } from "@/fixtures/Grow/Defaults"

@Component({})
export default class Branch extends GrowMixin {
  @Prop() branchData!: GrowBranch

  mounted() {
    // TODO: the public is unnecessary right?
    if (!this.branchData) {
      // TODO: global errors for missing required props
      throw console.error("missing branch prop!")
    }
  }

  public get containerStyle() {
    // height & width of a rectangle containing the rotated branch

    const top = this.branchData.startPoint.y
    const height =
      this.branchData.endPoint.y -
      this.branchData.startPoint.y +
      this.branchData.offSet.top

    // x endPoint can be negative/before start point if branch is rotated negatively
    const bigX = Math.max(
      this.branchData.endPoint.x,
      this.branchData.startPoint.x
    )
    const smallX = Math.min(
      this.branchData.endPoint.x,
      this.branchData.startPoint.x
    )
    const width = bigX - smallX + this.branchData.offSet.left / 2
    const left = smallX

    const growData = {
      rotation: NO_ROTATION(),
      position: {
        y: top,
        x: left
      },
      height,
      width
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
