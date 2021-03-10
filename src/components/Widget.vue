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
import { GrowBasis, WidgetState } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import WindowMixin, { window } from "@/mixins/WindowMixin.vue"
import Component from "vue-class-component"
import messages from "@/fixtures/Messages"

@Component({})
// TODO: add some info/instructions for all these props and their effects
export default class Widget extends WindowMixin {
  @Prop({ default: 0 }) initTop!: number
  @Prop({ default: 0 }) initLeft!: number
  @Prop({ default: "full" }) initHeight!: number | "full" | "screen"
  @Prop({ default: "30%" }) initWidth!: number | string
  @Prop({ default: 250 }) minHeight!: number
  @Prop({ default: 250 }) minWidth!: number

  public trackPosition = false
  public trackSize = false
  public sizeStartY: null | number = null
  public sizeStartX: null | number = null
  public posStartY: null | number = null
  public posStartX: null | number = null
  // TODO: align this with state
  public inFocus = false

  public styleAttributes: GrowBasis = {
    position: {
      top: this.initTop,
      left: this.initLeft
    },
    height: this.initHeight,
    width: this.initWidth
  }

  @Prop() initWidgetState!: WidgetState
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
      this.styleAttributes.position.top = this.$el.getBoundingClientRect().top
      this.styleAttributes.position.left = this.$el.getBoundingClientRect().left
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
        window.toggleDocked(this.widgetState)
      }
      document.addEventListener("mousemove", this.updatePosition)
    } else {
      this.posStartY = this.posStartX = null
      document.removeEventListener("mousemove", this.updatePosition)
    }
  }

  public get styleObj(): Record<string, string> {
    return {
      top: this.widgetState.docked
        ? `0`
        : `${this.styleAttributes.position.top}px`,
      left: this.widgetState.docked
        ? `0`
        : `${this.styleAttributes.position.left}px`,
      height: this.convertSize("height"),
      width: this.convertSize("width"),
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
    window.toggleWidget(this.widgetState)
  }

  public dockWidget() {
    window.toggleDocked(this.widgetState)
  }

  public convertSize(which: "height" | "width"): string {
    switch (typeof this.styleAttributes[which]) {
      case "string":
        if (this.styleAttributes[which] == "full") {
          return "100%"
        } else if (this.styleAttributes[which] == "screen") {
          return "100vh"
        }
        return this.styleAttributes[which] as string

      default:
        return `${this.styleAttributes[which]}px`
    }
  }

  // TODO: possibly combine below 2 functions? some code duplication
  public updateSize(e: MouseEvent) {
    e.preventDefault()
    if (this.sizeStartY == null || this.sizeStartX == null) {
      this.sizeStartY = e.pageY
      this.sizeStartX = e.pageX
    }

    // convert to numbers values
    if (typeof this.styleAttributes.height == "string") {
      this.styleAttributes.height = this.$el.getBoundingClientRect().height
    }
    if (typeof this.styleAttributes.width == "string") {
      this.styleAttributes.width = this.$el.getBoundingClientRect().width
    }

    this.styleAttributes.width = Math.max(
      this.minWidth,
      this.styleAttributes.width + e.pageX - this.sizeStartX
    )
    this.styleAttributes.height = Math.max(
      this.minHeight,
      this.styleAttributes.height + e.pageY - this.sizeStartY
    )
    this.sizeStartX = e.pageX
    this.sizeStartY = e.pageY
  }

  public updatePosition(e: MouseEvent) {
    e.preventDefault()

    if (this.posStartY == null || this.posStartX == null) {
      this.posStartY = e.pageY
      this.posStartX = e.pageX
    }

    this.styleAttributes.position.left = Math.max(
      0,
      this.styleAttributes.position.left + e.pageX - this.posStartX
    )
    this.styleAttributes.position.top = Math.max(
      0,
      this.styleAttributes.position.top + e.pageY - this.posStartY
    )
    this.posStartX = e.pageX
    this.posStartY = e.pageY
  }
}
</script>

<style></style>
