<template>
  <div class="text-left grid grid-cols-2 mb-2 px-8 gap-8">
    <strong class="text-right">{{ control.text }}:</strong>
    <template v-if="control.dataType == 'number'">
      <input
        class="control-input"
        v-model="updatedValue"
        type="number"
        @focus="allowUpdate = false"
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

  public updatedValue = this.curValue
  public showColorPicker = false
  public allowUpdate = true

  @Watch("updatedValue")
  public valueUpdated(newValue: string | number) {
    if (this.allowUpdate && newValue != this.curValue) {
      this.$emit("value-updated", this.dataKey, this.control.property, newValue)
    }
  }

  @Watch("allowUpdate")
  public updateAllowed(canUpdate: boolean) {
    if (canUpdate && this.curValue != this.updatedValue) {
      // TODO: extract duplicated code to new function
      this.$emit(
        "value-updated",
        this.dataKey,
        this.control.property,
        this.updatedValue
      )
    }
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
