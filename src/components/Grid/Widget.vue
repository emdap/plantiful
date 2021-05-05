<template>
  <div
    :id="`${widgetData.name}-widget`"
    class="widget flex transition-colors pt-2 px-1 bg-white dark:bg-gray-700 outline-none text-gray-600 dark:text-gray-300 overflow-hidden"
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
          <span
            :title="
              widgetData.docked
                ? messages.iconTitles.unDock
                : messages.iconTitles.dock
            "
          >
            <docked-icon
              class="icon"
              v-if="widgetData.docked"
              @click="dockWidget()"
            />
            <not-docked-icon class="icon" v-else @click="dockWidget()" />
          </span>
          <span
            ref="move-icon"
            :title="
              widgetData.docked
                ? messages.iconTitles.swap
                : messages.iconTitles.move
            "
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
        <nav class="flex w-1/2 justify-end" :title="messages.iconTitles.close">
          <close-icon class="icon close" @click="closeWidget()" />
        </nav>
      </nav>
      <section
        class="flex flex-grow scrollbar-light dark:scrollbar-dark overflow-auto px-1"
      >
        <slot></slot>
      </section>
      <footer
        class="mt-auto pb-2 sticky left-0 text-gray-500 h-6 scrollbar-none"
      >
        <span :title="messages.iconTitles.resize">
          <resize-icon
            height="100%"
            viewBox="-5 0 25 25"
            class="icon resize-widget mt-1 ml-auto"
            @mousedown="trackSize = true"
          />
        </span>
      </footer>
    </main>
  </div>
</template>

<script lang="ts">
import { GridWidget, Position, Size } from "@/store/interfaces"
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
    ResizeIcon,
  },
})
export default class Widget extends GridMixin {
  @Prop({ required: true }) widgetData!: GridWidget
  @Ref("move-icon") moveIcon!: HTMLElement

  public trackPosition = false
  public posStart: Position | null = null
  public inFocus = false
  public active = false

  public mounted() {
    this.initMouseUpListeners()
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

  public setToCurrent() {
    let newSize!: Size
    let newPosition!: Position
    if (this.widgetData.docked && this.widgetData.currentZone) {
      const zone = this.getZone(this.widgetData.currentZone)
      newSize = zone.size
      newPosition = zone.startPoint
    } else {
      const { height, width, x, y } = this.getCurrentRect()
      newSize = { height, width }
      newPosition = { x, y }
    }
    grid.setWidgetSize({
      widget: this.widgetData,
      newSize,
    })
    grid.setWidgetPosition({
      name: this.widgetData.name,
      newPosition,
    })
  }

  public moveToZone() {
    // posStart is recording where the mouse currently is as mouse moves
    const mousePos = this.posStart ? this.posStart : this.widgetData.position
    grid.widgetToClosestZone({ widget: this.widgetData, mousePos })
  }

  public flashActive() {
    this.active = true
    setTimeout(() => {
      this.active = false
      // remove from active if still active
      if (this.activeWidget && this.activeWidget.name == this.widgetData.name) {
        grid.setActiveWidget()
      }
    }, 500)
  }

  // Watchers
  @Watch("trackSize")
  mouseUpdatesSize(track: boolean) {
    if (track) {
      if (this.widgetData.docked) {
        this.$emit("track-size")
      } else {
        document.addEventListener("mousemove", this.updateWidgetSize)
      }
    } else {
      if (this.widgetData.docked) {
        this.$emit("track-size")
      } else {
        this.sizeStart = null
        document.removeEventListener("mousemove", this.updateWidgetSize)
      }
    }
  }

  @Watch("trackPosition")
  mouseUpdatesPosition(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.updatePosition)
      if (this.widgetData.docked) {
        this.setToCurrent()
        grid.zonesTrackMouse(true)
      }
    } else {
      document.removeEventListener("mousemove", this.updatePosition)
      if (this.widgetData.docked) {
        this.moveToZone()
        this.setToCurrent()
        grid.zonesTrackMouse(false)
      }
      this.posStart = null
    }
  }

  @Watch("activeWidget")
  newActiveWidget(active: GridWidget | null) {
    if (active && active.name == this.widgetData.name) {
      this.flashActive()
    }
  }

  // Styling getters
  public get widgetStyle() {
    // dragging from one zone to another -- stay 'docked' in state, but allow movement
    const inPlace = this.widgetData.docked && !this.trackPosition
    return {
      top: inPlace ? 0 : this.widgetData.position.y + "px",
      left: inPlace ? 0 : this.widgetData.position.x + "px",
      height: inPlace ? "100%" : this.widgetData.size.height + "px",
      width: inPlace ? "100%" : this.widgetData.size.width + "px",
      position: inPlace ? "static" : "absolute",
      "z-index": this.inFocus ? 100 : 50,
    }
  }

  public get widgetClass() {
    return {
      "shadow-lg": !this.widgetData.docked,
      "rounded-md": !this.widgetData.docked,
      "shadow-sm": this.widgetData.docked,
      "bg-opacity-95": !this.widgetData.docked && !this.active,
      // "bg-pink-400 dark:bg-yellow-400": !this.widgetData.docked && this.active,
      "bg-opacity-10 dark:bg-opacity-10 bg-pink-400 dark:bg-green-400": this
        .active,
      "border-1 border-pink-300 dark:border-yellow-800":
        !this.widgetData.docked && !this.trackPosition && !this.trackSize,
      "border-1 border-green-300 dark:border-yellow-400":
        this.trackPosition || this.trackSize,
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
  public updateWidgetSize(e: MouseEvent) {
    const el = this.$el as HTMLElement
    const newSize = this.updateSize(e, {
      minimum: {
        height: 100,
        width: 250,
      },
      maximum: {
        // -8 for padding
        height: this.gridSize.height,
        // +48 for sidemenu width, + 8 for padding
        width: this.gridSize.width - el.offsetLeft + 56,
      },
      entity: this.widgetData,
    })

    grid.setWidgetSize({
      widget: this.widgetData,
      newSize,
    })
  }

  public updatePosition(e: MouseEvent) {
    e.preventDefault()
    let startY!: number, startX!: number

    if (this.posStart == null) {
      this.posStart = {
        x: e.pageX,
        y: e.pageY,
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
      this.gridSize.width -
      this.widgetData.size.width +
      this.moveIcon.offsetLeft +
      20

    const remainingY = this.gridSize.height - this.widgetData.size.height
    const rawX = startX + e.pageX - this.posStart.x
    const rawY = startY + e.pageY - this.posStart.y

    const newPosition = {
      x: Math.max(48, Math.min(remainingX, rawX)), // 48 to prevent going under menu
      y: Math.max(0, Math.min(remainingY, rawY)),
    }
    grid.setWidgetPosition({ name: this.widgetData.name, newPosition })

    this.posStart = {
      x: e.pageX,
      y: e.pageY,
    }
  }
}
</script>
