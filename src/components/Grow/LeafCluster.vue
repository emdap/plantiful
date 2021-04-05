<template>
  <!-- NOTE : bottom right transform origin has cool spiral effect, use for flowers -->
  <div
    :id="'leaf-cluster-' + leafClusterData.id"
    class="leaf-cluster absolute z-20 cursor-pointer"
    :style="containerStyle"
    @dblclick="activateEntity(plantActive, 'leafClusters', leafClusterData.id)"
  >
    <leaf
      v-for="leaf in leafClusterData.leaves"
      :key="'leaf-' + leaf"
      :leafData="getEntity('leaves', leaf)"
      :plantActive="plantActive"
      :clusterActive="clusterActive"
    />
    {{ clusterActive }}
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { GrowLeafCluster } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Leaf from "@/components/Grow/Leaf.vue"
import Component from "vue-class-component"

@Component({
  components: {
    Leaf
  }
})
export default class LeafCluster extends GrowMixin {
  @Prop({ required: true }) leafClusterData!: GrowLeafCluster
  @Prop({ default: false }) plantActive!: boolean

  public defaultBg = "transparent"
  public highlight = false

  public get containerStyle() {
    const styleData = {
      rotation: {
        x: 0,
        y: 0,
        z: this.leafClusterData.rotation.z,
        translate: 0
      },
      position: {
        x: this.leafClusterData.position.x - this.leafClusterData.height / 2,
        y:
          this.leafClusterData.position.y -
          this.leafClusterData.height / 2 +
          this.leafClusterData.offSet.top
      },
      height: this.leafClusterData.height,
      width: 75
    }
    return this.styleObj(styleData, true)
  }

  public get clusterActive() {
    return (
      grow.activeEntityType == "leafClusters" &&
      this.activeEntity?.id == this.leafClusterData.id
    )
  }

  @Watch("plantActive")
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
