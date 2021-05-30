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
    <main class="flex flex-col flex-grow w-full h-full">
      <nav
        class="flex items-center whitespace-nowrap pb-1 overflow-y-hidden w-full scrollbar-light-mini dark:scrollbar-dark-mini overflow-x-auto"
      >
        <nav class="flex">
          <span
            :title="
              widgetData.docked
                ? messages.iconTitles.unDock
                : messages.iconTitles.dock
            "
          >
            <docked-icon
              class="icon mr-2"
              v-if="widgetData.docked"
              @click="dockWidget()"
            />
            <not-docked-icon class="icon mr-2" v-else @click="dockWidget()" />
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
          class="ml-1 flex flex-grow font-semibold text-left px-3 dark:text-black"
        >
          {{ widgetData.text }}
        </header>
        <nav
          class="flex flex-grow justify-end"
          :title="messages.iconTitles.close"
        >
          <close-icon class="icon close" @click="closeWidget()" />
        </nav>
      </nav>
      <section
        class="flex flex-grow scrollbar-light dark:scrollbar-dark overflow-auto p-1 h-full"
      >
        <slot> </slot>
      </section>
      <footer
        class="pb-2 text-gray-500 h-6 overflow-y-hidden scrollbar-light-mini dark:scrollbar-dark-mini"
      >
        <span :title="messages.iconTitles.resize" ref="size-icon">
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
  @Ref("size-icon") sizeIcon!: HTMLElement

  public trackPosition = false
  public posStart: Position | null = null
  public inFocus = false
  public active = false

  public mounted() {
    document.addEventListener("mouseup", this.mouseUpListener)
    this.moveIcon.addEventListener("touchstart", this.touchMove)
    this.sizeIcon.addEventListener("touchstart", this.touchSize)
    this.moveIcon.addEventListener("touchend", this.touchMove)
    this.sizeIcon.addEventListener("touchend", this.touchSize)
  }

  // TODO: the 'el' and some aspects of touch listening could be moved to an overall mixin that both Grid and Grow extend
  public beforeDestroy() {
    document.removeEventListener("mouseup", this.mouseUpListener)
    const el = this.$el as HTMLElement
    el.removeEventListener("touchend", this.mouseUpListener)
  }

  public mouseUpListener(e: MouseEvent | TouchEvent) {
    if (this.trackPosition) {
      e.preventDefault()
      this.trackPosition = false
    }
    if (this.trackSize) {
      e.preventDefault()
      this.trackSize = false
    }
  }

  public touchMove(e: TouchEvent) {
    e.preventDefault()
    this.trackPosition = e.type == "touchstart"
  }

  public touchSize(e: TouchEvent) {
    e.preventDefault()
    this.trackSize = e.type == "touchstart"
  }

  // public startTouch(tracking: "position" | "size") {
  //   const el = this.$el as HTMLElement
  //   if (tracking == "position") {
  //     this.trackPosition = true
  //   } else {
  //     this.trackSize = true
  //   }
  //   el.addEventListener("touchend", this.mouseUpListener)
  // }

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
        document.addEventListener("touchmove", this.updateWidgetSize)
      }
    } else {
      if (this.widgetData.docked) {
        this.$emit("track-size")
      } else {
        this.sizeStart = null
        document.removeEventListener("mousemove", this.updateWidgetSize)
        document.removeEventListener("touchmove", this.updateWidgetSize)
      }
    }
  }

  @Watch("trackPosition")
  mouseUpdatesPosition(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.updatePosition)
      document.addEventListener("touchmove", this.updatePosition)
      if (this.widgetData.docked) {
        this.setToCurrent()
        grid.zonesTrackMouse(true)
      }
    } else {
      document.removeEventListener("mousemove", this.updatePosition)
      document.removeEventListener("touchmove", this.updatePosition)
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
  public updateWidgetSize(e: MouseEvent | TouchEvent) {
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

  public updatePosition(e: MouseEvent | TouchEvent) {
    let event!: MouseEvent | Touch
    if (e instanceof MouseEvent) {
      e.preventDefault()
      event = e
    } else {
      event = e.touches[0] || e.changedTouches[0]
    }

    let startY!: number, startX!: number
    const { pageX, pageY } = event

    if (this.posStart == null) {
      this.posStart = {
        x: pageX,
        y: pageY,
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
      16

    const remainingY = this.gridSize.height - this.widgetData.size.height
    const rawX = startX + pageX - this.posStart.x
    const rawY = startY + pageY - this.posStart.y

    const newPosition = {
      x: Math.max(48, Math.min(remainingX, rawX)), // 48 to prevent going under menu
      y: Math.max(0, Math.min(remainingY, rawY)),
    }
    grid.setWidgetPosition({ name: this.widgetData.name, newPosition })

    this.posStart = {
      x: pageX,
      y: pageY,
    }
  }
}
</script>
