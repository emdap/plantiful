<template>
  <div class="text-left grid grid-cols-2 mb-2 px-8 gap-2 lg:gap-8">
    <strong class="text-right">{{ control.text }}:</strong>
    <template v-if="control.dataType == 'number'">
      <input
        class="control-input dark:bg-gray-300 dark:text-black font-semibold"
        v-model="updatedValue"
        :placeholder="messages.placeholder"
        type="number"
        @focus="allowUpdate = controlList == 'onEntity' || dataKey != 'plants'"
        @blur="allowUpdate = true"
      />
    </template>
    <template
      v-else-if="
        control.dataType == 'color' || control.dataType == 'color-list'
      "
    >
      <color-field
        :colorList="control.dataType == 'color' ? [curValue] : curValue"
        :singular="control.dataType == 'color'"
        :containerId="containerId"
        @add-color="addColor"
        @remove-color="removeColor"
        @set-color-list="setColorList"
      />
    </template>
    <template v-else-if="control.dataType == 'dropdown'">
      <select
        v-model="updatedValue"
        class="control-input dark:bg-gray-300 dark:text-black font-semibold"
      >
        <option v-for="option in control.options" :key="option" :value="option">
          {{ option[0].toUpperCase() + option.substring(1) }}
        </option>
      </select>
    </template>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import ColorField from "@/components/Grow/ColorField.vue"
import { controlMessages } from "@/fixtures/Messages"
import { Prop, Watch } from "vue-property-decorator"
import {
  Control,
  DropdownControl,
  GrowDataKey,
  GrowOptionsType,
  GrowType,
} from "@/store/interfaces"

@Component({
  components: {
    ColorField,
  },
})
export default class ControlField extends Vue {
  @Prop({ required: true }) control!:
    | Control<GrowType | GrowOptionsType>
    | DropdownControl<GrowType | GrowOptionsType>
  @Prop({ required: true }) curValue!: number | string | string[]
  @Prop({ required: true }) dataKey!: GrowDataKey
  // updates on entity can get fired right away, on options wait till input blur
  @Prop({ default: "onEntity" }) controlList!: "onEntity" | "onOptions"
  @Prop({ default: "controls" }) containerId!: string

  public updatedValue = this.curValue
  public showColorPicker = false
  public allowUpdate = true

  public emitUpdate() {
    if (
      this.allowUpdate &&
      this.updatedValue != this.curValue &&
      this.verifyUpdate()
    ) {
      let emitValue = this.updatedValue
      if (
        this.control.dataType == "number" &&
        typeof this.updatedValue == "string"
      ) {
        emitValue = parseInt(this.updatedValue)
        if (isNaN(emitValue)) {
          this.updatedValue = this.curValue
          return // don't update
        }
      }
      this.$emit(
        "value-updated",
        this.dataKey,
        this.control.property,
        emitValue
      )
    }
  }

  public verifyUpdate(): boolean {
    if (!this.control.verify) {
      // no verification needed
      return true
    }
    if (
      this.updatedValue > this.control.verify.upperBound ||
      this.updatedValue < this.control.verify.lowerBound
    ) {
      if (this.updatedValue > this.control.verify.upperBound) {
        this.$toasted.error(
          this.messages.upperBoundError + this.control.verify.upperBound
        )
        this.updatedValue = this.control.verify.upperBound
      } else {
        this.$toasted.error(
          this.messages.lowerBoundError + this.control.verify.lowerBound
        )
        this.updatedValue = this.control.verify.lowerBound
      }
      return false
    }
    return true
  }

  public get messages() {
    return controlMessages
  }

  @Watch("updatedValue")
  public valueUpdated() {
    this.emitUpdate()
  }

  @Watch("allowUpdate")
  public updateAllowed() {
    this.emitUpdate()
  }

  @Watch("curValue")
  public newProp() {
    // changes can happen from outside the controls as well
    this.updatedValue = this.curValue
  }

  // Colors
  public addColor(color: string) {
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
    if (Array.isArray(this.curValue)) {
      this.updatedValue = this.curValue.filter((c, cIndex) => {
        return cIndex != index
      })
    }
  }

  public setColorList(colorList: string[]) {
    if (Array.isArray(this.curValue)) {
      this.updatedValue = colorList
    }
  }
}
</script>
