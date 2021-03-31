<template>
  <div
    :id="branchData.id"
    class="absolute cursor-pointer"
    :style="containerStyle"
  >
    <div
      :class="['absolute z-10', branchColor]"
      style="transform-origin: bottom center"
      :style="branchStyle"
    />
  </div>
</template>

<script lang="ts">
import GrowMixin from "@/mixins/GrowMixin.vue"
import { GrowBranch } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Component from "vue-class-component"
import { NO_ROTATION } from "@/fixtures/Grow/Defaults"

@Component({})
export default class Branch extends GrowMixin {
  @Prop() branchData!: GrowBranch
  @Prop({ default: false }) plantActive!: boolean

  public defaultColor = "bg-black"
  public branchColor = this.defaultColor

  mounted() {
    // TODO: the public is unnecessary right?
    if (!this.branchData) {
      // TODO: global errors for missing required props
      throw console.error("missing branch prop!")
    }
    this.toggleHighlight()
  }

  public get containerStyle() {
    const growData = {
      rotation: NO_ROTATION(),
      position: this.branchData.position,
      height: this.branchData.height,
      width: this.branchData.width
    }
    return this.styleObj(growData, true)
  }

  public get branchStyle() {
    const growData = {
      ...this.branchData,
      height: this.branchData.branchHeight,
      width: this.branchData.branchWidth,
      position: this.branchData.branchPosition
    }
    return this.styleObj(growData)
  }

  @Watch("plantActive")
  public highlightBranch() {
    this.toggleHighlight()
  }

  public toggleHighlight() {
    if (this.plantActive) {
      this.branchColor = "bg-" + this.highlightColor
      setTimeout(() => {
        this.branchColor = this.defaultColor
      }, 1000)
    }
  }
}
</script>
