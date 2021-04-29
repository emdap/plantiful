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
      <!-- :class="widgetWrapperClass" -->
      <widget
        v-for="widget in zoneOpenWidgets(zoneData)"
        :widgetData="widget"
        :key="'widget-' + widget.name"
        @resizing="activateZone"
      >
        <!-- optional zoneSize prop for components that may need to position children -->
        <!-- <x :is="widget.component" :zoneReady="true" /> -->
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
  @Prop({ default: false }) containerResizing!: boolean
  @Prop({ default: null }) containerId!: number

  public zoneSelected = false
  public siblingResizing = false

  public mounted() {
    // want zone sizes to be flexible based on widget content,
    // but start size as if grid cols/rows were set to 1fr instead of auto
    // grid.mountZone({ zone: this.zoneData, mounted: true })
    this.setCurrentSize()
    document.addEventListener("mouseup", this.notSelected)
  }

  public beforeDestroy() {
    // grid.mountZone({ zone: this.zoneData, mounted: false })
    document.removeEventListener("mouseup", this.notSelected)
    // this.resetSize()
  }

  //#region Utilities
  public activateZone(resizing: boolean) {
    grid.setActiveZone({
      containerId: this.zoneData.containerId,
      zoneId: resizing ? this.zoneData.id : null,
    })
  }

  public notSelected() {
    this.zoneSelected = false
  }

  public resetSize() {
    grid.setZoneSize({
      zone: this.zoneData,
      newSize: NO_SIZE(),
    })
  }

  public setCurrentSize() {
    // waiting for next tick ensures zone is in place
    // this.$nextTick(() => {
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
    // grid.mountZone({ zone: this.zoneData, mounted: true })
    // })
  }
  //#endregion

  //#region Watchers
  @Watch("myContainer.activeZone")
  public zoneActivated(curActive: number | null, priorActive: number | null) {
    if (curActive && curActive != this.zoneData.id) {
      this.siblingResizing = true
      // this.resetSize()
    } else if (!curActive && priorActive != this.zoneData.containerId) {
      console.log(this.zoneData.id, "reset")
      // this.siblingResizing = false
      // this.setCurrentSize()
    }
  }

  // @Watch("myContainer.size")
  // public gridSizeChange(containerSize: Size) {
  //   const newSize = {
  //     height: containerSize.height * this.zoneData.sizeRatio.height,
  //     width: containerSize.width * this.zoneData.sizeRatio.width,
  //   }
  //   grid.setZoneSize({ zone: this.zoneData, newSize })
  // }

  @Watch("containerResizing")
  public gridSizeChange(resizing: boolean) {
    // don't want to update until resize finished
    console.log(this.zoneData.id, resizing)
    if (!resizing) {
      this.setCurrentSize()
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
      this.setCurrentSize()
    })
  }

  // @Watch("isMounted")
  // public mountedChanged(mounted: boolean) {
  //   if (!mounted) {
  //     this.resetSize()
  //     this.setCurrentSize()
  //   }
  // }
  //#endregion

  //#region Getters
  public get isTargetZone() {
    return grid.targetZone && grid.targetZone.id == this.zoneData.id
  }

  public get myContainer() {
    return this.getContainer(this.zoneData.containerId)
  }

  public get isResizingZone() {
    return this.myContainer?.activeZone == this.zoneData.id
  }

  // public get mountedSiblings() {
  //   return this.containerMountedZones(this.containerId).length
  // }

  public get openSiblings() {
    return this.containerOpenZones(this.zoneData.containerId)
  }

  public get openChildren() {
    return this.zoneOpenWidgets(this.zoneData).length
  }

  // public get isMounted() {
  //   return this.zoneData.mounted
  // }
  //#endregion

  //#region Styling getters
  public get zoneStyle() {
    // const style = { width: "", height: "" }
    // if (this.zoneData.id && !this.siblingResizing) {
    //   if (this.zoneData.size.width) {
    //     style.width = this.zoneData.size.width + "px"
    //   }
    //   if (this.zoneData.size.height) {
    //     style.height = this.zoneData.size.height + "px"
    //   }
    // }
    // +1 to ends as CSS has the end being the start of the /next/ row/column
    // but my objects end in the row/column that the zone actually occupies
    return {
      "grid-row": `${this.zoneData.rows.start} / ${this.zoneData.rows.end + 1}`,
      "grid-column": `${this.zoneData.columns.start} / ${this.zoneData.columns
        .end + 1}`,
    }

    // TODO: fix this lol
    // if (this.isResizingZone) {
    //   console.log("update max width height")
    //   return {
    //     // "min-width": style.width,
    //     // "min-height": style.height,
    //     // ...style
    //   }
    // }
    // return style
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
        // "justify-self-stretch",
        // "align-self-stretch",
        // "justify-items-stretch",
        `bg-${this.zoneData.color}-200 dark:bg-${this.zoneData.color}-900`,
        this.movingZones || this.siblingResizing
          ? this.isTargetZone
            ? targetBg
            : normalBg
          : noBg,
      ]
    }
    return "z-50"
  }

  // public get widgetWrapperClass() {
  //   if (!this.isMounted) {
  //     return "hidden"
  //   } else if (this.movingZones) {
  //     return this.zoneSelected
  //     ? "opacity-90 dark:opacity-90"
  //     : "opacity-20 dark:opacity-30"
  //   } else if (!this.siblingResizing) {
  //     return "opacity-0"
  //   }
  //   return "opacity-100 dark:opacity-100"
  // }

  public get widgetWrapperStyle() {
    // if (!this.isMounted) {
    //   return {display: "none"}
    // }
    // else if (!this.siblingResizing) {
    return {
      opacity: this.movingZones ? (this.zoneSelected ? 0.9 : 0.3) : 1,
    }
    // }
    // when another zone in the container is resizing, give dimensions to inner div
    // return {
    //   height: this.zoneData.size.height + "px",
    //   width: this.zoneData.size.width + "px",
    //   opacity: 0,
    // }
  }
  //#endregion
}
</script>
