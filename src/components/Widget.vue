<template>
  <div
    :id="`${widgetData.name}-widget`"
    class="widget flex p-2 bg-white outline-none"
    :style="styleObj"
    :class="classObj"
    tabindex="1"
    @focus="inFocus = true"
    @blur="inFocus = false"
  >
    <main class="flex flex-grow flex-col overflow-auto">
      <nav
        class="flex flex-row h-8 items-center whitespace-nowrap mb-1 sticky left-0 w-full text-gray-500"
      >
        <nav class="flex w-1/2 gap-3">
          <docked-icon
            class="cursor-pointer fill-current text-pink-800 hover:text-green-600"
            v-if="widgetData.docked"
            @click="dockWidget()"
          />
          <not-docked-icon
            class="cursor-pointer fill-current hover:text-green-600"
            v-else
            @click="dockWidget()"
          />
          <span ref="move-icon">
            <move-icon
              class="cursor-pointer fill-current hover:text-green-600"
              :class="{ 'text-green-600': trackPosition }"
              @mousedown="trackPosition = true"
            />
          </span>
        </nav>
        <header
          class="flex flex-grow font-semibold items-center justify-center px-3"
        >
          {{ widgetData.text }}
          <h2></h2>
        </header>
        <nav class="flex w-1/2 justify-end">
          <close-icon
            class="cursor-pointer fill-current hover:text-pink-800"
            @click="closeWidget()"
          />
        </nav>
      </nav>
      <slot></slot>
      <footer class="mt-auto sticky left-0 text-gray-500">
        <resize-icon
          class="resize-widget mt-1 cursor-pointer ml-auto fill-current hover:text-green-600"
          :class="{ 'text-green-600': trackSize }"
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
  public getCurrentRect() {
    const el = this.$el as HTMLElement
    const { width, height, x, y } = el.getBoundingClientRect()
    const offsetX = el.offsetLeft
    const offsetY = el.offsetTop

    return {
      width,
      height,
      x,
      y,
      offsetX,
      offsetY
    }
  }

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
      "outline-green": this.trackPosition || this.trackSize,
      hidden: !this.widgetData.open
    }
  }

  // Toggles
  public closeWidget() {
    grid.toggleWidget(this.widgetData)
  }

  public dockWidget() {
    if (this.widgetData.docked) {
      // set properties to current size/location before undocking
      this.setToCurrent()
    }
    grid.toggleDocked(this.widgetData)
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

    const newHeight = Math.min(
      grid.overallHeight,
      startHeight + e.pageY - this.sizeStart.y
    )
    const newWidth = Math.min(
      grid.overallWidth,
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

<style></style>
