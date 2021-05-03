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
import { GridAxes, GridZone, Position, Size } from "@/store/interfaces"
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
    this.$nextTick(() => {
      this.setDims({ distribute: true })
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

  public setDims(payload: {
    current?: boolean
    newDims?: Size & Position
    distribute: boolean
  }) {
    if (this.zoneData.id) {
      const { width, height, x, y } =
        !payload || payload.current || !payload.newDims
          ? this.getCurrentRect()
          : payload.newDims

      grid.setZoneSize({
        zone: this.zoneData,
        newSize: {
          height,
          width,
        },
        // container waits a tick before recording its size
        newRatio:
          this.myContainer.size.width && this.myContainer.size.height
            ? {
                height: height / this.myContainer.size.height,
                width: width / this.myContainer.size.width,
              }
            : undefined,
        distribute: payload?.distribute,
      })
      grid.setZonePoints({ zone: this.zoneData, startPoint: { x, y } })
    }
  }

  public updateDims(e: MouseEvent) {
    const minSize = {
      width: 50,
      height: 50,
    }
    const maxSize = {
      width: this.myContainer.size.width,
      height: this.myContainer.size.height,
    }

    // applying mins/max to size after determining if size tracks mouse movement inverted or not
    const newSize: Size = this.updateSize(e, {
      minimum: NO_SIZE(),
      maximum: { height: Infinity, width: Infinity },
      entity: this.zoneData,
    })

    const sizeDiff = {
      height: newSize.height - this.zoneData.size.height,
      width: newSize.width - this.zoneData.size.width,
    }

    // if next row/column is before this one instead of after, invert mouse movement -> size
    if (!this.nextRow || this.nextRow < this.zoneData.rows[0]) {
      sizeDiff.height = this.nextRow ? -sizeDiff.height : 0
      newSize.height = this.zoneData.size.height + sizeDiff.height
    }

    if (!this.nextCol || this.nextCol < this.zoneData.columns[0]) {
      sizeDiff.width = this.nextCol ? -sizeDiff.width : 0
      newSize.width = this.zoneData.size.width + sizeDiff.width
    }

    // convert to min/max after newSize has been flipped  & recalc diff
    newSize.height = Math.max(
      minSize.height,
      Math.min(maxSize.height, newSize.height)
    )
    sizeDiff.height = newSize.height - this.zoneData.size.height
    newSize.width = Math.max(
      minSize.width,
      Math.min(maxSize.width, newSize.width)
    )
    sizeDiff.width = newSize.width - this.zoneData.size.width

    // apply new sizes/ratios to self + neighboring cols/rows, if size has changed
    if (newSize.height != this.zoneData.size.height && this.nextRow) {
      // add/subtract ratio from row/col with largest size
      const ratio = sizeDiff.height / this.myContainer.size.height
      const updateRow = this.checkAndGetUpdateDim("rows", this.nextRow, ratio)
      if (updateRow) {
        grid.incContainerDim({
          containerId: this.zoneData.containerId,
          incRatio: ratio,
          axis: "rows",
          dim: updateRow,
        })
        grid.incContainerDim({
          containerId: this.zoneData.containerId,
          incRatio: -ratio,
          axis: "rows",
          dim: this.nextRow,
        })
      }
    }
    if (newSize.width != this.zoneData.size.width && this.nextCol) {
      const ratio = sizeDiff.width / this.myContainer.size.width
      const updateCol = this.checkAndGetUpdateDim(
        "columns",
        this.nextCol,
        ratio
      )
      if (updateCol) {
        grid.incContainerDim({
          containerId: this.zoneData.containerId,
          incRatio: ratio,
          axis: "columns",
          dim: updateCol,
        })
        grid.incContainerDim({
          containerId: this.zoneData.containerId,
          incRatio: -ratio,
          axis: "columns",
          dim: this.nextCol,
        })
      }
    }

    if (
      newSize.height == this.zoneData.size.height &&
      newSize.width == this.zoneData.size.width
    ) {
      // neither dimension changed
      return
    }

    // update zoneData's knowledge of itself
    this.setDims({
      newDims: { ...newSize, ...this.zoneData.startPoint },
      distribute: false,
    })
  }

  public checkAndGetUpdateDim(
    axis: typeof GridAxes[number],
    nextDim: number,
    ratio: number
  ) {
    let sortList!: number[][]
    if (axis == "rows") {
      sortList = this.myRows
    } else {
      sortList = this.myCols
    }

    const updateDim = sortList.sort((a, b) => {
      return b[1] - a[1]
    })

    if (
      updateDim[0][1] + ratio > 0.01 &&
      this.myContainer[axis][nextDim].sizeRatio - ratio > 0.01
    ) {
      return updateDim[0][0]
    }
    return false
  }

  public get nextCol() {
    return grid.zoneNextRowCol(this.zoneData, "columns")
  }

  public get nextRow() {
    return grid.zoneNextRowCol(this.zoneData, "rows")
  }

  public get myCols() {
    // list of: col#: ratio
    return this.zoneData.columns.map(c => {
      return [c, this.myContainer.columns[c].sizeRatio]
    })
  }

  public get myRows() {
    // list of: row#: ratio
    return this.zoneData.rows.map(r => {
      return [r, this.myContainer.rows[r].sizeRatio]
    })
  }
  //#endregion

  @Watch("trackSize")
  mouseUpdatesSize(track: boolean) {
    if (track) {
      // set to current size - useful if another zone resized the row/col
      this.setDims({ distribute: false })
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
      this.setDims({ distribute: false })
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
    grid.resetZoneDimRatios(this.zoneData)
    this.$nextTick(() => {
      // waiting for next tick ensures opened/closed zone has been added/removed from DOM
      this.setDims({ distribute: true })
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
