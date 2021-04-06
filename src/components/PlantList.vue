<template>
  <div id="search-results" ref="plant-list" class="flex-grow overflow-auto">
    <div
      v-for="(plant, index) in plantList"
      :key="`plant ${index}`"
      class="mb-2 px-4 py-2 text-left h-22 grid grid-cols-3 gap-2 items-center"
      :class="
        plantListLoading
          ? 'text-gray-300 cursor-wait'
          : 'hover:bg-green-200 hover:tracking-wide transition-text'
      "
    >
      <div
        class="col-span-2 cursor-pointer flex items-center"
        @click="optionClicked($event, plant.id, 'show-active')"
      >
        <img
          v-if="plant.image_url"
          :src="plant.image_url"
          class="w-20 h-20 inline-block mr-2"
          :class="{ 'opacity-30': plantListLoading }"
        />
        <span class="inline-block">
          <h3>
            {{ plant.common_name }}
          </h3>
          <h5>
            {{ plant.scientific_name }}
          </h5>
        </span>
      </div>
      <div class="inline-block col-span-1 text-right">
        <span
          v-for="option of plantListOptions"
          :key="option.action"
          :title="option.text"
          class="ml-4 fill-current"
          :class="
            plantLoading || plantListLoading
              ? 'cursor-wait text-gray-300'
              : 'cursor-pointer text-green-600 hover:text-pink-800'
          "
          @click="optionClicked($event, plant.id, option.action)"
        >
          <x :is="option.icon" class="inline" />
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GardenMixin, { garden } from "@/mixins/GardenMixin.vue"
import { Ref, Watch } from "vue-property-decorator"
// import DropDownIcon from "@/assets/icons/drop-down.svg"
import PlantLineIcon from "@/assets/icons/plant-line.svg"
import PopOutIcon from "@/assets/icons/pop-out.svg"

@Component({})
export default class PlantList extends GardenMixin {
  @Ref("plant-list") readonly plantListDiv!: HTMLDivElement

  public plantListOptions = [
    // {
    //   icon: DropDownIcon,
    //   text: "Show more info",
    //   action: "expand-data"
    // },
    {
      icon: PlantLineIcon,
      text: "Grow this plant",
      action: "grow-plant"
    },
    {
      icon: PopOutIcon,
      text: "Show more info",
      action: "show-active"
    }
  ]

  // public selectPlant(id: number) {
  //   if (!this.plantListLoading) {
  //     garden.getOnePlant(id)
  //     this.$emit("show-active")
  //   }
  // }

  public async optionClicked(e: MouseEvent, id: number, option: string) {
    await garden.getOnePlant(id)
    switch (option) {
      case "show-active":
        console.log("emitting show active")
        this.$emit("show-active")
        break
      case "grow-plant":
        this.$emit("grow-plant", e)
        break
    }
  }

  @Watch("plantList")
  public resetScroll() {
    this.plantListDiv.scrollTop = 0
  }
}
</script>
