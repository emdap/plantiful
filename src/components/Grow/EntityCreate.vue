<template>
  <div
    id="create-entity"
    class="overflow-auto scrollbar-light dark:scrollbar-dark"
  >
    <control-field
      v-for="(control, index) in plantControls"
      :key="index"
      containerId="create-entity"
      :control="control"
      dataKey="plants"
      :curValue="plantValues[control.property]"
      @value-updated="updateProperty"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import ControlField from "@/components/Grow/ControlField.vue"
import ColorField from "@/components/Grow/ColorField.vue"
import controlLists from "@/fixtures/Grow/ControlLists"
import { ControlList, GrowDataKey, GrowPlant } from "@/store/interfaces"

const CustomValues = [
  "height",
  "spread",
  "leafColors",
  "flowerColors",
  "leafTexture",
] as const

@Component({
  components: {
    ControlField,
    ColorField,
  },
})
export default class EntityCreate extends GrowMixin {
  public plantControls = controlLists.plantOptionsControls
  public plantValues = this.emptyValues() as {
    [key in typeof CustomValues[number]]: number | string | string[]
  }

  public emptyValues() {
    return {
      height: 1,
      spread: 1,
      leafColors: [] as string[],
      flowerColors: [] as string[],
      leafTexture: "",
    }
  }

  public updateProperty(
    dataKey: GrowDataKey,
    property: typeof CustomValues[number],
    value: number | string | string[]
  ) {
    this.plantValues[property] = value
  }
}
</script>
