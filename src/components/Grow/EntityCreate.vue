<template>
  <div
    id="entity-create"
    class="overflow-auto scrollbar-light dark:scrollbar-dark h-full"
  >
    <modal
      v-if="showModal"
      @close="showModal = false"
      @continue="continueDelete"
    />
    <div class="flex flex-wrap pr-4">
      <div
        class="w-full text-center p-4 border-b-1 border-gray-200 dark:border-gray-800"
      >
        <button
          class="bg-pink-400 hover:bg-pink-500 text-white dark:bg-yellow-600 dark:hover:bg-yellow-500"
          @click="randomPlant"
        >
          Random plant
        </button>
      </div>
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
      <!-- <div class="fade-bar" /> -->
      <div
        class="w-full p-4 justify-center flex items-center bg-white dark:bg-gray-700"
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
import GrowMixin from "@/mixins/GrowMixin.vue"
import ControlField from "@/components/Grow/ControlField.vue"
import ColorField from "@/components/Grow/ColorField.vue"
import controlLists from "@/fixtures/Grow/ControlLists"
import {
  Control,
  CustomGrowPlant,
  GrowDataKey,
  GrowPlant,
  LeafTextureValues,
} from "@/store/interfaces"
import { garden } from "@/mixins/GardenMixin.vue"
import { RGBObj, colorToStr } from "@/utilities/colorUtil"
import Modal from "@/components/Modal.vue"

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
    Modal,
  },
})
export default class EntityCreate extends GrowMixin {
  public showModal = false

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

  public continueDelete() {
    this.deleteOldestPlant()
    this.checkAndGrow()
    this.showModal = false
  }

  public async checkAndGrow() {
    if (this.overBranchLimit) {
      this.showModal = true
      return
    }
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
    const basePlant = await garden.newCustomPlant(
      this.plantValues as CustomGrowPlant
    )
    this.growPlant(basePlant, this.varyColors)
    this.plantValues = this.emptyValues()
  }

  public randomPlant() {
    const heightBound = controlLists.plantOptionsControls.find(c => {
      return c.property == "height"
    })?.verify?.upperBound
    const spreadBound = controlLists.plantOptionsControls.find(c => {
      return c.property == "spread"
    })?.verify?.upperBound

    if (!heightBound || !spreadBound) {
      this.$toasted.error(
        `Error: missing ${
          !heightBound
            ? !spreadBound
              ? "height and spread controls."
              : "height control."
            : "spread control."
        }`
      )
      return
    }

    const specimenId = Math.random()
      .toString(36)
      .slice(7)
      .toUpperCase()
    const textureIndex = Math.round(Math.random() * 2)
    const leafColors = Math.round(Math.random() * 6)
    const flowerColors = Math.round(Math.random() * 6)
    this.varyColors = Math.round(Math.random()) == 0

    this.plantValues.name = "Specimen " + specimenId
    this.plantValues.height = Math.round(Math.random() * heightBound)
    this.plantValues.spread = Math.round(Math.random() * spreadBound)
    this.plantValues.leafTexture = LeafTextureValues[textureIndex]
    this.plantValues.leafColors = this.createRandomColors(leafColors)
    this.plantValues.flowerColors = this.createRandomColors(flowerColors)

    this.checkAndGrow()
  }

  public createRandomColors(amount: number) {
    const colors = [] as string[]
    for (let i = 0; i <= amount; i++) {
      const color: RGBObj = {
        r: Math.round(Math.random() * 255),
        g: Math.round(Math.random() * 255),
        b: Math.round(Math.random() * 255),
        a: 1,
      }
      colors.push(colorToStr(color))
    }
    return colors
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

.update-field input,
.update-field select {
  @apply bg-red-200 dark:bg-red-200 !important;
}
</style>
