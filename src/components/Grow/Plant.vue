<template>
  <div
    class="absolute"
    :id="'plant-' + growData.id"
    @dblclick="setActive"
    :style="styleGeneral"
  >
    <span
      v-if="growData.showName"
      :class="textClass"
      :style="`margin-left: -${growData.width}px; width: ${growData.width}px`"
      class="whitespace-nowrap text-center transition-colors  duration-75 font-semibold cursor-pointer select-none"
      @dblclick.self="setActiveEntity"
    >
      {{ growData.name }}
    </span>
    <div :style="styleRotation" class="absolute">
      <branch
        v-for="branch in growData.branches"
        :key="'branch-' + branch"
        :growData="getEntity('branches', branch)"
        :allowSelection="plantActive"
        :plantHighlight="selfHighlight"
      />
      <template
        v-for="clusterType in ['leafClusters', 'flowers']"
        :index="clusterType"
      >
        <cluster
          v-for="cluster in growData[clusterType]"
          :key="clusterKey(clusterType) + cluster"
          :flowerOrLeafCluster="clusterType"
          :growData="getEntity(clusterType, cluster)"
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
import { Prop } from "vue-property-decorator"
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
  @Prop({ required: true }) growData!: GrowPlant
  // @Prop({ required: true }) setSize!: boolean

  public defaultColor = "text-black dark:text-white"
  // public textClass = this.defaultColor
  public subHighlightBg = "green-500"

  public entityType: GrowDataKey = "plants"
  public entityId = this.growData.id

  public mounted() {
    // this.setTextClass()
    if (!this.growData.position) {
      this.setPlantPosition()
    }
  }

  public setPlantPosition() {
    if (!(this.$el instanceof HTMLElement)) {
      return this.$toasted.error(this.messages.generalError)
    }
    grow.setPosition({
      id: this.growData.id,
      dataKey: "plants",
      newPositions: {
        x: this.$el.offsetLeft,
        y: this.$el.offsetTop + this.growData.height / 2,
      },
    })
  }

  public get clusterLists() {
    return {
      leafClusters: this.growData.leafClusters,
      flowers: this.growData.flowers,
    }
  }

  public clusterKey(list: string) {
    return list == "leafClusters" ? "leaf-cluster-" : "flower-"
  }

  public get plantIsActiveEntity(): boolean {
    return (
      grow.activeEntityType == "plants" &&
      grow.activeEntity?.id == this.growData.id
    )
  }

  public get plantActive(): boolean {
    return grow.activeGrowPlant?.id == this.growData.id
  }

  public setActive(e: MouseEvent) {
    if (!this.plantActive) {
      grow.setActivePlant(this.growData.id)
      e.stopPropagation()
    }
  }

  public setActiveEntity(e: MouseEvent) {
    if (this.plantActive && grow.activeEntityType != "plants") {
      grow.setActiveEntity({ dataKey: "plants", id: this.growData.id })
      e.stopPropagation()
    } else if (!this.plantActive) {
      this.setActive(e)
    }
  }

  public get activeText() {
    return `text-${this.activeBg.color}-${this.activeBg.level} dark:text-${this.activeBg.color}-${this.activeBg.darkLevel} font-semibold`
  }

  public get highlightText() {
    return `text-${this.highlightBg.color}-${this.highlightBg.level} dark:text-${this.highlightBg.color}-${this.highlightBg.darkLevel} font-semibold`
  }

  // for when plant is active, but one of its children is selected
  public get subHighlightText() {
    return `text-${this.subHighlightBg} dark:text-${this.subHighlightBg} font-semibold`
  }

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
      ...this.growData,
      height: 0, // branches grow out of top of plant barrier, don't want it selectable below name
      rotation: NO_ROTATION(),
    }
    return this.entityStyle(styleData)
  }

  public get styleRotation() {
    const styleData = {
      position: NO_POSITION(),
      rotation: this.growData.rotation,
      height: 0,
      width: 0,
      zIndex: 10,
    }

    return this.entityStyle(styleData)
  }
}
</script>
