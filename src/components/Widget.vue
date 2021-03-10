<template>
  <div
    class="widget flex p-2 bg-white transition duration-250 ease-in-out outline-green"
    :style="styleObj"
    :class="classObj"
    tabindex="1"
    @focus="inFocus = true"
    @blur="inFocus = false"
  >
    <div v-if="!error" class="flex flex-grow flex-col">
      <div class="move-widget flex flex-row mb-1">
        <button :disabled="widgetState.docked" @click="dockWidget()">
          D
        </button>
        <button @mousedown="trackPosition = true">
          M
        </button>
        <button class="ml-auto" @click="closeWidget()">
          X
        </button>
      </div>
      <slot></slot>
      <div class="ml-auto mt-auto">
        <button class="resize-widget mt-1" @mousedown="trackSize = true">
          V
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  GrowBasis,
  WidgetState,
  Positions,
  Dimensions
} from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import WindowMixin, { window } from "@/mixins/WindowMixin.vue"
import Component from "vue-class-component"
import messages from "@/fixtures/Messages"

@Component({})
// TODO: add some info/instructions for all these props and their effects
export default class Widget extends WindowMixin {
  @Prop({ default: 0 }) initTop!: number | string
  @Prop({ default: 0 }) initLeft!: number | string
  @Prop() initHeight!: number | "full" | "screen"
  @Prop() initWidth!: number | string
  @Prop({ default: 250 }) minHeight!: number
  @Prop({ default: 250 }) minWidth!: number

  public trackPosition = false
  public trackSize = false
  public sizeStartY: null | number = null
  public sizeStartX: null | number = null
  public posStartY: null | number = null
  public posStartX: null | number = null
  public initDocked: null | boolean = null
  // TODO: align this with state
  public inFocus = false

  public styleAttributes: GrowBasis = this.initalizeStyle()

  public initalizeStyle(): GrowBasis {
    return {
      position: {
        top: this.convertSize(this.initTop),
        left: this.convertSize(this.initLeft)
      },
      height: this.convertSize(this.initHeight),
      width: this.convertSize(this.initWidth)
    }
  }

  @Prop() initWidgetState!: WidgetState

  // TODO: add to interfaces & combine with defaultWidget
  // initialize to empty WidgetState so that properties are reactive
  public widgetState: WidgetState = {
    name: "",
    order: -1,
    docked: false,
    open: false,
    inMenu: false
  }
  public error = false

  public mounted() {
    this.addMouseUpListeners()
    this.initializeWidget()
  }

  public initializeWidget() {
    // parent component can register widget first if it needs to track it
    if (!this.getWidget(this.initWidgetState?.name)) {
      if (this.initWidgetState) {
        // otherwise, widget can register itself
        window.registerWidget(this.initWidgetState)
      } else {
        this.error = true
        throw console.error(messages.widget.registerError)
      }
    }

    // update widgetState to be what's in the window store
    this.widgetState = this.getWidget(this.initWidgetState.name) as WidgetState

    // track if it should launch docked, for when user closes/opens
    this.initDocked = this.widgetState.docked
  }

  public addMouseUpListeners() {
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

  @Watch("widgetState.docked")
  dockChanged(docked: boolean) {
    if (!docked) {
      // update position so that won't snap when undocking
      this.setToCurrent("position")
    }
  }

  public setToCurrent(which: "size" | "position") {
    if (which == "size") {
      this.styleAttributes.width = this.$el.getBoundingClientRect().width
      this.styleAttributes.height = this.$el.getBoundingClientRect().height
    }

    if (which == "position") {
      this.styleAttributes.position.top = this.$el.getBoundingClientRect().top
      this.styleAttributes.position.left = this.$el.getBoundingClientRect().left
    }
  }

  public getCurrent(which: Positions | Dimensions): number {
    let current!: number

    if (which == "width") {
      current = this.$el.getBoundingClientRect().width
    }
    if (which == "height") {
      current = this.$el.getBoundingClientRect().height
    }

    if (which == "top") {
      current = this.$el.getBoundingClientRect().top
    }
    if (which == "left") {
      current = this.$el.getBoundingClientRect().left
    }

    return current
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
        window.toggleDocked(this.widgetState)
      }
      document.addEventListener("mousemove", this.updatePosition)
    } else {
      this.posStartY = this.posStartX = null
      document.removeEventListener("mousemove", this.updatePosition)
    }
  }

  public get styleObj(): Record<string, string | number> {
    return {
      top: this.widgetState.docked
        ? 0
        : this.convertSize(this.styleAttributes.position.top),
      left: this.widgetState.docked
        ? 0
        : this.convertSize(this.styleAttributes.position.left),
      height: this.convertSize(this.styleAttributes.height),
      width: this.convertSize(this.styleAttributes.width),
      position: this.widgetState.docked ? "relative" : "absolute"
    }
  }

  public get classObj(): Record<string, boolean> {
    return {
      "shadow-md": !this.widgetState.docked,
      "shadow-sm": this.widgetState.docked,
      "bg-opacity-95": !this.widgetState.docked,
      "z-0": this.widgetState.docked && !this.inFocus,
      "z-10": !this.widgetState.docked || this.inFocus,
      hidden: !this.widgetState.open
    }
  }

  public closeWidget() {
    if (this.widgetState.open) {
      // reset to defaults for when it's next open
      this.styleAttributes = this.initalizeStyle()
      if (this.initDocked != this.widgetState.docked) {
        window.toggleDocked(this.widgetState)
      }
    }
    window.toggleWidget(this.widgetState)
  }

  public dockWidget() {
    window.toggleDocked(this.widgetState)
  }

  public convertSize(convertValue: string | number): string | number {
    switch (typeof convertValue) {
      case "string":
        if (convertValue == "full") {
          return "100%"
        } else if (convertValue == "screen") {
          return "100vh"
        }
        return convertValue as string

      default:
        return `${convertValue}px`
    }
  }

  // TODO: possibly combine below 2 functions? some code duplication
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
