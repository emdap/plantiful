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
      class="whitespace-nowrap text-center transition-colors  duration-75 font-semibold cursor-pointer select-none"
      @dblclick.self="setActiveEntity"
    >
      {{ plantData.name }}
    </span>
    <div :style="styleRotation" class="absolute">
      <branch
        v-for="branch in plantData.branches"
        :key="'branch-' + branch"
        :branchData="getEntity('branches', branch)"
        :allowSelection="plantActive"
        :plantHighlight="selfHighlight"
      />
      <template
        v-for="clusterType in ['leafClusters', 'flowers']"
        :index="clusterType"
      >
        <cluster
          v-for="cluster in plantData[clusterType]"
          :key="clusterKey(clusterType) + cluster"
          :flowerOrLeafCluster="clusterType"
          :clusterData="getEntity(clusterType, cluster)"
          :allowSelection="plantActive"
          :plantHighlight="selfHighlight"
        />
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { GrowDataKey, GrowPlant } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop, Watch } from "vue-property-decorator"
import Shape from "@/components/Grow/Shape.vue"
import Branch from "@/components/Grow/Branch.vue"
import Cluster from "@/components/Grow/Cluster.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { NO_POSITION, NO_ROTATION } from "@/fixtures/Defaults"

@Component({
  components: {
    Shape,
    Branch,
    Cluster,
  },
})
export default class Plant extends GrowMixin {
  @Prop({ required: true }) plantData!: GrowPlant
  // @Prop({ required: true }) setSize!: boolean

  public defaultColor = "text-black"
  // public textClass = this.defaultColor
  public subHighlightBg = "green-500"

  public entityType: GrowDataKey = "plants"
  public entityId = this.plantData.id

  public mounted() {
    // this.setTextClass()
    if (!this.plantData.position) {
      this.setPlantPosition()
    }
  }

  public setPlantPosition() {
    if (!(this.$el instanceof HTMLElement)) {
      return this.$toasted.error(this.messages.generalError)
    }
    grow.setPosition({
      id: this.plantData.id,
      dataKey: "plants",
      newPositions: {
        x: this.$el.offsetLeft,
        y: this.$el.offsetTop + this.plantData.height / 2,
      },
    })
  }

  public get clusterLists() {
    return {
      leafClusters: this.plantData.leafClusters,
      flowers: this.plantData.flowers,
    }
  }

  public clusterKey(list: string) {
    return list == "leafClusters" ? "leaf-cluster-" : "flower-"
  }

  public get plantIsActiveEntity(): boolean {
    return (
      grow.activeEntityType == "plants" &&
      grow.activeEntity?.id == this.plantData.id
    )
  }

  public get plantActive(): boolean {
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

  public get activeText() {
    return `text-${this.activeBg.color}-${this.activeBg.level} dark:text-${this.highlightBg} font-semibold`
  }

  public get highlightText() {
    return `text-${this.highlightBg.color}-${this.highlightBg.level} dark:text-${this.highlightBg.color}-${this.highlightBg.level} font-semibold`
  }

  // for when plant is active, but one of its children is selected
  public get subHighlightText() {
    return `text-${this.subHighlightBg} dark:text-${this.subHighlightBg} font-semibold`
  }

  // @Watch("plantIsActiveEntity")
  // public highlightPlant() {
  //   this.setTextClass()
  // }

  public get textClass() {
    if (this.selfHighlight) {
      return this.highlightText
    } else if (this.plantIsActiveEntity) {
      return this.activeText
    } else if (this.plantActive) {
      return this.subHighlightText
    }
    return this.defaultColor
  }

  public get styleGeneral() {
    const styleData = {
      ...this.plantData,
      height: 0, // branches grow out of top of plant barrier, don't want it selectable below name
      rotation: NO_ROTATION(),
    }
    return this.entityStyle(styleData)
  }

  public get styleRotation() {
    const styleData = {
      position: NO_POSITION(),
      rotation: this.plantData.rotation,
      height: 0,
      width: 0,
      zIndex: 10,
    }

    return this.entityStyle(styleData)
  }
}
</script>
