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
    <main class="pr-6">
      <div
        class="w-full text-center p-4 border-b-1 border-gray-200 dark:border-gray-800"
      >
        <button
          class="bg-green-400 hover:bg-green-500 text-white dark:bg-green-600 dark:hover:bg-green-500 m-1"
          @click="growRandomPlant"
        >
          Grow random plant
        </button>
        <button
          class="bg-pink-400 hover:bg-pink-500 text-white dark:bg-pink-500 dark:hover:bg-pink-400 m-1"
          @click="randomizeFields"
        >
          Randomize fields
        </button>
      </div>
      <div class="flex flex-wrap min-w-min form-row-size mx-auto">
        <div
          class="flex flex-wrap flex-grow justify-center my-2"
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
      </div>
      <div
        class="flex w-full justify-center p-4 items-center border-b-1 border-t-1 border-gray-200 dark:border-gray-800"
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
      </div>
      <!-- <div class="fade-bar" /> -->
      <div
        class="w-full p-4 justify-center flex items-center bg-white dark:bg-gray-700 border-b-1 border-gray-200 dark:border-gray-800"
      >
        <button class="btn-light dark:btn-dark m-1" @click="checkAndGrow">
          Grow your plant!
        </button>
        <button class="btn-red m-1" @click="resetFields">
          Reset Fields
        </button>
      </div>
      <div class="my-4">
        <div v-if="showHelp" class="help-box mt-4 w-full">
          <ul class="list-disc pl-6">
            <li>
              <strong>Grow random plant:</strong> Will randomize all fields, and
              grow the subsequent plant.
              <p>
                <strong>Note:</strong> if all fields are already filled in
                correctly, this button will grow a plant using those values.
              </p>
            </li>
            <li>
              <strong>Randomize fields:</strong> Adds random values to all
              fields, without growing the plant after.
            </li>
            <li>
              <strong>Spread:</strong> This controls the width of the plant. The
              field in the Trefle API is labelled 'Spread', and is measured in
              cm.
            </li>
            <li>
              <strong>Vary colors:</strong> Selecting this will generate 3
              colors for every color you've entered: one that's lighter, one
              that's darker, and one that's the same.
            </li>
          </ul>
        </div>
        <button class="btn-help" @click="showHelp = !showHelp">
          {{ showHelp ? "Hide Help" : "Help" }}
        </button>
      </div>
    </main>
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
    text: "Name",
    dataType: "text",
    placeholder: "Name your plant",
  } as Control<GrowPlant>
  public varyColors = true
  public showHelp = false

  public plantControls = this.usePlantControls()
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

  public usePlantControls() {
    return controlLists.plantControls
      .filter(c => {
        return c.propertyOn == "options" || c.property == "name"
      })
      .sort(controlLists.sortControlList)
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

  public updateProperty(payload: {
    property: typeof CustomValues[number]
    newValue: number | string | string[]
  }) {
    const { property, newValue } = payload
    if (this.failedValidation.indexOf(property) != -1) {
      if (newValue != this.emptyValues()[property]) {
        this.failedValidation = this.failedValidation.filter(f => {
          return f != property
        })
      }
    }
    this.plantValues[property] = newValue
  }

  public continueDelete() {
    this.deleteOldestPlant()
    this.checkAndGrow()
    this.showModal = false
  }

  public validate(): { pass: boolean; missing: typeof CustomValues[number][] } {
    const result = {
      pass: true,
      missing: [] as typeof CustomValues[number][],
    }
    const emptyValues = this.emptyValues()
    for (const control of this.plantControls) {
      const typesafeProp = control.property as typeof CustomValues[number]
      if (
        (typeof this.plantValues[typesafeProp] != "number" &&
          !(this.plantValues[typesafeProp] as string | string[]).length) ||
        this.plantValues[typesafeProp] === emptyValues[typesafeProp]
      ) {
        result.missing.push(typesafeProp)
        result.pass = false
      }
    }
    return result
  }

  public async checkAndGrow(checkValues = true) {
    if (checkValues) {
      const validateResult = this.validate()
      if (!validateResult.pass) {
        this.failedValidation = validateResult.missing
        this.$toasted.error("Please fill in all fields.")
        return
      }
    }

    // TODO: should intelligently delete plants until branch limit is satisfied.
    // Will need way to compute how many branches new plant will have
    if (!this.showModal && this.overBranchLimit) {
      this.showModal = true
      return
    }

    const basePlant = await garden.newCustomPlant(
      this.plantValues as CustomGrowPlant
    )
    this.growPlant(basePlant, this.varyColors)
    this.plantValues = this.emptyValues()
  }

  public growRandomPlant() {
    if (this.validate().pass) {
      return this.checkAndGrow(false)
    }
    this.randomizeFields()
    this.checkAndGrow()
  }

  public randomizeFields() {
    const heightBound = controlLists.plantControls.find(c => {
      return c.property == "height"
    })?.verify?.upperBound
    const spreadBound = controlLists.plantControls.find(c => {
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

    this.failedValidation = []
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

.form-row-size {
  @apply max-w-6xl;
}
</style>
