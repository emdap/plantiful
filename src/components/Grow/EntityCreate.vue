<template>
  <div
    id="entity-create"
    class="overflow-auto scrollbar-light dark:scrollbar-dark h-full"
  >
    <div class="flex flex-wrap pr-4">
      <div
        class="control-wrapper p-2 flex flex-wrap flex-grow justify-center border-b-1 border-gray-200 dark:border-gray-800"
        :class="[
          colorControl(control.property) ? 'w-1/3 pl-2' : 'w-1/4 min-w-max',
          { 'update-field': needsUpdate(control.property) },
        ]"
        v-for="(control, index) in plantControls"
        :key="index"
      >
        <control-field
          containerId="create-entity"
          class="flex-grow max-w-xs"
          :control="control"
          :placeholder="control.placeholder"
          dataKey="plants"
          :curValue="plantValues[control.property]"
          @value-updated="updateProperty"
        />
        <div
          v-if="needsUpdate(control.property)"
          class="text-center font-semibold text-xs self-start whitespace-nowrap w-full"
          :class="colorControl(control.property) ? 'self-center' : ''"
        >
          * Required
        </div>
      </div>
      <div
        class="flex flex-wrap w-full justify-center p-4 items-center border-b-1 border-gray-200 dark:border-gray-800"
      >
        <input
          id="vary-colors"
          type="checkbox"
          class="rounded-sm text-green-400 dark:text-yellow-600"
          v-model="varyColors"
        />
        <label for="vary-colors" class="mx-2 text-sm font-semibold"
          >Vary colors</label
        >
        <button class="btn-help" @click="showHelp = !showHelp">
          {{ showHelp ? "Hide Help" : "Help" }}
        </button>
        <div v-if="showHelp" class="help-box mt-4 w-full">
          Selecting "Vary colors" will generate 3 colors for every color you've
          entered: one that's lighter, one that's darker, and one that's the
          same.
        </div>
      </div>
      <div
        class="h-8 w-full sticky -bottom-1 bg-gradient-to-t from-white dark:from-gray-700 transition-colors"
      />
      <div
        class="w-full -mt-2 z-50 mb-1 justify-center flex items-center bg-white dark:bg-gray-700"
      >
        <button class="btn-light dark:btn-dark mr-2" @click="checkAndGrow">
          Grow your plant!
        </button>
        <button class="btn-red" @click="resetFields">
          Reset Fields
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import ControlField from "@/components/Grow/ControlField.vue"
import ColorField from "@/components/Grow/ColorField.vue"
import controlLists from "@/fixtures/Grow/ControlLists"
import {
  Control,
  CustomGrowPlant,
  GrowDataKey,
  GrowPlant,
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
    dataType: "text",
    placeholder: "Name your plant",
  } as Control<GrowPlant>
  public varyColors = true
  public showHelp = false

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
      if (value != this.emptyValues()[property]) {
        this.failedValidation = this.failedValidation.filter(f => {
          return f != property
        })
      }
    }
    this.plantValues[property] = value
  }

  public async checkAndGrow() {
    let missingVal = false
    const emptyValues = this.emptyValues()
    for (const control of this.plantControls) {
      const typesafeProp = control.property as typeof CustomValues[number]
      if (
        (typeof this.plantValues[typesafeProp] != "number" &&
          !(this.plantValues[typesafeProp] as string | string[]).length) ||
        this.plantValues[typesafeProp] === emptyValues[typesafeProp]
      ) {
        this.failedValidation.push(typesafeProp)
        missingVal = true
      }
    }
    if (missingVal) {
      this.$toasted.error("Please fill in all fields.")
      return
    }
    const newPlant = await grow.growCustomPlant({
      plant: this.plantValues as CustomGrowPlant,
      varyColors: this.varyColors,
    })
    grow.addPlant(newPlant)
    grow.setActivePlant(newPlant.id)
    this.plantValues = this.emptyValues()
  }

  public get colorControl() {
    return (property: string) => {
      return property == "leafColors" || property == "flowerColors"
    }
  }

  public get needsUpdate() {
    return (property: typeof CustomValues[number]) => {
      return this.failedValidation.indexOf(property) != -1
    }
  }

  public resetFields() {
    this.plantValues = this.emptyValues()
    this.failedValidation = []
  }
}
</script>
<style>
.update-field {
  @apply text-red-600 dark:text-red-500;
}

.update-field input {
  @apply bg-red-200 !important;
}
</style>
