<template>
  <div
    :id="elementId"
    class="leaf-cluster absolute z-20 cursor-pointer origin-bottom"
    :style="containerStyle"
    @dblclick="activateEntity(allowSelection, flowerOrLeafCluster, growData.id)"
  >
    <div v-if="flowerOrLeafCluster == 'flowers'" :style="flowerCenterStyle" />
    <petal-leaf
      v-for="child in childList"
      :key="childGrowDataKey + '-' + child"
      :petalsOrLeaves="childGrowDataKey"
      :growData="getEntity(childGrowDataKey, child)"
      :allowSelection="allowSelection"
      :clusterActive="clusterActive"
      :clusterHighlight="clusterHighlight || plantHighlight"
      @height-update="recalcSize"
    />
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { GrowFlower, GrowLeafCluster, Position } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import PetalLeaf from "@/components/Grow/PetalLeaf.vue"
import Component from "vue-class-component"

@Component({
  components: {
    PetalLeaf,
  },
})
export default class LeafCluster extends GrowMixin {
  @Prop({ required: true }) flowerOrLeafCluster!: "leafClusters" | "flowers"
  @Prop({ required: true }) growData!: GrowLeafCluster | GrowFlower
  @Prop({ default: false }) allowSelection!: boolean

  public showFlowerCenter = false
  public entityType = this.flowerOrLeafCluster
  public entityId = this.growData.id

  public mounted() {
    this.toggleShowFlowerCenter()
  }

  public get childGrowDataKey() {
    if (this.flowerOrLeafCluster == "flowers") {
      return "petals"
    }
    return "leaves"
  }

  public get childList(): number[] {
    if (this.childGrowDataKey == "petals") {
      return (this.growData as GrowFlower).petals
    }
    return (this.growData as GrowLeafCluster).leaves
  }

  public get elementId() {
    if (this.flowerOrLeafCluster == "flowers") {
      return "flowers-" + this.growData.id
    }
    return "leaf-cluster-" + this.growData.id
  }

  public recalcSize(newHeight: number) {
    // when one leaf/petal changes size, need to adjust container size for proper alignment
    const newProps = {
      width: newHeight,
      height: newHeight,
    }
    grow.mergeEntity({
      dataKey: this.flowerOrLeafCluster,
      id: this.growData.id,
      mergeData: newProps,
    })
    // also need to update other leaves/petals in cluster to align with new cluster size
    for (const childId of this.childList) {
      const child = this.getEntity(this.childGrowDataKey, childId)
      const position = {
        position: {
          x: newHeight / 2 - child.width / 2,
          y: newHeight - child.height,
        },
      }
      grow.mergeEntity({
        dataKey: this.childGrowDataKey,
        id: childId,
        mergeData: position,
      })
    }
  }

  public get containerStyle() {
    let position!: Position
    if (this.flowerOrLeafCluster == "leafClusters") {
      position = {
        x: this.growData.position.x - this.growData.width / 2,
        y: this.growData.position.y + this.growData.offSet.top,
      }
    } else {
      position = {
        x: this.growData.position.x - this.growData.width + 5,
        y:
          this.growData.position.y -
          this.growData.height / 2 +
          this.growData.offSet.top +
          5,
      }
    }

    const styleData = {
      rotation: this.growData.rotation,
      position,
      height: this.growData.height,
      width: this.growData.width,
      zIndex: this.growData.zIndex,
      transistionSpeed: this.growData.transitionSpeed,
    }
    return this.entityStyle(styleData, true)
  }

  public get flowerCenterStyle() {
    return {
      background: (this.growData as GrowFlower).color,
      "border-radius": "100%",
      height: "10px",
      width: "10px",
      position: "absolute",
      top: `calc(${this.growData.height - 10}px/2 - 3px)`,
      left: `calc(${this.growData.width - 10}px/2 - 3px)`,
      opacity: this.showFlowerCenter ? 1 : 0,
      transition: "all 1s",
      zIndex: 20,
    }
  }

  public toggleShowFlowerCenter() {
    // don't want to show until animations are done
    this.showFlowerCenter = false
    if (this.flowerOrLeafCluster == "flowers") {
      setTimeout(() => {
        this.showFlowerCenter = true
      }, this.growData.order * 300)
    }
  }

  public get clusterActive() {
    if (!this.activeEntity) {
      return false
    }
    // self active
    if (
      grow.activeEntityType == this.flowerOrLeafCluster &&
      this.activeEntity.id == this.growData.id
    ) {
      return true
    }
    // children active
    if (this.childGrowDataKey == "leaves") {
      return (
        grow.activeEntityType == "leaves" &&
        (this.growData as GrowLeafCluster).leaves.indexOf(
          this.activeEntity.id
        ) != -1
      )
    }
    if (this.childGrowDataKey == "petals") {
      return (
        grow.activeEntityType == "petals" &&
        (this.growData as GrowFlower).petals.indexOf(this.activeEntity.id) != -1
      )
    }
    return false
  }

  public get clusterHighlight() {
    return (
      grow.highlightEntityType == this.entityType &&
      grow.highlightEntity == this.entityId
    )
  }

  @Watch("allowSelection")
  public toggleFlower(active: boolean) {
    if (active) {
      this.toggleShowFlowerCenter()
    }
  }
}
</script>
