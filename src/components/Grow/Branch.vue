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
import { GrowBasis, GrowBranch, Coordinate } from "@/store/interfaces"
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
    const bigY = Math.max(
      this.branchData.endPoint.y,
      this.branchData.startPoint.y
    )
    const smallY = Math.min(
      this.branchData.endPoint.y,
      this.branchData.startPoint.y
    )
    const bigX = Math.max(
      Math.abs(this.branchData.endPoint.x),
      Math.abs(this.branchData.startPoint.x)
    )
    const smallX = Math.min(
      Math.abs(this.branchData.endPoint.x),
      Math.abs(this.branchData.startPoint.x)
    )

    // console.log('x start', this.branchData.startPoint.x, 'x end', this.branchData.endPoint.x)
    console.log(
      "y start",
      this.branchData.startPoint.y,
      "y end",
      this.branchData.endPoint.y
    )
    const height = bigY - smallY + this.branchData.offSet.top
    // + this.branchData.width
    const width = bigX - smallX + this.branchData.offSet.left / 2
    // + this.branchData.width
    console.log("dims", height, width, this.branchData.parent)
    const top = -height - this.branchData.startPoint.y
    // endPoint can be negative/before start point if branch is rotated negatively
    const left = Math.min(
      this.branchData.endPoint.x,
      this.branchData.startPoint.x
    )

    const growData = {
      rotation: NO_ROTATION(),
      position: {
        y: top,
        x: left
      },
      height,
      width
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
