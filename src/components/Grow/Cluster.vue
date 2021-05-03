<template>
  <div
    :id="elementId"
    class="leaf-cluster absolute z-20 cursor-pointer origin-bottom"
    :style="containerStyle"
    @dblclick="
      activateEntity(allowSelection, flowerOrLeafCluster, clusterData.id)
    "
  >
    <div v-if="flowerOrLeafCluster == 'flowers'" :style="flowerCenterStyle" />
    <petal-leaf
      v-for="child in childList"
      :key="childGrowDataKey + '-' + child"
      :petalsOrLeaves="childGrowDataKey"
      :growData="getEntity(childGrowDataKey, child)"
      :allowSelection="allowSelection"
      :clusterActive="clusterActive"
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
  @Prop({ required: true }) clusterData!: GrowLeafCluster | GrowFlower
  @Prop({ default: false }) allowSelection!: boolean

  public defaultBg = "transparent"
  public highlight = false
  public showFlowerCenter = false

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
      return (this.clusterData as GrowFlower).petals
    }
    return (this.clusterData as GrowLeafCluster).leaves
  }

  public get elementId() {
    if (this.flowerOrLeafCluster == "flowers") {
      return "flowers-" + this.clusterData.id
    }
    return "leaf-cluster-" + this.clusterData.id
  }

  public recalcSize(newHeight: number) {
    // when one leaf/petal changes size, need to adjust container size for proper alignment
    const newProps = {
      width: newHeight,
      height: newHeight,
    }
    grow.mergeEntity({
      dataKey: this.flowerOrLeafCluster,
      id: this.clusterData.id,
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
        x: this.clusterData.position.x - this.clusterData.width / 2,
        y: this.clusterData.position.y + this.clusterData.offSet.top,
      }
    } else {
      position = {
        x: this.clusterData.position.x - this.clusterData.width + 5,
        y:
          this.clusterData.position.y -
          this.clusterData.height / 2 +
          this.clusterData.offSet.top +
          5,
      }
    }

    const styleData = {
      rotation: this.clusterData.rotation,
      position,
      height: this.clusterData.height,
      width: this.clusterData.width,
      zIndex: this.clusterData.zIndex,
      transistionSpeed: this.clusterData.transitionSpeed,
    }
    return this.entityStyle(styleData, true)
  }

  public get flowerCenterStyle() {
    return {
      background: (this.clusterData as GrowFlower).color,
      "border-radius": "100%",
      height: "10px",
      width: "10px",
      position: "absolute",
      top: `calc(${this.clusterData.height - 10}px/2 - 3px)`,
      left: `calc(${this.clusterData.width - 10}px/2 - 3px)`,
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
      }, this.clusterData.order * 300)
    }
  }

  public get clusterActive() {
    if (!this.activeEntity) {
      return false
    }
    // self active
    if (
      grow.activeEntityType == this.flowerOrLeafCluster &&
      this.activeEntity.id == this.clusterData.id
    ) {
      return true
    }
    // children active
    if (this.childGrowDataKey == "leaves") {
      return (
        grow.activeEntityType == "leaves" &&
        (this.clusterData as GrowLeafCluster).leaves.indexOf(
          this.activeEntity.id
        ) != -1
      )
    }
    if (this.childGrowDataKey == "petals") {
      return (
        grow.activeEntityType == "petals" &&
        (this.clusterData as GrowFlower).petals.indexOf(this.activeEntity.id) !=
          -1
      )
    }
    return false
  }

  @Watch("allowSelection")
  public plantHighlight(active: boolean) {
    if (active) {
      this.toggleShowFlowerCenter()
      this.toggleHighlight()
    }
  }

  @Watch("clusterActive")
  public clusterHighlight(active: boolean) {
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
