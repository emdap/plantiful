<template>
  <div
    :id="`${widgetData.name}-widget`"
    class="widget flex p-2 bg-white dark:bg-gray-700 outline-none text-gray-600 dark:text-black"
    :style="styleObj"
    :class="classObj"
    tabindex="1"
    @focus="inFocus = true"
    @blur="inFocus = false"
  >
    <main class="flex flex-grow flex-col">
      <nav
        class="flex flex-row h-8 items-center whitespace-nowrap mb-1 sticky left-0 w-full "
      >
        <nav class="flex w-1/2 gap-3">
          <docked-icon
            class="icon"
            v-if="widgetData.docked"
            @click="dockWidget()"
          />
          <not-docked-icon class="icon" v-else @click="dockWidget()" />
          <span ref="move-icon">
            <move-icon class="icon" @mousedown="trackPosition = true" />
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
      <slot></slot>
      <footer class="mt-auto sticky left-0 text-gray-500">
        <resize-icon
          class="icon resize-widget mt-1 ml-auto"
          @mousedown="trackSize = true"
        />
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
import ResizeIcon from "@/assets/icons/resize.svg"

@Component({
  components: {
    CloseIcon,
    DockedIcon,
    NotDockedIcon,
    MoveIcon,
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
    this.setToCurrent()
  }

  public initMouseUpListeners() {
    // stop tracking position/size when mouse is up
    document.addEventListener("mouseup", (e: MouseEvent) => {
      if (this.trackPosition) {
        e.preventDefault()
        this.trackPosition = false
      }
      if (this.trackSize) {
        e.preventDefault()
        this.trackSize = false
      }
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
      if (this.widgetData.docked) {
        this.dockWidget()
      }
      document.addEventListener("mousemove", this.updatePosition)
    } else {
      this.posStart = null
      document.removeEventListener("mousemove", this.updatePosition)
    }
  }

  // Styling getters
  public get styleObj(): Record<string, string | number> {
    // if (!this.widgetData.docked) {
    return {
      top: this.widgetData.docked ? 0 : this.widgetData.position.y + "px",
      left: this.widgetData.docked ? 0 : this.widgetData.position.x + "px",
      height: this.widgetData.docked ? "100%" : this.widgetData.height + "px",
      width: this.widgetData.docked ? "100%" : this.widgetData.width + "px",
      position: this.widgetData.docked ? "relative" : "absolute",
      // TODO: revisit this logic/align with active widget in state?
      "z-index": this.inFocus ? 100 : 50
    }
  }

  public get classObj(): Record<string, boolean> {
    return {
      "shadow-md": !this.widgetData.docked,
      "shadow-sm": this.widgetData.docked,
      "bg-opacity-95": !this.widgetData.docked,
      "outline-green dark:outline-yellow": this.trackPosition || this.trackSize,
      hidden: !this.widgetData.open
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
      grid.toggleDocked(this.widgetData).then(() => {
        this.setToCurrent()
      })
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
      grid.overallHeight - 8,
      startHeight + e.pageY - this.sizeStart.y
    )
    const newWidth = Math.min(
      grid.overallWidth - el.offsetLeft + 40,
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
      grid.overallWidth - this.widgetData.width + this.moveIcon.offsetLeft + 8

    const remainingY = grid.overallHeight - this.widgetData.height
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
