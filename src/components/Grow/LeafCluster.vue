<template>
  <!-- NOTE : bottom right transform origin has cool spiral effect, use for flowers -->
  <div
    :id="'leaf-cluster-' + leafClusterData.id"
    class="leaf-cluster absolute z-20 cursor-pointer origin-bottom"
    :style="containerStyle"
    @dblclick="
      activateEntity(allowSelection, 'leafClusters', leafClusterData.id)
    "
  >
    <petal-leaf
      v-for="leaf in leafClusterData.leaves"
      petalsOrLeaves="leaves"
      :key="'leaf-' + leaf"
      :growData="getEntity('leaves', leaf)"
      :allowSelection="allowSelection"
      :clusterActive="clusterActive"
    />
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { GrowLeafCluster } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import PetalLeaf from "@/components/Grow/PetalLeaf.vue"
import Component from "vue-class-component"

@Component({
  components: {
    PetalLeaf
  }
})
export default class LeafCluster extends GrowMixin {
  @Prop({ required: true }) leafClusterData!: GrowLeafCluster
  @Prop({ default: false }) allowSelection!: boolean

  public defaultBg = "transparent"
  public highlight = false

  public get containerStyle() {
    const styleData = {
      rotation: this.leafClusterData.rotation,
      position: {
        x: this.leafClusterData.position.x - this.leafClusterData.height / 2,
        y:
          this.leafClusterData.position.y +
          // this.leafClusterData.height / 2 +
          this.leafClusterData.offSet.top
      },
      height: this.leafClusterData.height,
      width: 75,
      zIndex: this.leafClusterData.zIndex
    }
    return this.styleObj(styleData, true)
  }

  public get clusterActive() {
    if (!this.activeEntity) {
      return false
    }
    const clusterActive =
      grow.activeEntityType == "leafClusters" &&
      this.activeEntity.id == this.leafClusterData.id
    if (clusterActive) {
      return true
    }
    const clusterLeafActive =
      grow.activeEntityType == "leaves" &&
      this.leafClusterData.leaves.indexOf(this.activeEntity.id) != -1
    return clusterLeafActive
  }

  @Watch("allowSelection")
  public plantHighlight(active: boolean) {
    if (active) {
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
