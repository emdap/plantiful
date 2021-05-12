<template>
  <div
    :id="'branch-' + growData.id"
    class="absolute cursor-pointer"
    :style="containerStyle"
    @dblclick="activateEntity(allowSelection, 'branches', growData.id)"
  >
    <div
      :class="['absolute z-10', backgroundClass]"
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
import { NO_ROTATION } from "@/fixtures/Defaults"

@Component({})
export default class Branch extends GrowMixin {
  @Prop({ required: true }) growData!: GrowBranch

  public entityType = "branches" as "branches"
  public entityId = this.growData.id

  public defaultBg = "black"
  public startPoint = { ...this.growData.startPoint }

  @Watch("startPoint")
  public updateEndpoint(newStart: Position, oldStart: Position) {
    // need to recompute endPoint so that any branches/leaf clusters referencing it get their startPoint updated
    if (
      !isNaN(newStart.x) &&
      !isNaN(newStart.y) &&
      (oldStart.y != newStart.y || oldStart.x != newStart.x)
    ) {
      grow.updateBranchEndPoint(this.growData)
    }
  }

  public get containerStyle() {
    // trigger watcher -- startPoint references same object as another branch's endPoint
    this.startPoint = { ...this.growData.startPoint }

    const styleData = {
      rotation: NO_ROTATION(),
      position: this.growData.position,
      height: this.growData.height,
      width: this.growData.width,
      zIndex: this.growData.zIndex,
      transitionSpeed: this.selfActive ? 0 : this.growData.transitionSpeed,
    }

    return this.entityStyle(styleData, true)
  }

  public get branchStyle() {
    const styleData = {
      ...this.growData,
      height: this.growData.branchHeight,
      width: this.growData.branchWidth,
      position: this.growData.branchPosition,
      zIndex: 10,
    }
    return this.entityStyle(styleData)
  }
}
</script>
