<template>
  <div
    :id="'branch-' + branchData.id"
    class="absolute cursor-pointer"
    :style="containerStyle"
  >
    <div
      :class="['absolute z-10', backgroundClass(defaultBg, highlight)]"
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

  public defaultBg = "black"
  public highlight = false

  public mounted() {
    if (!this.branchData) {
      // TODO: global errors for missing required props
      throw console.error("missing branch prop!")
    }
  }

  public get containerStyle() {
    const styleData = {
      rotation: NO_ROTATION(),
      position: this.branchData.position,
      height: this.branchData.height,
      width: this.branchData.width
    }
    return this.styleObj(styleData, true)
  }

  public get branchStyle() {
    const styleData = {
      ...this.branchData,
      height: this.branchData.branchHeight,
      width: this.branchData.branchWidth,
      position: this.branchData.branchPosition
    }
    return this.styleObj(styleData)
  }

  @Watch("plantActive")
  public toggleHighlight(active: boolean) {
    if (active) {
      this.highlight = true
      setTimeout(() => {
        this.highlight = false
      }, this.highlightDuration)
    }
  }
}
</script>
