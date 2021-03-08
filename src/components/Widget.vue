<template>
  <div
    class="widget flex p-2 bg-white transition duration-250 ease-in-out outline-green"
    :style="styleObj"
    :class="classObj"
    tabindex="1"
    @focus="inFocus = true"
    @blur="inFocus = false"
  >
    <div class="flex flex-grow flex-col">
      <div class="move-widget flex flex-row mb-1">
        <button :disabled="dock" @click="dock = !dock">
          D
        </button>
        <button
          @mousedown="
            trackPosition = true
            dock = false
          "
        >
          M
        </button>
        <button class="ml-auto" @click="visible = false">
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
import { GrowBasis } from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"
import Vue from "vue"
import Component from "vue-class-component"

@Component({})
export default class Widget extends Vue {
  @Prop({ default: 0 }) initTop!: number
  @Prop({ default: 0 }) initLeft!: number
  @Prop({ default: "full" }) initHeight!: number | "full" | "screen"
  @Prop({ default: "30%" }) initWidth!: number | string
  @Prop({ default: 250 }) minHeight!: number
  @Prop({ default: 250 }) minWidth!: number
  @Prop({ default: true }) docked!: boolean

  public visible = true
  public trackPosition = false
  public trackSize = false
  public sizeStartY: null | number = null
  public sizeStartX: null | number = null
  public posStartY: null | number = null
  public posStartX: null | number = null
  public dock = this.docked
  public inFocus = false

  public styleAttributes: GrowBasis = {
    position: {
      top: this.initTop,
      left: this.initLeft
    },
    height: this.initHeight,
    width: this.initWidth
  }

  public get styleObj(): Record<string, string> {
    return {
      top: this.dock ? `0` : `${this.styleAttributes.position.top}px`,
      left: this.dock ? `0` : `${this.styleAttributes.position.left}px`,
      height: this.convertSize("height"),
      width: this.convertSize("width"),
      position: this.dock ? "relative" : "absolute"
    }
  }

  public get classObj(): Record<string, boolean> {
    return {
      "shadow-md": !this.dock,
      "shadow-sm": this.dock,
      "bg-opacity-95": !this.dock,
      "z-0": this.dock && !this.inFocus,
      "z-10": !this.dock || this.inFocus
    }
  }

  public get moveButtonLocation() {
    const moveButton = this.$refs.moveButton as HTMLElement
    return {
      top: moveButton.offsetTop + moveButton.getBoundingClientRect().height / 2,
      left: moveButton.offsetLeft + moveButton.getBoundingClientRect().width / 2
    }
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

  public mounted() {
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
      document.addEventListener("mousemove", this.updatePosition)
    } else {
      this.posStartY = this.posStartX = null
      document.removeEventListener("mousemove", this.updatePosition)
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

  @Watch("dock")
  dockChanged(docked: boolean) {
    if (!docked) {
      // update position so that won't snap when undocking
      this.styleAttributes.position.top = this.$el.getBoundingClientRect().top
      this.styleAttributes.position.left = this.$el.getBoundingClientRect().left
    }
  }
}
</script>

<style></style>
