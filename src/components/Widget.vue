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
    <div class="flex flex-grow flex-col overflow-auto">
      <div class="flex flex-row mb-1 sticky left-0 text-gray-500">
        <docked-icon
          class="cursor-pointer mr-3 fill-current text-pink-800 hover:text-green-600"
          v-if="widgetData.isDocked"
          @click="dockWidget()"
        />
        <not-docked-icon
          class="cursor-pointer mr-3 fill-current hover:text-green-600"
          v-else
          @click="dockWidget()"
        />
        <move-icon
          class="cursor-pointer fill-current hover:text-green-600"
          :class="{ 'text-green-600': trackPosition }"
          @mousedown="trackPosition = true"
        />
        <close-icon
          class="ml-auto cursor-pointer fill-current hover:text-pink-800"
          @click="closeWidget()"
        />
      </div>
      <slot></slot>
      <div class="mt-auto sticky left-0 text-gray-500">
        <resize-icon
          class="resize-widget mt-1 cursor-pointer ml-auto fill-current hover:text-green-600"
          :class="{ 'text-green-600': trackSize }"
          @mousedown="trackSize = true"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  WidgetBasis,
  WidgetEntity,
  Positions,
  Dimensions
} from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import ContainerMixin, { container } from "@/mixins/ContainerMixin.vue"
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
export default class Widget extends ContainerMixin {
  @Prop({ required: true }) widgetData!: WidgetEntity

  public minHeight = 0
  public minWidth = 0
  public flexGrow = false
  public showOverflow = false
  public trackPosition = false
  public trackSize = false
  public sizeStartY: null | number = null
  public sizeStartX: null | number = null
  public posStartY: null | number = null
  public posStartX: null | number = null
  public inFocus = false

  // initialize so that user-modifiable properties are reactive
  public styleAttributes: WidgetBasis = this.initStyle

  public mounted() {
    this.initializeWidget()
    this.initMouseUpListeners()
  }

  // Initializers
  public initializeWidget() {
    // assign default values where needed from initDisplay/entity props
    if (this.widgetData.display.minHeight) {
      this.minHeight = this.widgetData.display.minHeight
    }
    if (this.widgetData.display.minWidth) {
      this.minWidth = this.widgetData.display.minWidth
    }
    if (this.widgetData.display.flexGrow) {
      this.flexGrow = this.widgetData.display.flexGrow
    }
    if (this.widgetData.display.showOverflow) {
      this.showOverflow = this.widgetData.display.showOverflow
    }
  }

  public get initStyle(): WidgetBasis {
    return {
      position: {
        top: this.convertSize(this.widgetData.display.top),
        left: this.convertSize(this.widgetData.display.left)
      },
      height: this.convertSize(this.widgetData.display.height, "height"),
      width: this.convertSize(this.widgetData.display.width, "width"),
      zIndex: this.widgetData.order * 10
    }
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

  // Utilities

  public convertSize(
    convertValue: string | number | undefined,
    dimension: Dimensions | undefined = undefined
  ): string | number {
    switch (typeof convertValue) {
      case "string":
        if (convertValue == "full") {
          return "100%"
        } else if (convertValue == "screen") {
          return dimension == "width" ? "100vw" : "100vh"
        }
        return convertValue as string
      case "undefined":
        return ""
      default:
        return `${convertValue}px`
    }
  }

  public setToCurrent(which: "size" | "position") {
    // set properties to the current actual values of the element in the DOM
    if (!this.inDOM()) {
      // all properties are 0, likely isn't rendered in DOM fully yet
      return
    }
    if (which == "size") {
      this.styleAttributes.width = this.getCurrent("width")
      this.styleAttributes.height = this.getCurrent("height")
    }
    if (which == "position") {
      this.styleAttributes.position.top = this.getCurrent("top")
      this.styleAttributes.position.left = this.getCurrent("left")
    }
  }

  public inDOM() {
    for (const data of Object.values(this.$el.getBoundingClientRect())) {
      if (data != 0) {
        return true
      }
    }
    return false
  }

  public getCurrent(which: Positions | Dimensions): number {
    // helper to return current positions/dimensions in DOM
    const el = this.$el as HTMLElement
    let current!: number

    if (which == "width") {
      current = el.getBoundingClientRect().width
    }
    if (which == "height") {
      current = el.getBoundingClientRect().height
    }

    if (which == "top") {
      current = el.offsetTop
    }
    if (which == "left") {
      current = el.offsetLeft
    }

    return current
  }

  // Watchers
  @Watch("widgetData.isDocked")
  dockChanged(docked: boolean) {
    if (!docked) {
      // update size/position so that won't snap when undocking
      this.setToCurrent("position")
      this.setToCurrent("size")
    }
  }

  @Watch("widgetData.open")
  openChanged(open: boolean) {
    // reset to defaults so that reverts when next opened
    if (!open) {
      this.styleAttributes = this.initStyle
    }
  }

  @Watch("trackSize")
  mouseUpdatesSize(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.updateSize)
    } else {
      this.sizeStartY = this.sizeStartX = null
      document.removeEventListener("mousemove", this.updateSize)
    }
  }

  @Watch("trackPosition")
  mouseUpdatesPosition(track: boolean) {
    if (track) {
      if (this.widgetData.isDocked) {
        container.toggleDocked(this.widgetData)
      }
      document.addEventListener("mousemove", this.updatePosition)
    } else {
      this.posStartY = this.posStartX = null
      document.removeEventListener("mousemove", this.updatePosition)
    }
  }

  // Styling getters
  public get styleObj(): Record<string, string | number> {
    return {
      top: this.widgetData.isDocked
        ? 0
        : this.convertSize(this.styleAttributes.position.top),
      left: this.widgetData.isDocked
        ? 0
        : this.convertSize(this.styleAttributes.position.left),
      height: this.convertSize(this.styleAttributes.height, "height"),
      width: this.convertSize(this.styleAttributes.width, "width"),
      position: this.widgetData.isDocked ? "relative" : "absolute",
      "z-index":
        this.inFocus && !this.widgetData.isDocked
          ? 100
          : this.styleAttributes.zIndex
    }
  }

  public get classObj(): Record<string, boolean> {
    const isDocked =
      this.widgetData.isDocked != undefined ? this.widgetData.isDocked : false
    return {
      "flex-grow": this.flexGrow && isDocked,
      "overflow-hidden": !this.showOverflow,
      "overflow-auto": this.showOverflow,
      "shadow-md": !isDocked,
      "shadow-sm": isDocked,
      "bg-opacity-95": !isDocked,
      "outline-green": this.trackPosition || this.trackSize,
      hidden: !this.widgetData.open
    }
  }

  // Toggles
  public closeWidget() {
    container.toggleWidget(this.widgetData)
  }

  public dockWidget() {
    container.toggleDocked(this.widgetData)
  }

  // Functions to modify display
  public updateSize(e: MouseEvent) {
    e.preventDefault()
    let startingWidth!: number, startingHeight!: number

    // initialize values
    if (this.sizeStartY == null || this.sizeStartX == null) {
      this.sizeStartY = e.pageY
      this.sizeStartX = e.pageX
    }

    if (
      !this.styleAttributes.width ||
      typeof this.styleAttributes.width == "string"
    ) {
      startingWidth = this.getCurrent("width")
    } else {
      startingWidth = this.styleAttributes.width
    }
    if (
      !this.styleAttributes.height ||
      typeof this.styleAttributes.height == "string"
    ) {
      startingHeight = this.getCurrent("height")
    } else {
      startingHeight = this.styleAttributes.height
    }

    // set new size
    this.styleAttributes.width = Math.max(
      this.minWidth,
      startingWidth + e.pageX - this.sizeStartX
    )
    this.styleAttributes.height = Math.max(
      this.minHeight,
      startingHeight + e.pageY - this.sizeStartY
    )
    this.sizeStartX = e.pageX
    this.sizeStartY = e.pageY
  }

  public updatePosition(e: MouseEvent) {
    e.preventDefault()
    let startingLeft!: number, startingTop!: number

    if (this.posStartY == null || this.posStartX == null) {
      this.posStartY = e.pageY
      this.posStartX = e.pageX
    }

    if (
      !this.styleAttributes.position.left ||
      typeof this.styleAttributes.position.left == "string"
    ) {
      startingLeft = this.getCurrent("left")
    } else {
      startingLeft = this.styleAttributes.position.left
    }
    if (
      !this.styleAttributes.position.top ||
      typeof this.styleAttributes.position.top == "string"
    ) {
      startingTop = this.getCurrent("top")
    } else {
      startingTop = this.styleAttributes.position.top
    }

    this.styleAttributes.position.left = Math.max(
      0,
      startingLeft + e.pageX - this.posStartX
    )
    this.styleAttributes.position.top = Math.max(
      0,
      startingTop + e.pageY - this.posStartY
    )
    this.posStartX = e.pageX
    this.posStartY = e.pageY
  }
}
</script>

<style></style>
