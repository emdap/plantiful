<template>
  <div
    :id="zoneData.name"
    :style="zoneStyle"
    :class="zoneClass"
    @mousedown="zoneSelected = true"
    @mouseup="zoneSelected = false"
  >
    <div
      v-if="sized"
      class="h-full w-full transition-opacity overflow-hidden"
      :class="widgetWrapperClass"
    >
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
import Widget from "@/components/Grid/Widget.vue"
import { NO_SIZE } from "@/fixtures/Defaults"

@Component({
  components: {
    Widget,
  },
})
export default class Zone extends GridMixin {
  @Prop({ required: true }) zoneData!: GridZone
  @Prop({ default: null }) containerId!: number

  public zoneSelected = false
  public sized = false

  public mounted() {
    // want zone sizes to be flexible based on widget content,
    // but start size as if grid cols/rows were set to 1fr instead of auto
    this.setCurrentSize()
    document.addEventListener("mouseup", this.notSelected)
  }

  public notSelected() {
    this.zoneSelected = false
  }

  public beforeDestroy() {
    grid.mountZone({ id: this.zoneData.id, mounted: false })
    document.removeEventListener("mouseup", this.notSelected)
    this.resetSize()
  }

  public get myContainer() {
    return this.getContainer(this.zoneData.containerId)
  }

  public setCurrentSize() {
    // waiting for next tick ensures all zones in container are getting zoned when no zones have sizes
    this.$nextTick(() => {
      if (this.zoneData.id) {
        const { width, height, x, y } = this.getCurrentRect()
        const containerSize = this.myContainer.size
        grid.setZoneSize({
          zone: this.zoneData,
          newSize: {
            height,
            width,
          },
          newRatio: {
            height: height / containerSize.height,
            width: width / containerSize.width,
          },
        })
        grid.setZonePoints({ zone: this.zoneData, newStart: { x, y } })
      }
      this.sized = true
      grid.mountZone({ id: this.zoneData.id, mounted: true })
    })
  }

  public get zoneStyle() {
    if (this.zoneData.id) {
      const style = { width: "", height: "" }
      if (this.zoneData.size.width) {
        style.width = this.zoneData.size.width + "px"
      }
      if (this.zoneData.size.height) {
        style.height = this.zoneData.size.height + "px"
      }
      return style
    }
    return { height: 0, width: 0 }
  }

  public get zoneClass() {
    if (this.zoneData.id) {
      const targetBg = "bg-opacity-100 dark:bg-opacity-100"
      const normalBg = "bg-opacity-50 dark:bg-opacity-50"
      // issue with 1px of bg being visible behind widget, despite bg clip content box :/
      const noBg = "bg-opacity-0 dark:bg-opacity-0"
      return [
        "zone",
        // "justify-self-stretch",
        // "align-self-stretch",
        // "justify-items-stretch",
        `bg-${this.zoneData.color}-200 dark:bg-${this.zoneData.color}-900`,
        this.movingZones ? (this.isTargetZone ? targetBg : normalBg) : noBg,
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

  @Watch("myContainer.size")
  public gridSizeChange(containerSize: Size) {
    const newSize = {
      height: containerSize.height * this.zoneData.sizeRatio.height,
      width: containerSize.width * this.zoneData.sizeRatio.width,
    }

    grid.setZoneSize({ zone: this.zoneData, newSize })
  }

  public get mountedSiblings() {
    return this.containerMountedZones(this.containerId).length
  }

  public get openChildren() {
    return this.zoneOpenWidgets(this.zoneData).length
  }

  @Watch("openChildren")
  public openZone(openCount: number) {
    if (!openCount || !this.zoneData.open) {
      grid.toggleZone(this.zoneData)
    }
  }

  public get mountedChanged() {
    return this.zoneData.mounted
  }

  @Watch("mountedChanged")
  public refreshSize() {
    this.sized = false
    this.resetSize()
    this.setCurrentSize()
  }

  public resetSize() {
    grid.setZoneSize({
      zone: this.zoneData,
      newSize: NO_SIZE(),
    })
  }
}
</script>
