<template>
  <div class="text-left grid grid-cols-2 mb-2 px-8">
    <strong class="text-right mr-10">{{ control.text }}:</strong>
    <template v-if="control.dataType == 'number'">
      <input class="control-input" v-model="updatedValue" type="number" />
    </template>
    <template
      v-else-if="
        control.dataType == 'color' || control.dataType == 'color-list'
      "
    >
      <color-field
        :colorList="control.dataType == 'color' ? [curValue] : curValue"
        :singular="control.dataType == 'color'"
        @add-color="addColor"
        @remove-color="removeColor"
        @set-color-list="setColorList"
      />
    </template>
    <span v-else-if="control.dataType == 'dropdown'">
      <select v-model="updatedValue" class="control-input">
        <option v-for="option in control.options" :key="option" :value="option">
          {{ option[0].toUpperCase() + option.substring(1) }}
        </option>
      </select>
    </span>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import ColorField from "@/components/Grow/ColorField.vue"
import { Prop, Watch } from "vue-property-decorator"
import {
  Control,
  DropdownControl,
  GrowOptionsType,
  GrowType
} from "@/store/interfaces"

@Component({
  components: {
    ColorField
  }
})
export default class ControlField extends Vue {
  @Prop({ required: true }) control!:
    | Control<GrowType | GrowOptionsType>
    | DropdownControl<GrowType | GrowOptionsType>
  @Prop({ required: true }) curValue!: number | string | string[]

  public updatedValue = this.curValue
  public showColorPicker = false

  // public mounted() {
  //   this.updatedValue = this.setUpdatedValue()
  // }

  // public setUpdatedValue() {
  //   if (
  //     this.control.dataType == "color-list" ||
  //     this.control.dataType == "color"
  //   ) {
  //     return ""
  //   } else {
  //     return this.curValue
  //   }
  // }

  @Watch("updatedValue")
  public valueUpdated(newValue: string | number) {
    this.$emit("value-updated", this.control.property, newValue)
  }

  @Watch("curValue")
  public newProp() {
    // changes can happen from outside the controls as well
    this.updatedValue = this.curValue
  }

  // Colors
  public addColor(color: string) {
    console.log("color")
    if (this.control.dataType == "color") {
      this.updatedValue = color
    } else if (
      this.control.dataType == "color-list" &&
      Array.isArray(this.curValue)
    ) {
      this.updatedValue = [...this.curValue, color]
    }
  }

  public removeColor(index: number) {
    console.log("color")
    if (Array.isArray(this.curValue)) {
      this.updatedValue = this.curValue.filter((c, cIndex) => {
        return cIndex != index
      })
    }
  }

  public setColorList(colorList: string[]) {
    console.log("color")
    if (Array.isArray(this.curValue)) {
      this.updatedValue = colorList
    }
  }
}
</script>
