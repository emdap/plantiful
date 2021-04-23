<template>
  <div
    :id="`${widgetData.name}-widget`"
    class="widget flex transition-colors p-2 bg-white dark:bg-gray-700 outline-none text-gray-600 dark:text-black  overflow-auto"
    :style="widgetStyle"
    :class="widgetClass"
    tabindex="1"
    @focus="inFocus = true"
    @blur="inFocus = false"
  >
    <main class="flex flex-grow flex-col w-full">
      <nav
        class="flex flex-row flex-shrink-0 h-6 items-center whitespace-nowrap mb-1 sticky left-0 w-full scrollbar-none overflow-x-auto"
      >
        <nav class="flex w-1/2 gap-3">
          <!-- TODO: all titles should be from fixture -->
          <span :title="widgetData.docked ? 'Un-dock widget' : 'Dock widget'">
            <docked-icon
              class="icon"
              v-if="widgetData.docked"
              @click="dockWidget()"
            />
            <not-docked-icon class="icon" v-else @click="dockWidget()" />
          </span>
          <span
            ref="move-icon"
            :title="widgetData.docked ? 'Swap zone' : 'Move widget'"
          >
            <move-dock-icon
              v-if="widgetData.docked"
              class="icon"
              @mousedown="trackPosition = true"
            />
            <move-icon v-else class="icon" @mousedown="trackPosition = true" />
          </span>
        </nav>
        <header
          class="flex flex-grow font-semibold items-center justify-center px-3 dark:text-black"
        >
          {{ widgetData.text }}
          <h2></h2>
        </header>
        <nav class="flex w-1/2 justify-end">
          <close-icon class="icon close" @click="closeWidget()" />
        </nav>
      </nav>
      <section class="flex flex-grow overflow-auto">
        <slot></slot>
      </section>
      <footer
        v-if="!widgetData.docked"
        class="mt-auto sticky left-0 text-gray-500"
      >
        <span title="Resize">
          <resize-icon
            class="icon resize-widget mt-1 ml-auto"
            @mousedown="trackSize = true"
          />
        </span>
      </footer>
    </main>
  </div>
</template>

<script lang="ts">
import { Positions, Dimensions, GridWidget, Position } from "@/store/interfaces"
import { Prop, Ref, Watch } from "vue-property-decorator"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import Component from "vue-class-component"
import CloseIcon from "@/assets/icons/close.svg"
import DockedIcon from "@/assets/icons/docked.svg"
import NotDockedIcon from "@/assets/icons/not-docked.svg"
import MoveIcon from "@/assets/icons/move.svg"
import MoveDockIcon from "@/assets/icons/drag.svg"
import ResizeIcon from "@/assets/icons/resize.svg"

@Component({
  components: {
    CloseIcon,
    DockedIcon,
    NotDockedIcon,
    MoveIcon,
    MoveDockIcon,
    ResizeIcon
  }
})
export default class Widget extends GridMixin {
  @Prop({ required: true }) widgetData!: GridWidget
  @Ref("move-icon") moveIcon!: HTMLElement

  public trackPosition = false
  public trackSize = false
  public sizeStart: Position | null = null
  public posStart: Position | null = null
  public inFocus = false

  public mounted() {
    this.initMouseUpListeners()
    // un/re-docking, moving zones actually re-mounts Widget
    // zone it belongs to is dynamically rendering it
    if (this.widgetData.currentZone != 0) {
      this.syncWithZone()
    }
  }

  public beforeDestroy() {
    document.removeEventListener("mouseup", this.mouseUpListener)
  }

  public initMouseUpListeners() {
    // stop tracking position/size when mouse is up
    document.addEventListener("mouseup", this.mouseUpListener)
  }

  public mouseUpListener(e: MouseEvent) {
    if (this.trackPosition) {
      e.preventDefault()
      this.trackPosition = false
    }
    if (this.trackSize) {
      e.preventDefault()
      this.trackSize = false
    }
  }

  public syncWithZone() {
    // need to wait for next tick so that widget has in fact updated in DOM
    this.$nextTick(() => {
      this.setToCurrent()
    })
  }

  public setToCurrent() {
    const { height, width, x, y } = this.getCurrentRect()
    grid.setWidgetSize({
      widget: this.widgetData,
      setZone: false,
      newHeight: height,
      newWidth: width
    })
    grid.setWidgetPosition({
      name: this.widgetData.name,
      newPosition: { x, y }
    })
  }

  // Utilities
  @Watch("trackSize")
  mouseUpdatesSize(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.updateSize)
    } else {
      this.sizeStart = null
      document.removeEventListener("mousemove", this.updateSize)
    }
  }

  @Watch("trackPosition")
  mouseUpdatesPosition(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.updatePosition)
      if (this.widgetData.docked) {
        grid.zonesTrackMouse(true)
      }
    } else {
      document.removeEventListener("mousemove", this.updatePosition)
      if (this.widgetData.docked) {
        this.moveZone()
        grid.zonesTrackMouse(false)
      }
      this.posStart = null
    }
  }

  public moveZone() {
    // posStart is recording where the mouse currently is as mouse moves
    const mousePos = this.posStart ? this.posStart : this.widgetData.position
    grid.widgetToClosestZone({ widget: this.widgetData, mousePos })
    this.syncWithZone()
  }

  // Styling getters
  public get widgetStyle() {
    // dragging from one zone to another -- stay 'docked' in state, but allow movement
    const inPlace = this.widgetData.docked && !this.trackPosition
    return {
      top: inPlace ? 0 : this.widgetData.position.y + "px",
      left: inPlace ? 0 : this.widgetData.position.x + "px",
      height: inPlace ? "100%" : this.widgetData.height + "px",
      width: inPlace ? "100%" : this.widgetData.width + "px",
      position: inPlace ? "relative" : "absolute",
      // TODO: revisit this logic/align with active widget in state?
      "z-index": this.inFocus ? 100 : 50
    }
  }

  public get widgetClass() {
    return {
      "shadow-lg": !this.widgetData.docked,
      "rounded-md": !this.widgetData.docked,
      "bg-opacity-95": !this.widgetData.docked,
      "shadow-sm": this.widgetData.docked,
      "border-1 border-pink-300 dark:border-yellow-800":
        !this.widgetData.docked && !this.trackPosition,
      "border-2 border-green-300 dark:border-yellow-400":
        this.trackPosition || this.trackSize
      // hidden: !this.widgetData.open
    }
  }

  // Toggles
  public closeWidget() {
    grid.toggleWidget(this.widgetData)
  }

  public dockWidget() {
    // record the zone size before/after un/re-docking
    if (this.widgetData.docked) {
      this.setToCurrent()
      grid.toggleDocked(this.widgetData)
    } else {
      grid.toggleDocked(this.widgetData)
    }
  }

  // Functions to modify display
  public updateSize(e: MouseEvent) {
    e.preventDefault()
    let startWidth!: number, startHeight!: number

    // initialize values
    if (this.sizeStart == null) {
      this.sizeStart = {
        x: e.pageX,
        y: e.pageY
      }
    }

    // initialize size if it is still 0
    if (!this.widgetData.height || !this.widgetData.width) {
      const { height, width } = this.getCurrentRect()
      startHeight = height
      startWidth = width
    } else {
      startHeight = this.widgetData.height
      startWidth = this.widgetData.width
    }

    const el = this.$el as HTMLElement

    const newHeight = Math.min(
      this.gridSize.height - 8,
      startHeight + e.pageY - this.sizeStart.y
    )
    const newWidth = Math.min(
      this.gridSize.width - el.offsetLeft + 40,
      startWidth + e.pageX - this.sizeStart.x
    )
    grid.setWidgetSize({
      widget: this.widgetData,
      setZone: this.widgetData.docked,
      newHeight,
      newWidth
    })

    this.sizeStart = {
      x: e.pageX,
      y: e.pageY
    }
  }

  public updatePosition(e: MouseEvent) {
    e.preventDefault()
    let startY!: number, startX!: number

    if (this.posStart == null) {
      this.posStart = {
        x: e.pageX,
        y: e.pageY
      }
    }

    if (!this.widgetData.position.x || !this.widgetData.position.y) {
      const { x, y } = this.getCurrentRect()
      startX = x
      startY = y
    } else {
      startX = this.widgetData.position.x
      startY = this.widgetData.position.y
    }
    // offset not including parent padding for x?
    const remainingX =
      this.gridSize.width - this.widgetData.width + this.moveIcon.offsetLeft + 8

    const remainingY = this.gridSize.height - this.widgetData.height
    const rawX = startX + e.pageX - this.posStart.x
    const rawY = startY + e.pageY - this.posStart.y

    const newPosition = {
      x: Math.max(48, Math.min(remainingX, rawX)), // 48 to prevent going under menu
      y: Math.max(0, Math.min(remainingY, rawY))
    }
    grid.setWidgetPosition({ name: this.widgetData.name, newPosition })

    this.posStart = {
      x: e.pageX,
      y: e.pageY
    }
  }
}
</script>
