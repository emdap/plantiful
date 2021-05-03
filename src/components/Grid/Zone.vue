<template>
  <div
    :id="zoneData.name"
    :style="zoneData.id ? zoneStyle : ''"
    :class="zoneClass"
    @mousedown="zoneSelected = true"
    @mouseup="zoneSelected = false"
  >
    <div
      class="h-full w-full transition-opacity overflow-auto"
      :style="widgetWrapperStyle"
    >
      <widget
        v-for="widget in zoneOpenWidgets(zoneData)"
        :widgetData="widget"
        :key="'widget-' + widget.name"
        @track-size="trackSize = !trackSize"
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
import { GridZone, Position, Size } from "@/store/interfaces"
import Widget from "@/components/Grid/Widget.vue"
import { NO_SIZE } from "@/fixtures/Defaults"

@Component({
  components: {
    Widget,
  },
})
export default class Zone extends GridMixin {
  @Prop({ required: true }) zoneData!: GridZone
  @Prop({ default: false }) containerResizing!: boolean
  @Prop({ default: null }) containerId!: number

  public zoneSelected = false

  public mounted() {
    this.setDims()
    document.addEventListener("mouseup", this.notSelected)
  }

  public beforeDestroy() {
    document.removeEventListener("mouseup", this.notSelected)
  }

  //#region Utilities
  // public activateZone(resizing: boolean) {
  //   grid.setActiveZone({
  //     containerId: this.zoneData.containerId,
  //     zoneId: resizing ? this.zoneData.id : null,
  //   })
  // }

  public notSelected() {
    this.zoneSelected = false
  }

  // public resetSize() {
  //   grid.setZoneSize({
  //     zone: this.zoneData,
  //     newSize: NO_SIZE(),
  //   })
  // }

  public setDims(current = true, newDims?: Size & Position) {
    if (this.zoneData.id) {
      if (current || !newDims) {
        newDims = this.getCurrentRect()
      }
      const { width, height, x, y } = newDims

      grid.setZoneSize({
        zone: this.zoneData,
        newSize: {
          height,
          width,
        },
        newRatio: {
          height: height / this.myContainer.size.height,
          width: width / this.myContainer.size.width,
        },
      })
      grid.setZonePoints({ zone: this.zoneData, startPoint: { x, y } })
    }
  }

  public updateDims(e: MouseEvent) {
    const newSize = this.updateSize(e, {
      minimum: {
        width: 50,
        height: 50,
      },
      maximum: {
        width: this.myContainer.size.width,
        height: this.myContainer.size.height,
      },
      entity: this.zoneData,
    })

    if (
      newSize.height == this.zoneData.size.height &&
      newSize.width == this.zoneData.size.width
    ) {
      return
    }

    // if next row/column is before this one instead of after, subtract the difference rather than add it
    if (this.nextRow && this.nextRow < this.zoneData.rows.start) {
      newSize.height = this.zoneData.size.height * 2 - newSize.height
    }
    if (this.nextCol && this.nextCol < this.zoneData.columns.start) {
      newSize.width = this.zoneData.size.width * 2 - newSize.width
    }

    this.setDims(false, { ...newSize, ...this.zoneData.startPoint })

    grid.updateContainerGridSizes({
      container: this.myContainer,
      zone: this.zoneData,
      nextRow: this.nextRow,
      nextCol: this.nextCol,
    })
  }

  public get nextCol() {
    return grid.zoneNextRowCol(this.myContainer, this.zoneData, "columns")
  }

  public get nextRow() {
    return grid.zoneNextRowCol(this.myContainer, this.zoneData, "rows")
  }
  //#endregion

  @Watch("trackSize")
  mouseUpdatesSize(track: boolean) {
    if (track) {
      // set to current size - useful if another zone resized the row/col
      this.setDims()
      document.addEventListener("mousemove", this.updateDims)
    } else {
      this.sizeStart = null
      document.removeEventListener("mousemove", this.updateDims)
    }
  }

  @Watch("containerResizing")
  public gridSizeChange(resizing: boolean) {
    // don't want to update until resize finished
    if (!resizing) {
      this.setDims()
    }
  }

  @Watch("openChildren")
  public openZone(openCount: number) {
    if (!openCount || !this.zoneData.open) {
      grid.toggleZone({ zone: this.zoneData })
    }
  }

  @Watch("openSiblings")
  public checkSize() {
    this.$nextTick(() => {
      // waiting for next tick ensures opened/closed zone has been added/removed from DOM
      this.setDims()
    })
  }

  //#endregion

  //#region Getters
  public get isTargetZone() {
    return grid.targetZone && grid.targetZone.id == this.zoneData.id
  }

  public get myContainer() {
    return this.getContainer(this.zoneData.containerId)
  }

  public get openSiblings() {
    return this.containerOpenZones(this.zoneData.containerId)
  }

  public get openChildren() {
    return this.zoneOpenWidgets(this.zoneData).length
  }

  //#endregion

  //#region Styling getters
  public get zoneStyle() {
    // +1 to ends as CSS has the end being the start of the /next/ row/column
    // but my objects end in the row/column that the zone actually occupies
    return {
      "grid-row": `${this.zoneData.rows.start} / ${this.zoneData.rows.end + 1}`,
      "grid-column": `${this.zoneData.columns.start} / ${this.zoneData.columns
        .end + 1}`,
    }
  }

  public get zoneClass() {
    if (this.zoneData.id) {
      const targetBg = "bg-opacity-100 dark:bg-opacity-100"
      const normalBg = "bg-opacity-50 dark:bg-opacity-50"
      // issue with 1px of bg being visible behind widget, despite bg clip content box :/
      // TODO: try putting another widget wrapper that has other widget styles, and then bg styling on the first wrapper
      const noBg = normalBg
      // const noBg = "bg-opacity-0 dark:bg-opacity-0"
      return [
        "zone",
        "overflow-hidden",
        `bg-${this.zoneData.color}-200 dark:bg-${this.zoneData.color}-900`,
        this.movingZones ? (this.isTargetZone ? targetBg : normalBg) : noBg,
      ]
    }
    return "z-50"
  }

  public get widgetWrapperStyle() {
    // TODO: try putting another widget wrapper that has other widget styles, and then bg styling on the first wrapper
    return {
      opacity: this.movingZones ? (this.zoneSelected ? 0.9 : 0.3) : 1,
    }
  }
  //#endregion
}
</script>
