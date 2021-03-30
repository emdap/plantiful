<template>
  <div class="branch absolute" :style="containerStyle">
    <div
      class="absolute bg-black"
      style="transform-origin: bottom center"
      :style="styleObj(branchData)"
    />
  </div>
</template>

<script lang="ts">
import GrowMixin from "@/mixins/GrowMixin.vue"
import { GrowBasis, GrowBranch, GrowPosition } from "@/store/interfaces"
import { Prop } from "vue-property-decorator"
import Component from "vue-class-component"
import { noRotation } from "@/fixtures/Grow/Defaults"

@Component({})
export default class Branch extends GrowMixin {
  @Prop() branchData!: GrowBranch

  mounted() {
    // TODO: the public is unnecessary right?
    if (!this.branchData) {
      // TODO: global errors for missing required props
      throw console.error("missing branch prop!")
    }
    console.log(this.branchData)
  }

  public get containerStyle() {
    // height & width of a rectangle containing the rotated branch
    const height =
      Math.abs(this.branchData.endPoint.y - this.branchData.startPoint.y) +
      this.branchData.offSet.top
    // + this.branchData.width
    const width =
      Math.abs(this.branchData.endPoint.x - this.branchData.startPoint.x) +
      this.branchData.offSet.left / 2
    // + this.branchData.width

    const top = this.branchData.endPoint.y
    const left = Math.min(
      this.branchData.endPoint.x,
      this.branchData.startPoint.x
    )

    const growData = {
      rotation: noRotation(),
      position: {
        top,
        left
      },
      height,
      width,
      // temp
      zIndex: 10
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
