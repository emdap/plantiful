<template>
  <div
    :id="zoneData.name"
    :style="zoneData.id ? zoneStyle : ''"
    :class="zoneClass"
    @mousedown="zoneSelected = true"
    @mouseup="zoneSelected = false"
  >
    <div :class="zoneBackgroundClass">
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
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import { Prop, Watch } from "vue-property-decorator"
import { GridAxes, GridZone, Size } from "@/store/interfaces"
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
  public minSize = {
    width: 50,
    height: 50,
  }
  public maxSize = {
    width: 0,
    height: 0,
  }

  public mounted() {
    // on application launch, container takes 1 tick to record its own size
    this.$nextTick(() => {
      if (this.zoneData.id) {
        this.setDimsCurrent()
      }
    })
    document.addEventListener("mouseup", this.notSelected)
  }

  public beforeDestroy() {
    document.removeEventListener("mouseup", this.notSelected)
  }

  //#region Utilities
  public notSelected() {
    this.zoneSelected = false
  }

  public calcRatio(size: Size) {
    return {
      height: size.height / this.maxSize.height,
      width: size.width / this.maxSize.width,
    }
  }

  public setDimsCurrent(distribute = true) {
    const { width, height, x, y } = this.getCurrentRect()
    this.maxSize.height = this.myContainer.size.height
    this.maxSize.width = this.myContainer.size.width

    const newRatio = this.calcRatio({ height, width })

    grid.setZoneSize({
      zone: this.zoneData,
      newSize: {
        height,
        width,
      },
      newRatio,
      distribute,
    })

    grid.setZonePoints({ zone: this.zoneData, startPoint: { x, y } })
  }

  public getOutsideDims(payload: { rows: boolean; columns: boolean }) {
    const outsideDims = {} as { rows: number[]; columns: number[] }
    for (const axis of GridAxes) {
      if (payload[axis]) {
        outsideDims[axis] = Object.keys(this.myContainer[axis])
          .map(Number)
          .filter(dim => {
            return this.zoneData[axis].indexOf(dim) == -1
          })
      }
    }
    return outsideDims
  }

  public newZoneSize(e: MouseEvent): Size {
    // applying mins/max to size after determining if size tracks mouse movement inverted or not
    const newSize: Size = this.updateSize(e, {
      minimum: NO_SIZE(),
      maximum: { height: Infinity, width: Infinity },
      entity: this.zoneData,
    })

    // invert how mouse movement affects size if is last row/col
    // if no nextrow/column, don't update the associated dimension
    if (!this.nextRow || this.nextRow < this.zoneData.rows[0]) {
      newSize.height = this.nextRow
        ? this.zoneData.size.height * 2 - newSize.height
        : this.zoneData.size.height
    }

    if (!this.nextCol || this.nextCol < this.zoneData.columns[0]) {
      newSize.width = this.nextCol
        ? this.zoneData.size.width * 2 - newSize.width
        : this.zoneData.size.width
    }

    return {
      height: Math.max(
        this.minSize.height,
        Math.min(this.maxSize.height, newSize.height)
      ),
      width: Math.max(
        this.minSize.width,
        Math.min(this.maxSize.width, newSize.width)
      ),
    }
  }

  // Size updater
  public updateDims(e: MouseEvent) {
    const newSize = this.newZoneSize(e)

    const newRatio = this.calcRatio(newSize)

    // only want to bother distributing ratios to rows/cols where the size has changed
    const insideDims = {
      rows:
        newSize.height != this.zoneData.size.height
          ? this.zoneData.rows
          : undefined,
      columns:
        newSize.width != this.zoneData.size.width
          ? this.zoneData.columns
          : undefined,
    }
    const outsideDims = this.getOutsideDims({
      rows: newSize.height != this.zoneData.size.height,
      columns: newSize.width != this.zoneData.size.width,
    })

    // update size & ratio, don't distribute yet; this will also round the ratio
    grid.setZoneSize({
      zone: this.zoneData,
      newSize,
      newRatio,
    })

    // distribute the rounded ratio, and only to the dimensions that updated
    grid.zoneDistributeRatio({
      containerId: this.zoneData.containerId,
      ratio: {
        rows: this.zoneData.sizeRatio.height,
        columns: this.zoneData.sizeRatio.width,
      },
      ...insideDims,
      proportional: true,
    })

    grid.zoneDistributeRatio({
      containerId: this.zoneData.containerId,
      ratio: {
        rows: 1 - this.zoneData.sizeRatio.height,
        columns: 1 - this.zoneData.sizeRatio.width,
      },
      ...outsideDims,
      proportional: true,
    })
  }
  //#endregion

  // #region Watchers
  @Watch("trackSize")
  mouseUpdatesSize(track: boolean) {
    if (track) {
      // set to current size - useful if another zone resized the row/col
      grid.toggleZonesGrowing(this.zoneData.containerId)
      document.addEventListener("mousemove", this.updateDims)
    } else {
      this.sizeStart = null
      grid.toggleZonesGrowing(this.zoneData.containerId)
      document.removeEventListener("mousemove", this.updateDims)
    }
  }

  @Watch("myContainer.zonesGrowing")
  public zonesGrowing(growing: boolean) {
    // update to current after growing done -- updates start/end points as well
    if (!growing) {
      this.setDimsCurrent(false)
      if (
        this.zoneData.size.height < this.minSize.height ||
        this.zoneData.size.width < this.minSize.width
      ) {
        grid.forceCloseZone(this.zoneData)
      }
    }
  }

  @Watch("containerResizing")
  public gridSizeChange(resizing: boolean) {
    // don't want to update until resize finished
    if (!resizing) {
      this.setDimsCurrent(false)
    }
  }

  @Watch("openChildren")
  public openZone(openCount: number) {
    if (!openCount || !this.zoneData.open) {
      grid.toggleZone({ zone: this.zoneData })
    }
  }

  @Watch("openSiblings")
  public checkSize(nowOpen: GridZone[], wasOpen: GridZone[]) {
    const { bigList, smallList } =
      nowOpen.length > wasOpen.length
        ? { bigList: nowOpen, smallList: wasOpen }
        : { smallList: nowOpen, bigList: wasOpen }
    const changedZone = bigList.find(z => {
      return smallList.indexOf(z) == -1
    })
    if (!changedZone) {
      return
    }
    // need to reset dimensions where the new zone is *not*, in order to shrink them and make room
    // or in opposite case, in order to grow them to take up the now available space
    const resetDims = {
      rows: this.zoneData.rows.filter(r => {
        return changedZone.rows.indexOf(r) == -1
      }),
      columns: this.zoneData.columns.filter(r => {
        return changedZone.columns.indexOf(r) == -1
      }),
    }
    grid.resetDims({ containerId: this.zoneData.containerId, resetDims })
    this.$nextTick(() => {
      // update size/ratio to current, now with the new zone opened/closed
      this.setDimsCurrent()
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

  public get nextCol() {
    return grid.zoneNextRowCol(this.zoneData, "columns")
  }

  public get nextRow() {
    return grid.zoneNextRowCol(this.zoneData, "rows")
  }

  //#endregion

  //#region Styling getters
  public get zoneStyle() {
    // +1 to ends as CSS has the end being the start of the /next/ row/column
    return {
      "grid-row": `${this.zoneData.rows[0]} / ${this.zoneLastDim(
        this.zoneData,
        "rows"
      ) + 1}`,
      "grid-column": `${this.zoneData.columns[0]} / ${this.zoneLastDim(
        this.zoneData,
        "columns"
      ) + 1}`,
    }
  }

  public get zoneClass() {
    return {
      "zone overflow-hidden": this.zoneData.id,
    }
  }

  public get zoneBackgroundClass() {
    if (this.zoneData.id) {
      const targetBg = "bg-opacity-100 dark:bg-opacity-100"
      const normalBg = "bg-opacity-50 dark:bg-opacity-50"
      return [
        "h-full w-full",
        `bg-${this.zoneData.color}-200 dark:bg-${this.zoneData.color}-900`,
        this.movingZones ? (this.isTargetZone ? targetBg : normalBg) : normalBg,
      ]
    }
    return "z-50"
  }

  public get widgetWrapperStyle() {
    return {
      opacity: this.movingZones ? (this.zoneSelected ? 0.9 : 0.3) : 1,
    }
  }
  //#endregion
}
</script>
