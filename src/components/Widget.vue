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
        class="-mx-2 flex flex-row h-8 items-center whitespace-nowrap mb-1 sticky left-0 w-full text-gray-500"
      >
        <nav class="flex px-2 w-1/2 gap-3">
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

  // public minHeight = 0
  // public minWidth = 0
  // public flexGrow = false
  // public showOverflow = false
  public trackPosition = false
  public trackSize = false
  public sizeStart: Position | null = null
  public posStart: Position | null = null
  // public sizeStartY: null | number = null
  // public sizeStartX: null | number = null
  // public posStartY: null | number = null
  // public posStartX: null | number = null
  public inFocus = false

  // initialize so that user-modifiable properties are reactive
  // public styleAttributes: WidgetBasis = this.initStyle

  public mounted() {
    // this.initializeWidget()
    this.initMouseUpListeners()
    this.setToCurrent()
    // this.styleAttributes = this.initStyle
  }

  // Initializers
  // public setToCurrent() {
  //   const { width, height, x, y } = this.$el.getBoundingClientRect()
  //   grid.setWidgetPosition({
  //     name: this.widgetData.name,
  //     newPosition: { x, y }
  //   })

  // if (this.widgetData.currentZone) {
  //   const zoneElem = document.getElementById(
  //     "z-" + this.widgetData.currentZone
  //   )
  //   if (zoneElem instanceof HTMLElement) {
  //     const { width, height, x, y } = zoneElem.getBoundingClientRect()
  //     // grid.setWidgetSize({
  //     //   name: this.widgetData.name,
  //     //   newHeight: height,
  //     //   newWidth: width
  //     // })
  //     grid.setWidgetPosition({
  //       name: this.widgetData.name,
  //       newPosition: {
  //         x,
  //         y
  //       }
  //     })
  //   }
  // assign default values where needed from initDisplay/entity props
  // }
  // if (this.widgetData.display.minHeight) {
  //   this.minHeight = this.widgetData.display.minHeight
  // }
  // if (this.widgetData.display.minWidth) {
  //   this.minWidth = this.widgetData.display.minWidth
  // }
  // if (this.widgetData.display.flexGrow) {
  //   this.flexGrow = this.widgetData.display.flexGrow
  // }
  // if (this.widgetData.display.showOverflow) {
  //   this.showOverflow = this.widgetData.display.showOverflow
  // }
  // }

  // public get initStyle(): WidgetBasis {
  //   return {
  //     position: {
  //       top: this.convertSize(this.widgetData.position.y),
  //       left: this.convertSize(this.widgetData.position.x)
  //     },
  //     height: this.convertSize(this.widgetData.height, "height"),
  //     width: this.convertSize(this.widgetData.width, "width"),
  //     zIndex: 10
  //   }
  // }

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

  // public convertSize(
  //   convertValue: string | number | undefined,
  //   dimension: Dimensions | undefined = undefined
  // ): string | number {
  //   switch (typeof convertValue) {
  //     case "string":
  //       if (convertValue == "full") {
  //         return "100%"
  //       } else if (convertValue == "screen") {
  //         return dimension == "width" ? "100vw" : "100vh"
  //       }
  //       return convertValue as string
  //     case "undefined":
  //       return ""
  //     default:
  //       return `${convertValue}px`
  //   }
  // }

  // public setToCurrent(which: "size" | "position") {
  //   // set properties to the current actual values of the element in the DOM
  //   if (!this.inDOM()) {
  //     // all properties are 0, likely isn't rendered in DOM fully yet
  //     return
  //   }
  //   if (which == "size") {
  //     const newHeight = this.getCurrent("height")
  //     const newWidth = this.getCurrent("width")
  //     // grid.setWidgetSize({name: this.widgetData.name, newHeight, newWidth})
  //     grid.setWidgetSize({ widget: this.widgetData, newHeight, newWidth })
  //   }
  //   if (which == "position") {
  //     const newPosition = {
  //       x: this.getCurrent("left"),
  //       y: this.getCurrent("top")
  //     }
  //     grid.setWidgetPosition({ name: this.widgetData.name, newPosition })
  //   }
  // }

  // public inDOM() {
  //   // getBoundingClientRect doesn't return a proper object
  //   const {
  //     top,
  //     right,
  //     bottom,
  //     left,
  //     width,
  //     height,
  //     x,
  //     y
  //   } = this.$el.getBoundingClientRect()
  //   const rec = { top, right, bottom, left, width, height, x, y }
  //   for (const value of Object.values(rec)) {
  //     if (value != 0) {
  //       return true
  //     }
  //   }
  //   return false
  // }

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

  // Watchers
  // @Watch("widgetData.isDocked")
  // dockChanged(docked: boolean) {
  //   if (!docked) {
  //     // update size/position so that won't snap when undocking
  //     this.setToCurrent("position")
  //     this.setToCurrent("size")
  //   }
  // }

  // @Watch("widgetData.open")
  // openChanged(open: boolean) {
  //   // reset to defaults so that reverts when next opened
  //   if (!open) {
  //     // this.styleAttributes = this.initStyle
  //     grid.resetWidget(this.widgetData)
  //   }
  // }

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
    // } else {
    //   // height/width start off at 0 when docked, before any user-resizing
    //   return {
    //     height: this.widgetData.height ? this.widgetData.height + "px" : "100%",
    //     width: this.widgetData.width ? this.widgetData.width + "px" : "100%",
    //     position: "relative"
    //   }
    // }
  }

  public get classObj(): Record<string, boolean> {
    return {
      // "flex-grow": this.flexGrow && this.widgetData.docked,
      // "overflow-hidden": !this.showOverflow,
      // "overflow-auto": this.showOverflow,
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

  public setToCurrent(which?: "size" | "position") {
    const { height, width, x, y } = this.getCurrentRect()
    if (!which || which == "size") {
      grid.setWidgetSize({
        widget: this.widgetData,
        setZone: false,
        newHeight: height,
        newWidth: width
      })
    }
    if (!which || which == "position") {
      grid.setWidgetPosition({
        name: this.widgetData.name,
        newPosition: { x, y }
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

    // if (
    //   !this.widgetData.width ||
    //   typeof this.widgetData.width == "string"
    // ) {
    //   startWidth = this.getCurrent("width")
    // } else {
    //   startWidth = this.widgetData.width
    // }
    // if (
    //   !this.widgetData.height ||
    //   typeof this.widgetData.height == "string"
    // ) {
    //   startHeight = this.getCurrent("height")
    // } else {
    //   startHeight = this.styleAttributes.height
    // }

    // // set new size
    // this.styleAttributes.width = Math.max(
    //   this.minWidth,
    //   startWidth + e.pageX - this.sizeStartX
    // )
    // this.styleAttributes.height = Math.max(
    //   this.minHeight,
    //   startHeight + e.pageY - this.sizeStartY
    // )
    // initialize size if it is still 0
    if (!this.widgetData.height || !this.widgetData.width) {
      const { height, width } = this.getCurrentRect()
      startHeight = height
      startWidth = width
    } else {
      startHeight = this.widgetData.height
      startWidth = this.widgetData.width
    }

    // TODO: add constraints to newHeight/width, based either on the widget itself, or constraints of zone?
    const newHeight = Math.min(
      grid.overallHeight,
      startHeight + e.pageY - this.sizeStart.y
    )
    const newWidth = Math.min(
      grid.overallWidth,
      startWidth + e.pageX - this.sizeStart.x
    )
    // grid.setWidgetSize({name: this.widgetData.name, newHeight, newWidth})
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
    const remainingX =
      grid.overallWidth - this.widgetData.width + this.moveIcon.offsetLeft
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
