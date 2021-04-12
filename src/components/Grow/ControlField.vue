<template>
  <div class="text-left grid grid-cols-2 mb-2 px-8 gap-2 lg:gap-8">
    <strong class="text-right">{{ control.text }}:</strong>
    <template v-if="control.dataType == 'number'">
      <input
        class="control-input"
        v-model="updatedValue"
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
        @add-color="addColor"
        @remove-color="removeColor"
        @set-color-list="setColorList"
      />
    </template>
    <template v-else-if="control.dataType == 'dropdown'">
      <select v-model="updatedValue" class="control-input">
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
import { Prop, Watch } from "vue-property-decorator"
import {
  Control,
  DropdownControl,
  GrowDataKey,
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
  @Prop({ required: true }) dataKey!: GrowDataKey
  // updates on entity can get fired right away, on options wait till input blur
  @Prop({ required: true }) controlList!: "onEntity" | "onOptions"

  public updatedValue = this.curValue
  public showColorPicker = false
  public allowUpdate = true

  public emitUpdate() {
    if (this.allowUpdate && this.updatedValue != this.curValue) {
      let emitValue = this.updatedValue
      if (
        this.control.dataType == "number" &&
        typeof this.updatedValue == "string"
      ) {
        emitValue = parseInt(this.updatedValue)
      }
      this.$emit(
        "value-updated",
        this.dataKey,
        this.control.property,
        emitValue
      )
    }
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
      console.log("add color 1")
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
