<template>
  <div
    :id="'branch-' + branchData.id"
    class="absolute cursor-pointer"
    :style="containerStyle"
    @dblclick="activateEntity(allowSelection, 'branches', branchData.id)"
  >
    <div
      :class="['absolute z-10', backgroundClass(defaultBg, highlight)]"
      style="transform-origin: bottom center"
      :style="branchStyle"
    />
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { GrowBranch, Position } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Component from "vue-class-component"
import { NO_ROTATION } from "@/fixtures/Grow/Defaults"

@Component({})
export default class Branch extends GrowMixin {
  @Prop({ required: true }) branchData!: GrowBranch
  @Prop({ default: false }) allowSelection!: boolean

  public defaultBg = "black"
  public highlight = false

  public startPoint = { ...this.branchData.startPoint }

  @Watch("startPoint")
  public updateEndpoint(newStart: Position, oldStart: Position) {
    // need to recompute endPoint so that any branches/leaf clusters referencing it get their startPoint updated
    if (
      !isNaN(newStart.x) &&
      !isNaN(newStart.y) &&
      (oldStart.y != newStart.y || oldStart.x != newStart.x)
    ) {
      grow.updateBranchEndPoint(this.branchData)
    }
  }

  public get containerStyle() {
    // trigger watcher -- startPoint references same object as another branch's endPoint
    this.startPoint = { ...this.branchData.startPoint }

    const styleData = {
      rotation: NO_ROTATION(),
      position: this.branchData.position,
      height: this.branchData.height,
      width: this.branchData.width,
      zIndex: this.branchData.zIndex,
      transitionSpeed: this.branchActive ? 0 : this.branchData.transitionSpeed
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
