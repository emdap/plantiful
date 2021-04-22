<template>
  <div
    :id="zoneData.gridArea"
    :style="zoneStyle"
    :class="zoneClass"
    @mousedown="zoneSelected = true"
    @mouseup="zoneSelected = false"
  >
    <div v-if="ready" class="h-full w-full" :class="widgetWrapperClass">
      <widget
        v-for="widget in zoneOpenWidgets(zoneData)"
        :widgetData="widget"
        :key="'widget-' + widget.name"
      >
        <x :is="widget.component" />
      </widget>
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import { Prop, Watch } from "vue-property-decorator"
import { GridZone, Size } from "@/store/interfaces"
import Widget from "@/components/Widget.vue"

@Component({
  components: {
    Widget
  }
})
export default class Zone extends GridMixin {
  @Prop({ required: true }) zoneData!: GridZone
  public ready = false
  public zoneSelected = false

  public mounted() {
    // want zone sizes to be flexible based on widget content,
    // but start size as if grid cols/rows were set to 1fr instead of auto
    this.initializeZone()
    this.ready = true
  }

  public initializeZone() {
    if (this.zoneData.id) {
      const { width, height, x, y } = this.getCurrentRect()
      grid.setZoneSize({
        zone: this.zoneData,
        newHeight: height,
        newWidth: width
      })
      grid.setZonePoints({ zone: this.zoneData, newStart: { x, y } })
    }
  }

  public get zoneStyle() {
    if (this.zoneData.id) {
      const style = { width: "", height: "" }
      if (this.zoneData.width && this.ready) {
        style.width = this.zoneData.width + "px"
      }
      if (this.zoneData.height && this.ready) {
        style.height = this.zoneData.height + "px"
      }
      return style
    }
    return { height: 0, width: 0 }
  }

  public get zoneClass() {
    if (this.zoneData.id) {
      const targetBg = "bg-opacity-100 dark:bg-opacity-100"
      const normalBg = "bg-opacity-50 dark:bg-opacity-50"
      return [
        "zone",
        "scrollbar-thin",
        "scrollbar-light dark:scrollbar-dark",
        "justify-self-stretch",
        "align-self-stretch",
        "justify-items-stretch",
        `bg-${this.zoneData.color}-200 dark:bg-${this.zoneData.color}-900`,
        this.isTargetZone ? targetBg : normalBg
      ]
    }
    return "z-50"
  }

  public get widgetWrapperClass() {
    if (!this.movingZones) {
      return "opacity-100 dark:opacity-100"
    }
    return this.zoneSelected
      ? "opacity-90 dark:opacity-90"
      : "opacity-20 dark:opacity-30 "
  }

  public get isTargetZone() {
    return grid.targetZone && grid.targetZone.id == this.zoneData.id
  }

  @Watch("gridSize")
  public gridSizeChange(newSize: Size, oldSize: Size) {
    // CSS rounds to 2 decimals
    const heightRatio = parseFloat(
      (this.zoneData.height / oldSize.height).toFixed(2)
    )
    const widthRatio = parseFloat(
      (this.zoneData.width / oldSize.width).toFixed(2)
    )
    const newHeight = newSize.height * heightRatio
    const newWidth = newSize.width * widthRatio

    grid.setZoneSize({ zone: this.zoneData, newHeight, newWidth: newWidth })
  }
}
</script>
