<template>
  <div class="text-left flex flex-wrap justify-center my-2 w-full self-center">
    <template
      v-if="control.dataType != 'color' && control.dataType != 'color-list'"
    >
      <div class="font-medium text-center pb-1 w-1/3 flex-grow self-center">
        {{ control.text }}
      </div>
      <template
        v-if="control.dataType == 'number' || control.dataType == 'text'"
      >
        <input
          class="control-input"
          v-model="updatedValue"
          :placeholder="placeholder"
          :type="control.dataType"
          @keydown.enter="$event.target.blur"
          @focus="allowUpdate = propertyType == 'entity' || dataKey != 'plants'"
          @blur="allowUpdate = true"
        />
        <!-- && control.property != 'name' -->
      </template>
      <template v-else-if="control.dataType == 'dropdown'">
        <select required v-model="updatedValue" class="control-input p-0">
          <option disabled selected value="">Select value</option>
          <option
            class="font-semibold text-black"
            v-for="option in control.options"
            :key="option"
            :value="option"
          >
            {{ option[0].toUpperCase() + option.substring(1) }}
          </option>
        </select>
      </template>
    </template>
    <template v-else>
      <div class="text-center font-medium w-full pb-1">
        {{ control.text }}
      </div>
      <color-field
        :colorList="control.dataType == 'color' ? [curValue] : curValue"
        :singular="control.dataType == 'color'"
        :containerId="containerId"
        @add-color="addColor"
        @remove-color="removeColor"
        @set-color-list="setColorList"
      />
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
  @Prop({ default: null }) propertyOn!: "entity" | "options" | null
  @Prop({ required: true }) curValue!: number | string | string[]
  @Prop({ required: true }) dataKey!: GrowDataKey
  @Prop({ default: "controls" }) containerId!: string

  public updatedValue = this.curValue
  public showColorPicker = false
  public allowUpdate = true
  public placeholder = this.control.placeholder
    ? this.control.placeholder
    : controlMessages.placeholder

  public get propertyType() {
    if (this.control.propertyOn) {
      return this.control.propertyOn
    } else if (this.propertyOn) {
      return this.propertyOn
    }
    throw console.error("Missing prop propertyOn")
  }

  public emitUpdate() {
    if (
      this.allowUpdate &&
      this.updatedValue != this.curValue &&
      this.verifyUpdate()
    ) {
      let newValue = this.updatedValue
      if (
        this.control.dataType == "number" &&
        typeof this.updatedValue == "string"
      ) {
        newValue = parseInt(this.updatedValue)
        if (isNaN(newValue)) {
          this.updatedValue = this.curValue
          return // don't update
        }
      }
      const payload = {
        dataKey: this.dataKey,
        control: this.control,
        property: this.control.property,
        propertyOn: this.propertyType,
        newValue,
      }
      this.$emit("value-updated", payload)
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
<style>
.control-input {
  max-width: 150px;
  min-width: 50px;

  @apply flex-grow shadow-sm px-2 h-8 border-1 border-solid rounded-md dark:bg-gray-300 dark:text-black font-semibold w-2/3 mx-2 !important;
}

.control-input[type="number"],
select {
  @apply pr-1 !important;
}

.control-input:focus {
  @apply ring-2 ring-green-400 dark:ring-green-500 border-transparent !important;
}
</style>
