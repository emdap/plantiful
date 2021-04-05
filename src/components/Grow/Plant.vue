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
      @mousedown.prevent=""
    >
      {{ plantData.name }}
    </span>
    <div :style="styleRotation" class="absolute">
      <branch
        v-for="branch in plantData.branches"
        :key="'branch-' + branch"
        :branchData="getEntity('branches', branch)"
        :plantActive="isActive"
      />
      <leaf-cluster
        v-for="leafCluster in plantData.leafClusters"
        :key="'-leaf-cluster-' + leafCluster"
        :leafClusterData="getEntity('leafClusters', leafCluster)"
        :plantActive="isActive"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { GrowPlant } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop, Watch } from "vue-property-decorator"
// import messages from "@/fixtures/Messages"
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

  public mounted() {
    if (this.isActive) {
      this.textClass = this.highlightText
    }
  }

  public get isActive(): boolean {
    return grow.activeGrowPlant?.id == this.plantData.id
  }

  public setActive(e: MouseEvent) {
    if (!this.isActive) {
      grow.setActivePlant(this.plantData.id)
      e.stopPropagation()
    }
  }

  public get highlightText() {
    return "text-" + this.highlightBg + " font-semibold"
  }

  @Watch("isActive")
  public highlightPlant() {
    if (this.isActive) {
      this.textClass = this.highlightText
    } else {
      this.textClass = this.defaultColor
    }
  }

  public get styleGeneral() {
    const styleData = {
      ...this.plantData,
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
