<template>
  <div
    class="absolute"
    :id="'plant-' + plantData.id"
    @dblclick="setActive"
    :style="styleGeneral"
  >
    <span
      v-if="plantData.showName"
      :class="textClass"
      :style="`margin-left: -${plantData.width}px; width: ${plantData.width}px`"
      class="whitespace-nowrap text-center transition-all duration-75 font-semibold cursor-pointer"
      @dblclick.self="setActiveEntity"
    >
      <!-- @mousedown.prevent="" -->
      {{ plantData.name }}
    </span>
    <div :style="styleRotation" class="absolute">
      <branch
        v-for="branch in plantData.branches"
        :key="'branch-' + branch"
        :branchData="getEntity('branches', branch)"
        :allowSelection="plantActive"
      />
      <leaf-cluster
        v-for="leafCluster in plantData.leafClusters"
        :key="'-leaf-cluster-' + leafCluster"
        :leafClusterData="getEntity('leafClusters', leafCluster)"
        :allowSelection="plantActive"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { GrowPlant } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop, Watch } from "vue-property-decorator"
import Shape from "@/components/Grow/Shape.vue"
import Branch from "@/components/Grow/Branch.vue"
import LeafCluster from "@/components/Grow/LeafCluster.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { NO_POSITION, NO_ROTATION } from "@/fixtures/Grow/Defaults"

@Component({
  components: {
    Shape,
    Branch,
    LeafCluster
  }
})
export default class Plant extends GrowMixin {
  @Prop({ required: true }) plantData!: GrowPlant

  public defaultColor = "text-black"
  public textClass = this.defaultColor
  public subHighlightBg = "green-500"

  public mounted() {
    if (this.plantIsActiveEntity) {
      this.textClass = this.highlightText
    } else if (this.plantActive) {
      this.textClass = this.subHighlightText
    }
  }

  public get plantIsActiveEntity(): boolean {
    return (
      grow.activeEntityType == "plants" &&
      grow.activeEntity?.id == this.plantData.id
    )
  }

  public get plantActive(): boolean {
    // return grow.activeEntityType == "plants" &&
    return grow.activeGrowPlant?.id == this.plantData.id
  }

  public setActive(e: MouseEvent) {
    if (!this.plantActive) {
      grow.setActivePlant(this.plantData.id)
      e.stopPropagation()
    }
  }

  public setActiveEntity(e: MouseEvent) {
    if (this.plantActive && grow.activeEntityType != "plants") {
      grow.setActiveEntity({ dataKey: "plants", id: this.plantData.id })
      e.stopPropagation()
    } else if (!this.plantActive) {
      this.setActive(e)
    }
  }

  public get highlightText() {
    return "text-" + this.highlightBg + " font-semibold"
  }

  // for when plant is active, but one of its children is selected
  public get subHighlightText() {
    return "text-" + this.subHighlightBg + " font-semibold"
  }

  @Watch("plantIsActiveEntity")
  public highlightPlant() {
    if (this.plantIsActiveEntity) {
      this.textClass = this.highlightText
    } else if (this.plantActive) {
      this.textClass = this.subHighlightText
    } else {
      this.textClass = this.defaultColor
    }
  }

  public get styleGeneral() {
    const styleData = {
      ...this.plantData,
      height: 0, // branches grow out of top of plant barrier, don't want it selectable below name
      rotation: NO_ROTATION()
    }
    return this.styleObj(styleData)
  }

  public get styleRotation() {
    const styleData = {
      position: NO_POSITION(),
      rotation: this.plantData.rotation,
      height: 0,
      width: 0,
      zIndex: 10
    }

    return this.styleObj(styleData)
  }
}
</script>
