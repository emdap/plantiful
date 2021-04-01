<template>
  <div
    :id="`${widgetState.name}-widget`"
    class="widget flex p-2 bg-white outline-none"
    :style="styleObj"
    :class="classObj"
    tabindex="1"
    @focus="inFocus = true"
    @blur="inFocus = false"
  >
    <div class="flex flex-grow flex-col overflow-auto">
      <div class="flex flex-row mb-1 sticky left-0">
        <docked-icon
          class="cursor-pointer mr-3"
          v-if="widgetState.docked"
          @click="dockWidget()"
          style="fill: purple"
        />
        <not-docked-icon
          class="cursor-pointer mr-3"
          v-else
          @click="dockWidget()"
          style="fill: gray"
        />
        <move-icon
          class="cursor-pointer"
          @mousedown="trackPosition = true"
          :style="{ fill: trackPosition ? 'green' : 'gray' }"
        />
        <close-icon class="ml-auto cursor-pointer" @click="closeWidget()" />
      </div>
      <slot></slot>
      <div class="mt-auto sticky left-0">
        <resize-icon
          class="resize-widget mt-1 cursor-pointer ml-auto"
          :style="{ fill: trackSize ? 'green' : 'gray' }"
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
  Dimensions,
  WidgetDisplay,
  DefaultWidget
} from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import ContainerMixin, { container } from "@/mixins/ContainerMixin.vue"
import Component from "vue-class-component"
import messages from "@/fixtures/Messages"
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
  @Prop({ required: true }) initWidgetState!: WidgetEntity
  // can pass in display options, if none, will set to defaults
  @Prop({
    default() {
      return {} as WidgetDisplay
    }
  })
  initDisplay!: WidgetDisplay

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
  public initDocked: null | boolean = null
  // TODO: align this with entity
  public inFocus = false

  // initialize so that user-modifiable properties are reactive
  public styleAttributes: WidgetBasis = this.initStyle
  public widgetState: WidgetEntity = this.initState

  public mounted() {
    this.initializeWidget()
    this.initMouseUpListeners()
  }

  // Initializers
  public initializeWidget() {
    // register if not already
    if (!this.getWidget(this.initWidgetState?.name)) {
      container.registerWidget(this.initWidgetState)
    }

    // update widgetState to be what's in the container store
    this.widgetState = this.getWidget(this.initWidgetState.name) as WidgetEntity

    // assign default values where needed from initDisplay/entity props
    if (this.initDisplay.minHeight) {
      this.minHeight = this.initDisplay.minHeight
    }
    if (this.initDisplay.minWidth) {
      this.minWidth = this.initDisplay.minWidth
    }
    if (this.initDisplay.flexGrow) {
      this.flexGrow = this.initDisplay.flexGrow
    }
    if (this.initDisplay.showOverflow) {
      this.showOverflow = this.initDisplay.showOverflow
    }

    // track if it should launch docked, for when user closes/opens
    this.initDocked = this.widgetState.docked
  }

  public get initStyle(): WidgetBasis {
    return {
      position: {
        top: this.convertSize(this.initDisplay.top),
        left: this.convertSize(this.initDisplay.left)
      },
      height: this.convertSize(this.initDisplay.height, "height"),
      width: this.convertSize(this.initDisplay.width, "width")
    }
  }

  public get initState(): WidgetEntity {
    return {
      name: "",
      ...DefaultWidget
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
    if (which == "size") {
      this.styleAttributes.width = this.getCurrent("width")
      this.styleAttributes.height = this.getCurrent("height")
    }
    if (which == "position") {
      this.styleAttributes.position.top = this.getCurrent("top")
      this.styleAttributes.position.left = this.getCurrent("left")
    }
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
  @Watch("widgetState.docked")
  dockChanged(docked: boolean) {
    if (!docked) {
      // update size/position so that won't snap when undocking
      this.setToCurrent("position")
      this.setToCurrent("size")
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
      if (this.widgetState.docked) {
        container.toggleDocked(this.widgetState)
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
      top: this.widgetState.docked
        ? 0
        : this.convertSize(this.styleAttributes.position.top),
      left: this.widgetState.docked
        ? 0
        : this.convertSize(this.styleAttributes.position.left),
      height: this.convertSize(this.styleAttributes.height, "height"),
      width: this.convertSize(this.styleAttributes.width, "width"),
      position: this.widgetState.docked ? "relative" : "absolute"
    }
  }

  public get classObj(): Record<string, boolean> {
    return {
      "flex-grow": this.flexGrow && this.widgetState.docked,
      "overflow-hidden": !this.showOverflow,
      "overflow-auto": this.showOverflow,
      "shadow-md": !this.widgetState.docked,
      "shadow-sm": this.widgetState.docked,
      "bg-opacity-95": !this.widgetState.docked,
      "z-0": this.widgetState.docked && !this.inFocus,
      "z-10": !this.widgetState.docked || this.inFocus,
      "outline-green": this.trackPosition || this.trackSize,
      hidden: !this.widgetState.open
    }
  }

  // Toggles
  public closeWidget() {
    if (this.widgetState.open) {
      // reset to defaults for when it's next open
      this.styleAttributes = this.initStyle
      if (this.initDocked != this.widgetState.docked) {
        container.toggleDocked(this.widgetState)
      }
    }
    container.toggleWidget(this.widgetState)
  }

  public dockWidget() {
    container.toggleDocked(this.widgetState)
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
