<template>
  <div
    :id="'branch-' + branchData.id"
    class="absolute cursor-pointer"
    :style="containerStyle"
    @dblclick="activateEntity(allowSelection, 'branches', branchData.id)"
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
  @Prop({ required: true }) branchData!: GrowBranch

  public entityType = "branches" as "branches"
  public entityId = this.branchData.id

  public defaultBg = "black"
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
      transitionSpeed: this.selfActive ? 0 : this.branchData.transitionSpeed,
    }

    return this.entityStyle(styleData, true)
  }

  public get branchStyle() {
    const styleData = {
      ...this.branchData,
      height: this.branchData.branchHeight,
      width: this.branchData.branchWidth,
      position: this.branchData.branchPosition,
      zIndex: 10,
    }
    return this.entityStyle(styleData)
  }
}
</script>
