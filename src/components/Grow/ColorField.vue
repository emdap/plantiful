<template>
  <div class="w-full relative">
    <div class="flex">
      <div class="align-top">
        <input
          class="control-input w-full"
          v-model="userEnteredColor"
          @keyup.enter="addColor()"
          type="string"
        />
      </div>
      <div class="flex flex-grow align-middle items-center -mr-4">
        <button @click="addColor()" class="py-1 text-sm" :disabled="!allowAdd">
          {{ singular ? "Set" : "Add" }}
        </button>
        <div
          @click="launchColorPicker(true)"
          class="cursor-pointer h-6 w-6 text-green-600 hover:text-pink-400 fill-current"
          title="Open color picker"
        >
          <x :is="popOutIcon" height="100%" width="100%" viewBox="0 0 30 30" />
        </div>
      </div>
    </div>
    <div
      class="col-span-2 my-2 w-100"
      :class="{ '-ml-full text-center': !singular }"
    >
      <div
        v-for="(color, index) in colorList"
        :key="index"
        class="p-1 inline-block mr-2 cursor-pointer text-right shadow-sm"
        :class="singular ? 'w-full h-9' : 'w-9 h-6 my-2'"
        title="Adjust color"
        @click.self="adjustColor(color, index)"
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
      v-if="showColorPicker"
      ref="color-picker"
      class="absolute bg-white shadow-md z-50 transition-all"
      :style="colorPickerPos"
    >
      <chrome :value="colorPickerStart" @input="pickerInput" />
      <div class="flex gap-1">
        <button
          @click="launchColorPicker(false)"
          class="bg-gray-100 font-semibold hover:text-green-500 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button @click="addFromPicker()" class="btn-primary flex-grow">
          {{ adjustIndex > -1 || singular ? "Update" : "Add" }}
        </button>
        <button
          @click="addFromPicker(true)"
          v-if="adjustIndex > -1 && !singular"
          class="btn-primary flex-grow"
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
import { Prop, Ref, Watch } from "vue-property-decorator"
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
    PopOutIcon
  }
})
export default class ColorField extends Vue {
  @Prop({ required: true }) colorList!: string[]
  @Prop({ default: false }) singular!: boolean
  @Ref("color-picker") colorPicker!: HTMLDivElement

  public closeIcon = CloseIcon
  public popOutIcon = PopOutIcon

  public userEnteredColor = ""
  public adjustIndex = -1

  public defaultColor: RGBObj = { r: 0, g: 0, b: 0, a: 1 }
  public colorPickerStart = this.defaultColor
  public colorPickerPick = this.defaultColor
  public showColorPicker = false

  public colorPickerPos = { top: "", right: 0 }
  public controlContainer = document.getElementById("controls")
  public firstClick = true

  public beforeDestroy() {
    this.removePickerListeners()
  }

  // Emitters
  public addColor() {
    const newColor = colorConverter
      .fromString(this.userEnteredColor)
      ?.toRgbaArray()
    if (!newColor) {
      // TODO: error toast
      console.error(
        "Not a valid color name! Please try again, or use the color picker"
      )
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

  public adjustColor(color: string, index: number) {
    this.adjustIndex = index
    this.colorPickerStart = this.colorToObj(color)
    // pickerPick won't be updated otherwise until user changes it
    this.colorPickerPick = this.colorPickerStart
    this.launchColorPicker(true)
  }

  public launchColorPicker(show: boolean) {
    this.showColorPicker = show
    if (show) {
      this.firstClick = true
      this.updateColorPickerPos()
      document.addEventListener("click", this.closePicker)
      if (this.controlContainer) {
        this.controlContainer.addEventListener(
          "scroll",
          this.updateColorPickerPos
        )
      }
    } else {
      this.removePickerListeners()
      this.adjustIndex = -1
    }
  }

  public updateColorPickerPos() {
    if (this.$el instanceof HTMLElement && this.showColorPicker) {
      // the picker is styled to be ~110% of 225px high
      const pickerHeight = 247.5
      const scrollTop = this.controlContainer
        ? this.controlContainer.scrollTop
        : 0
      const scrollBottom =
        scrollTop +
        (this.controlContainer
          ? this.controlContainer.getBoundingClientRect().height
          : 0)
      let topDist = 0
      // TODO: why 30/60 px??? :'(
      if (scrollBottom - scrollTop > pickerHeight + 60) {
        if (this.$el.offsetTop + 60 < scrollBottom) {
          const toTop = this.$el.offsetTop - scrollTop
          const margin = (scrollBottom - this.$el.offsetTop) / 2
          topDist = toTop > margin ? margin - pickerHeight + 30 : -toTop + 60
        } else {
          topDist = scrollBottom - this.$el.offsetTop - pickerHeight
        }
      }
      this.colorPickerPos.top = topDist + "px"
    }
  }

  public closePicker(e: MouseEvent) {
    if (
      !this.firstClick &&
      e.target instanceof Element &&
      e.target != this.colorPicker &&
      !this.colorPicker.contains(e.target)
    ) {
      this.launchColorPicker(false)
    }
    this.firstClick = false
  }

  public removePickerListeners() {
    if (this.controlContainer) {
      this.controlContainer.removeEventListener(
        "scroll",
        this.updateColorPickerPos
      )
    }
    document.removeEventListener("click", this.closePicker)
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
      a: 1
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
