<template>
  <div class="text-left grid grid-cols-2 mb-2 ">
    <strong class="text-right mr-10">{{ control.text }}:</strong>
    <span v-if="control.dataType == 'number'">
      <input
        class="shadow-md w-4/5 px--2"
        v-model="updatedValue"
        type="number"
      />
    </span>
    <template v-else-if="control.dataType == 'color-list'">
      <input
        class="col-span-1 shadow-md px-2 w-4/5"
        v-model="updatedValue"
        type="string"
      />
      <div class="col-span-2 mx-auto my-2">
        <!-- TODO: this needs to be a tiny box that is closeable (removes color) -->
        <!-- EXTRACT TO COMPONENT! IS REPEATED -->
        <div
          v-for="(color, index) in curValue"
          :key="index"
          class="h-6 w-9 p-1 inline-block mr-2 my-2"
          :style="{ background: color }"
        >
          <div class="text-xs text-right cursor-pointer">X</div>
        </div>
      </div>
    </template>
    <template v-else-if="control.dataType == 'color'">
      <input
        class="col-span-1 shadow-md px-2 w-4/5"
        v-model="updatedValue"
        type="string"
      />
      <!-- TODO: this needs to be a tiny box that is closeable (removes color) -->
      <div class="col-span-2 my-2 px-8">
        <div
          v-for="(color, index) in [curValue]"
          :key="index"
          class="h-6 w-full p-1 inline-block my-2"
          :style="{ background: color }"
        ></div>
      </div>
    </template>
    <span v-else-if="control.dataType == 'dropdown'">
      <select v-model="updatedValue">
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
import { Prop, Watch } from "vue-property-decorator"
import { AnyControl, Control, DropdownControl } from "@/store/interfaces"
import { Chrome } from "vue-color"
import colorConverter from "css-color-converter"

@Component({
  components: {
    Chrome
  }
})
export default class ControlField extends Vue {
  @Prop({ required: true }) control!: Control<any> | DropdownControl<any>
  @Prop({ required: true }) curValue!: number | string | string[]

  public updatedValue = this.setUpdatedValue()
  public showColorPicker = false

  public mounted() {
    this.updatedValue = this.setUpdatedValue()
  }

  public setUpdatedValue() {
    if (
      this.control.dataType == "color-list" ||
      this.control.dataType == "color"
    ) {
      return ""
    } else {
      return this.curValue
    }
  }

  @Watch("updatedValue")
  public valueUpdated(newValue: string | number) {
    this.$emit("value-updated", this.control.property, newValue)
  }

  @Watch("curValue")
  public newProp() {
    // changes can happen from outside the controls as well
    this.updatedValue = this.setUpdatedValue()
  }
}
</script>
