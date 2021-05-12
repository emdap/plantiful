<template>
  <div
    id="create-entity"
    class="overflow-auto scrollbar-light dark:scrollbar-dark flex flex-wrap"
  >
    <div
      class="control-wrapper p-2 border-b-1 border-gray-200 dark:border-gray-800"
      v-for="(control, index) in plantControls"
      :key="index"
      :class="{
        'pl-8':
          control.property == 'leafColors' ||
          control.property == 'flowerColors',
      }"
    >
      <control-field
        containerId="create-entity"
        :control="control"
        :placeholder="control.placeholder"
        dataKey="plants"
        :curValue="plantValues[control.property]"
        @value-updated="updateProperty"
      />
      <div
        v-if="needsUpdate(control.property)"
        class="text-center font-semibold text-xs text-red-600 dark:text-red-500"
      >
        * Required
      </div>
    </div>
    <div class="w-full justify-center flex gap-2">
      <button class="btn-light dark:btn-dark my-4" @click="checkAndGrow">
        Grow your plant!
      </button>
      <button class="btn-red my-4" @click="plantValues = emptyValues()">
        Reset
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import ControlField from "@/components/Grow/ControlField.vue"
import ColorField from "@/components/Grow/ColorField.vue"
import controlLists from "@/fixtures/Grow/ControlLists"
import {
  Control,
  ControlList,
  GrowDataKey,
  GrowPlant,
  Plant,
} from "@/store/interfaces"

const CustomValues = [
  "name",
  "height",
  "spread",
  "leafTexture",
  "leafColors",
  "flowerColors",
] as const

@Component({
  components: {
    ControlField,
    ColorField,
  },
})
export default class EntityCreate extends GrowMixin {
  public plantValues = this.emptyValues() as {
    [key in typeof CustomValues[number]]: number | string | string[]
  }
  public plantNameControl = {
    property: "name",
    text: "Plant Name",
    dataType: "string",
    placeholder: "Name your plant",
  } as Control<GrowPlant>

  public plantControls = [
    this.plantNameControl,
    ...controlLists.plantOptionsControls,
  ]
  public failedValidation = [] as typeof CustomValues[number][]

  public emptyValues() {
    return {
      name: "",
      height: "",
      spread: "",
      leafColors: [] as string[],
      flowerColors: [] as string[],
      leafTexture: "",
    }
  }

  public mounted() {
    this.plantControls = this.plantControls.map(c => {
      if (c.property == "height" || c.property == "spread") {
        return {
          ...c,
          placeholder: `Enter ${c.property}`,
        }
      }
      return c
    })
  }

  public updateProperty(
    _dataKey: GrowDataKey,
    property: typeof CustomValues[number],
    value: number | string | string[]
  ) {
    if (this.failedValidation.indexOf(property) != -1) {
      console.log("in failed", value, this.emptyValues()[property])
      if (value != this.emptyValues()[property]) {
        this.failedValidation = this.failedValidation.filter(f => {
          return f != property
        })
      }
    }
    this.plantValues[property] = value
  }

  public checkAndGrow() {
    let missingVal = false
    const emptyValues = this.emptyValues()
    for (const control of this.plantControls) {
      const typesafeProp = control.property as typeof CustomValues[number]
      if (
        (typeof this.plantValues[typesafeProp] != "number" &&
          !(this.plantValues[typesafeProp] as string | string[]).length) ||
        this.plantValues[typesafeProp] == emptyValues[typesafeProp]
      ) {
        this.failedValidation.push(typesafeProp)
        missingVal = true
      }
    }
    if (missingVal) {
      this.$toasted.error("Please fill in all fields")
      return
    }
  }

  public get needsUpdate() {
    return (property: typeof CustomValues[number]) => {
      return this.failedValidation.indexOf(property) != -1
    }
  }
}
</script>

<style>
.control-wrapper {
  min-width: 200px;
  flex: 0 1 calc(50% - 0.25rem);
}
</style>
