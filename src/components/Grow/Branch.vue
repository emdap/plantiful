<template>
  <div
    :id="'branch-' + branchData.id"
    class="absolute cursor-pointer"
    :style="containerStyle"
    @dblclick="activateEntity(allowSelection, 'branches', branchData.id)"
  >
    {{ branchData.position.x }}
    <div
      :class="['absolute z-10', backgroundClass(defaultBg, highlight)]"
      style="transform-origin: bottom center"
      :style="branchStyle"
    />
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { GrowBranch } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Component from "vue-class-component"
import { NO_ROTATION } from "@/fixtures/Grow/Defaults"

@Component({})
export default class Branch extends GrowMixin {
  @Prop({ required: true }) branchData!: GrowBranch
  @Prop({ default: false }) allowSelection!: boolean

  public defaultBg = "black"
  public highlight = false

  public get containerStyle() {
    // need to keep position computed so that it updates when user controls a branch
    // console.log(this.branchData.endPoint.x, this.branchData.startPoint.x)
    const position = {
      y: this.branchData.startPoint.y,
      x: Math.min(this.branchData.endPoint.x, this.branchData.startPoint.x)
    }
    const styleData = {
      rotation: NO_ROTATION(),
      position,
      height: this.branchData.height,
      width: this.branchData.width,
      zIndex: this.branchData.zIndex
    }
    if (this.branchData.id == 2) {
      console.log(
        position.x,
        position.y,
        "x's",
        this.branchData.endPoint.x,
        this.branchData.startPoint.x
      )
      console.log(this.getEntity("branches", 1).position.x)
    }
    return this.styleObj(styleData, true)
  }

  public get branchStyle() {
    const styleData = {
      ...this.branchData,
      height: this.branchData.branchHeight,
      width: this.branchData.branchWidth,
      position: this.branchData.branchPosition,
      zIndex: 10
    }
    return this.styleObj(styleData)
  }

  public get branchActive() {
    return (
      grow.activeEntityType == "branches" &&
      this.activeEntity?.id == this.branchData.id
    )
  }

  @Watch("allowSelection")
  public plantHighlight(active: boolean) {
    if (active) {
      this.toggleHighlight()
    }
  }

  @Watch("branchActive")
  public branchHighlightht(active: boolean) {
    if (active) {
      this.toggleHighlight()
    }
  }

  public toggleHighlight() {
    this.highlight = true
    setTimeout(() => {
      this.highlight = false
    }, this.highlightDuration)
  }
}
</script>
