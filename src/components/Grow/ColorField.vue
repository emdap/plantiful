<template>
  <div class="flex flex-wrap justify-center">
    <div class="flex flex-wrap items-center justify-center" ref="picker-base">
      <input
        class="control-input w-full dark:bg-gray-300 dark:text-black font-semibold self-center"
        style="max-width: 200px"
        placeholder="Enter color"
        v-model="userEnteredColor"
        @keyup.enter="addColor()"
        type="text"
      />
      <div class="flex align-middle items-center">
        <button
          @click="addColor()"
          class="py-2 text-sm focus:text-green-600 dark:focus:text-yellow-600"
          :class="{ 'dark:text-gray-500': !allowAdd }"
          :disabled="!allowAdd"
        >
          {{ singular ? "Set" : "Add" }}
        </button>
        <div
          @click="launchColorPicker(true, $event)"
          class="icon h-6 w-6"
          title="Open color picker"
        >
          <x :is="popOutIcon" height="100%" width="100%" viewBox="0 -3 30 30" />
        </div>
      </div>
    </div>
    <div
      class="flex flex-wrap justify-center"
      :class="{ 'text-center': !singular, 'mt-1 w-3/4': colorList.length }"
    >
      <div
        v-for="(color, index) in colorList"
        :key="index"
        class="p-1 m-1 inline-block cursor-pointer text-right shadow-sm"
        :class="singular ? 'w-full h-9' : 'w-9 h-6'"
        title="Adjust color"
        @click.self="adjustColor($event, color, index)"
        :style="{ background: color }"
      >
        <div
          v-if="colorList.length > 1"
          class="ml-auto mb-auto w-3 h-6 fill-current"
          @click="removeColor(index)"
          :style="{ color: getTextColor(color) }"
          title="Remove color"
        >
          <x
            :is="closeIcon"
            v-if="allowRemoveColor"
            width="100%"
            height="100%"
            viewBox="5 0 10 40"
          />
        </div>
      </div>
    </div>
    <div
      ref="color-picker"
      v-if="showColorPicker"
      class="absolute rounded-sm p-1 bg-gray-50 dark:bg-gray-800 z-50"
      :style="colorPickerPos"
    >
      <chrome :value="colorPickerStart" @input="pickerInput" />
      <div class="flex gap-1">
        <button
          @click="launchColorPicker(false)"
          class="bg-gray-200 dark:bg-gray-500 font-semibold hover:text-green-500 hover:bg-gray-100 focus:bg-gray-100 dark:hover:bg-gray-400 dark:focus:bg-gray-400 dark:hover:text-green-800 rounded-sm"
        >
          Cancel
        </button>
        <button
          @click="addFromPicker()"
          class="btn-light focus:outline-none dark:btn-dark flex-grow"
        >
          {{ adjustIndex > -1 || singular ? "Update" : "Add" }}
        </button>
        <button
          @click="addFromPicker(true)"
          v-if="adjustIndex > -1 && !singular"
          class="btn-light focus:outline-none dark:btn-dark flex-grow"
        >
          Duplicate
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { Prop, Ref } from "vue-property-decorator"
import { controlMessages } from "@/fixtures/Messages"
import { Chrome } from "vue-color"
import colorConverter from "css-color-converter"
import CloseIcon from "@/assets/icons/close.svg"
import PopOutIcon from "@/assets/icons/pop-out.svg"

type RGBObj = {
  r: number
  b: number
  g: number
  a: number
}

@Component({
  components: {
    Chrome,
    CloseIcon,
    PopOutIcon,
  },
})
export default class ColorField extends Vue {
  @Prop({ required: true }) colorList!: string[]
  @Prop({ default: false }) singular!: boolean
  @Prop({ required: true }) containerId!: string
  @Ref("color-picker") colorPicker!: HTMLDivElement

  public closeIcon = CloseIcon
  public popOutIcon = PopOutIcon

  public userEnteredColor = ""
  public adjustIndex = -1

  public defaultColor: RGBObj = { r: 0, g: 0, b: 0, a: 1 }
  public colorPickerStart = this.defaultColor
  public colorPickerPick = this.defaultColor
  public showColorPicker = false

  public colorPickerPos = { top: "", left: "" }
  public pickerLauncherRect!: DOMRect
  public controlContainer = document.getElementById(this.containerId)

  public beforeDestroy() {
    this.removePickerListeners()
  }

  // Emitters
  public addColor() {
    if (!this.userEnteredColor.length) {
      return
    }
    const newColor = colorConverter
      .fromString(this.userEnteredColor.toLowerCase())
      ?.toRgbaArray()
    if (!newColor) {
      this.$toasted.error(controlMessages.colorError)
      return
    }
    const strColor = `rgba(${newColor[0]}, ${newColor[1]}, ${newColor[2]}, 1)`
    this.$emit("add-color", strColor)
    this.userEnteredColor = ""
  }

  public addFromPicker(duplicate = false) {
    const rgba = this.colorToStr(this.colorPickerPick)
    if (this.adjustIndex > -1 && !duplicate && !this.singular) {
      if (
        this.colorList.length > this.adjustIndex &&
        this.colorList[this.adjustIndex] != rgba
      ) {
        // replace the color in the list, maintain original list order
        const newColorList = this.colorList.map((c, index) => {
          if (index == this.adjustIndex) {
            return rgba
          }
          return c
        })
        this.$emit("set-color-list", newColorList)
      }
    } else {
      this.$emit("add-color", rgba)
    }
    this.launchColorPicker(false)
    this.colorPickerPick = this.defaultColor
  }

  public removeColor(index: number) {
    // TODO: Show 'are you sure?' box
    this.$emit("remove-color", index)
  }

  // Color Picker component helpers
  public pickerInput(color: { rgba: RGBObj }) {
    this.colorPickerPick = color.rgba
  }

  public adjustColor(e: MouseEvent, color: string, index: number) {
    this.adjustIndex = index
    this.colorPickerStart = this.colorToObj(color)
    // pickerPick won't be updated otherwise until user changes it
    this.colorPickerPick = this.colorPickerStart
    this.launchColorPicker(true, e)
  }

  public launchColorPicker(show: boolean, e?: MouseEvent) {
    this.showColorPicker = show
    if (show) {
      document.addEventListener("mousedown", this.closePicker)
      if (
        e?.target instanceof HTMLElement ||
        (e?.target instanceof Element &&
          e.target.parentElement instanceof HTMLElement)
      ) {
        // assigning to rect instead of the element as the values temporarily change after next tick sometimes
        const target =
          e.target instanceof HTMLElement
            ? e.target
            : (e.target.parentElement as HTMLElement)
        this.pickerLauncherRect = target.getBoundingClientRect()
      } else {
        this.pickerLauncherRect = (this
          .$el as HTMLElement).getBoundingClientRect()
      }
      if (this.controlContainer) {
        this.controlContainer.addEventListener("scroll", this.closePicker)
      }
      // wait for the picker to mount before positioning
      this.$nextTick(() => {
        this.updateColorPickerPos()
      })
    } else {
      this.adjustIndex = -1
    }
  }

  public closePicker(e: Event) {
    if (
      e.target instanceof Element &&
      e.target != this.colorPicker &&
      !this.colorPicker?.contains(e.target)
    ) {
      this.launchColorPicker(false)
    }
  }

  public removePickerListeners() {
    if (this.controlContainer) {
      this.controlContainer.removeEventListener("scroll", this.closePicker)
    }
    document.removeEventListener("scroll", this.closePicker)
    document.removeEventListener("mousedown", this.closePicker)
  }

  public updateColorPickerPos() {
    if (this.$el instanceof HTMLElement && this.showColorPicker) {
      const elRect = this.$el.getBoundingClientRect()

      let pickerRect!: { width: number; height: number }
      if (this.colorPicker instanceof HTMLElement) {
        pickerRect = this.colorPicker.getBoundingClientRect()
      } else {
        pickerRect = { height: 285, width: 230 } // approximation -- only used if error in colorpicker mount
      }

      const maxTop = elRect.bottom - pickerRect.height
      const maxLeft = this.pickerLauncherRect.right - pickerRect.width

      const topDist = Math.max(
        10,
        Math.min(maxTop, this.pickerLauncherRect.y - pickerRect.height / 2)
      )
      const leftDist = Math.max(
        10,
        Math.min(maxLeft, this.pickerLauncherRect.right - pickerRect.width / 2)
      )
      this.colorPickerPos = {
        top: topDist + "px",
        left: leftDist + "px",
      }
    }
  }

  // Getters
  public get allowRemoveColor() {
    return this.colorList.length > 1
  }

  public get allowAdd() {
    return this.userEnteredColor != ""
  }

  public get getTextColor() {
    return (color: string) => {
      const splitColor = this.colorToList(color)
      if (!splitColor) {
        return "rgba(0, 0, 0, 1)"
      }
      const sum = splitColor.reduce((prev: number, curr: string) => {
        return prev + parseInt(curr)
      }, 0)
      // if parseInt failed/returned NaN, NaN < 150 will be false -> black text
      return sum / 3 < 150 ? "rgba(255, 255, 255, .8)" : "rgba(0, 0, 0, .8)"
    }
  }

  // Converters
  public colorToObj(color: string) {
    const splitColor = this.colorToList(color)
    if (!splitColor || splitColor.length < 3) {
      return this.defaultColor
    }
    const colorObj = {
      r: parseInt(splitColor[0]),
      g: parseInt(splitColor[1]),
      b: parseInt(splitColor[2]),
      a: 1,
    }
    if (splitColor.length == 4) {
      colorObj.a = parseInt(splitColor[3])
    }
    return colorObj
  }

  public colorToStr(parseColor: RGBObj) {
    const { r, g, b, a } = parseColor
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }

  public colorToList(parseColor: string): false | string[] {
    const dataStart = parseColor.indexOf("(")
    const dataEnd = parseColor.indexOf(")")
    if (dataStart == -1 || dataEnd == -1) {
      return false
    }
    return parseColor.substring(dataStart + 1, dataEnd).split(",")
  }
}
</script>
