<template>
  <div
    id="entity-select"
    class="w-full h-full overflow-auto scrollbar-light dark:scrollbar-dark"
    style="scroll-behavior: smooth"
  >
    <div
      id="entity-select-wrapper"
      class="flex flex-wrap self-start gap-2 mb-2"
    >
      <div
        v-for="(key, index) in iterateDataKeys"
        :key="index"
        class="select-wrapper relative"
      >
        <ul
          role="listbox"
          :tabindex="index + 1"
          @mousedown="toggleDropdown($event, key)"
          @focus="showDropdown = key"
          class="cursor-pointer focus:outline-none bg-green-200 dark:bg-yellow-200"
        >
          <div
            :id="key + '-selected'"
            class="p-2 flex dark:text-black focus:outline-none"
            :class="{
              'text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-300 cursor-not-allowed': disableSelect(
                key
              ).disable,
              'hover:bg-green-300 dark:hover:bg-yellow-400 focus:bg-green-300 dark:focus:bg-yellow-400': !disableSelect(
                key
              ).disable,
              'bg-green-400 dark:bg-yellow-500':
                selected[key] && showDropdown != key,
              'bg-green-300 dark:bg-yellow-400': showDropdown == key,
            }"
          >
            <div v-if="selected[key]">
              <span class="mr-2 font-semibold">
                {{ growDataKeyText(key) }}:
              </span>
              {{ optionText(key, true) }}
            </div>
            <span v-else>
              {{ disableSelect(key).message }}
            </span>
            <div v-if="!disableSelect(key).disable" class="ml-auto flex">
              <!-- <div v-if="key == 'plants'" @click="deletePlant($event)" class="py-1 px-2 text-xs font-semibold rounded-sm text-gray-50 bg-red-800 hover:bg-red-600">
                DELETE
              </div> -->
              <drop-down-icon
                class="fill-current ml-auto transition-transform transform"
                :class="showDropdown == key ? 'rotate-180' : 'rotate-0'"
              />
            </div>
          </div>
          <div
            class="transition-all scrollbar-light dark:scrollbar-dark absolute bg-green-200 dark:bg-yellow-200 z-50 w-full shadow-sm"
            :style="dropdownStyle(key)"
          >
            <li
              v-for="(option, optIndex) in options[key]"
              :key="optIndex"
              :id="optionId(key, optIndex + 1)"
              :tabindex="index + 1"
              class="px-4 py-2 flex dark:text-black hover:bg-green-400 dark:hover:bg-yellow-500 focus:outline-none focus:bg-green-200 dark:focus:bg-yellow-300"
              :class="{
                'bg-green-500 dark:bg-yellow-600':
                  selected[key] == optIndex + 1,
              }"
              @mouseover="setHighlightEntity(option.id)"
              @mouseleave="setHighlightEntity(null)"
              @focus="setHighlightEntity(option.id)"
              @blur="setHighlightEntity(null)"
              @click="selectEntity(key, option.id)"
              @keypress.enter="selectEntity(key, option.id)"
            >
              {{ optionText(key, false, option.id, optIndex + 1) }}
              <div
                v-if="key == 'plants'"
                @mousedown="deletePlant($event, option.id)"
                class="py-1 px-2 text-xs ml-auto mr-4 font-semibold rounded-sm text-gray-50 bg-red-700 hover:bg-red-500"
              >
                DELETE
              </div>
            </li>
          </div>
        </ul>
      </div>
    </div>
    <div :class="showHelp ? 'p-2 border-1 rounded-md mb-2 m-1' : 'hidden'">
      Use this tool to select parts of plants more easily. Plants may also be
      deleted from the "Plant" dropdown.
      <br /><br /><strong>Tip:</strong> Mousing over an item in a dropdown will
      highlight it in the "Grow" window. You can use "tab" and "enter" to select
      items.
    </div>
    <button
      @click="showHelp = !showHelp"
      class="px-2 py-1 focus:outline-none text-xs rounded-sm hover:bg-gray-400 dark:hover:bg-gray-600 bg-gray-500 text-gray-100 dark:bg-gray-800 dark:text-gray-300"
    >
      {{ showHelp ? "Hide Help" : "Help" }}
    </button>
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import {
  GrowBranch,
  GrowDataKey,
  GrowFlower,
  GrowLeaf,
  GrowLeafCluster,
  GrowPetal,
  GrowPlant,
  GrowType,
} from "@/store/interfaces"
import { Watch, Ref } from "vue-property-decorator"
import Component from "vue-class-component"
import { selectMessages } from "@/fixtures/Messages"
import DropDownIcon from "@/assets/icons/drop-down.svg"

type OptionList = { [key in GrowDataKey]: GrowType[] }
type ClusterReferenceList<T> = { [key: number]: T[] }
type ClusterReference = {
  leafClusters: ClusterReferenceList<GrowLeaf>
  flowers: ClusterReferenceList<GrowPetal>
}
type SelectedOptions = { [key in GrowDataKey]: null | number }

const plantKeys = ["branches", "leafClusters", "flowers"] as const
const clusterKeys = ["leafClusters", "flowers"] as const
const childrenKeys = ["leaves", "petals"] as const
const clusterChildren = { leafClusters: "leaves", flowers: "petals" } as const

@Component({
  components: {
    DropDownIcon,
  },
})
export default class EntitySelect extends GrowMixin {
  public options: OptionList = this.defaultOptions()
  public clusterReferences: ClusterReference = this.defaultClusterReferences()
  public selected: SelectedOptions = this.defaultSelected()
  public showDropdown = null as GrowDataKey | null
  public dropdownTarget = null as HTMLElement | null
  public showHelp = false

  public mounted() {
    if (this.activeGrowPlant) {
      const { options, clusterReferences } = this.getOptionLists(
        this.activeGrowPlant
      )
      this.options = options
      this.clusterReferences = clusterReferences
      this.setSelected(1)
    }
  }

  public deleteEach(dataKey: GrowDataKey, entityList: GrowType[]) {
    entityList.forEach(entity => {
      grow.deleteEntity({
        dataKey,
        id: entity.id,
      })
    })
  }

  public deletePlant(e: MouseEvent, id: number | undefined) {
    e.stopPropagation()
    // delete leaves/petals first
    let deletePlant!: GrowPlant
    if (id != undefined && id != this.activeGrowPlant?.id) {
      deletePlant = this.getEntity("plants", id) as GrowPlant
    } else if (this.activeGrowPlant) {
      deletePlant = this.activeGrowPlant
      this.selected.plants = null
    } else {
      this.$toasted.error(selectMessages.noDelete)
      return
    }

    const { options, clusterReferences } = this.getOptionLists(deletePlant)
    for (const dataKey of clusterKeys) {
      for (const childList of Object.values(clusterReferences[dataKey])) {
        this.deleteEach(dataKey, childList)
      }
    }
    for (const dataKey of plantKeys) {
      this.deleteEach(dataKey, options[dataKey])
    }

    grow.deleteEntity({
      dataKey: "plants",
      id: deletePlant.id,
    })
  }

  public toggleDropdown(e: MouseEvent, dataKey: GrowDataKey) {
    e.stopPropagation()
    const eventTarget = e.target as HTMLElement
    if (
      dataKey == grow.highlightEntityType &&
      (this.dropdownTarget == eventTarget ||
        !(eventTarget instanceof HTMLLIElement) ||
        eventTarget.id == this.optionId(dataKey, this.selected[dataKey]))
    ) {
      this.showDropdown = null
    } else {
      if (!this.dropdownTarget || this.showDropdown != dataKey) {
        // make sure the dropdown target is set to the div, rather than the ul
        this.dropdownTarget = document.getElementById(dataKey + "-selected")
      }
      this.showDropdown = dataKey
    }
  }

  public optionId(key: GrowDataKey, optIndex: number | null) {
    return key + "-" + (optIndex != null ? optIndex : 0)
  }

  @Watch("showDropdown")
  public setHighlight(dataKey: GrowDataKey | null) {
    if (dataKey) {
      grow.setHighlightType(dataKey)
      document.addEventListener("mousedown", this.mousedownWatch)
    } else {
      this.clearHighlight()
    }
  }

  public clearHighlight() {
    grow.setHighlightType(null)
    this.dropdownTarget = null
    this.showDropdown = null
    document.removeEventListener("mousedown", this.mousedownWatch)
  }

  public mousedownWatch() {
    this.showDropdown = null
  }

  //#region Getters & Watchers
  public get iterateDataKeys() {
    if (!this.activeGrowPlant) {
      return ["plants"]
    }
    return ["plants", "branches", "leafClusters", "leaves", "flowers", "petals"]
  }

  public get disableSelect() {
    return (dataKey: GrowDataKey) => {
      if (
        ["leaves", "petals"].indexOf(dataKey) != -1 &&
        this.options[dataKey] &&
        !this.options[dataKey].length
      ) {
        return {
          disable: true,
          message:
            selectMessages.noParentSelected[dataKey as "leaves" | "petals"],
        }
      } else if (dataKey == "plants" && !this.activeGrowPlant) {
        return Object.values(this.growPlants).length
          ? { disable: false, message: selectMessages.noPlantSelected }
          : { disable: true, message: selectMessages.noPlants }
      } else {
        return {
          disable: false,
          message: selectMessages.default + this.growDataKeyText(dataKey),
        }
      }
    }
  }

  public get optionText() {
    return (
      key: GrowDataKey,
      selected: boolean,
      id: number,
      optIndex: number
    ) => {
      if (key == "plants") {
        return selected
          ? grow.activeGrowPlant?.name
          : (grow.getEntity("plants", id) as GrowPlant).name
      } else {
        return selected
          ? this.selected[key]
          : this.growDataKeyText(key) + " " + optIndex
      }
    }
  }

  @Watch("activeEntity")
  public newActive() {
    if (!this.activeEntityType || this.activeEntityType == "plants") {
      // need to refresh option lists
      const { options, clusterReferences } = this.getOptionLists(
        this.activeGrowPlant
      )
      this.options = options
      this.clusterReferences = clusterReferences
    }
    if (this.activeEntity && this.activeEntityType) {
      this.setSelected(
        this.options[this.activeEntityType]
          .map(e => {
            return e.id
          })
          .indexOf(this.activeEntity.id) + 1
      )
    } else if (!this.activeGrowPlant) {
      this.selected.plants = null
    }
  }

  @Watch("growPlants")
  public plantsUpdated() {
    this.options.plants = Object.values(this.growPlants)
  }
  //#endregion

  //#region Setters
  public selectEntity(dataKey: GrowDataKey, id: number) {
    if (dataKey == "plants") {
      grow.setActivePlant(id)
    } else {
      grow.setActiveEntity({ dataKey, id })
    }
  }

  public getOptionLists(plant: GrowPlant | null) {
    const optionLists = this.defaults()
    if (!plant) {
      return optionLists
    }

    for (const key of plantKeys) {
      optionLists.options[key] = plant[key].map(id => {
        return this.getEntity(key, id)
      }) as GrowBranch[] & GrowLeafCluster[] & GrowFlower[]
      if (key != "branches") {
        for (const cluster of optionLists.options[key]) {
          const children =
            key == "leafClusters"
              ? (cluster as GrowLeafCluster).leaves
              : (cluster as GrowFlower).petals
          optionLists.clusterReferences[key][cluster.id] = children.map(id => {
            return this.getEntity(clusterChildren[key], id)
          }) as GrowLeaf[] | GrowPetal[]
        }
      }
    }

    return optionLists
  }

  public setSelected(optIndex: number) {
    if (this.activeEntity && this.activeEntityType) {
      this.selected.plants = this.activeGrowPlant ? optIndex : null
      if (this.activeEntityType != "plants") {
        this.selected[this.activeEntityType] = optIndex
        // FYI if this component is mounted when a leaf/petal is selected, selected cluster won't update; no reference from child -> parent
        this.setClusterChildrenOptions()

        // reset other selections to null, unless a cluster child was just selected
        if (
          (childrenKeys as readonly string[]).indexOf(this.activeEntityType) ==
          -1
        ) {
          for (const key of [...plantKeys, ...childrenKeys]) {
            if (key != this.activeEntityType && this.selected[key]) {
              this.selected[key] = null
            }
          }
        }
      }
      this.showDropdown = null
    }
  }

  public setClusterChildrenOptions() {
    for (const dataKey of clusterKeys) {
      // activeEntity == null will clear the list
      if (this.activeEntity && this.activeEntityType == dataKey) {
        this.options[clusterChildren[dataKey]] = this.clusterReferences[
          dataKey
        ][this.activeEntity.id]
      } else if (clusterChildren[dataKey] != this.activeEntityType) {
        this.options[clusterChildren[dataKey]] = []
      }
    }
  }

  public defaults() {
    return {
      options: this.defaultOptions(),
      clusterReferences: this.defaultClusterReferences(),
    }
  }
  //#endregion

  //#region Defaults
  public defaultOptions() {
    return {
      plants: this.growPlants ? Object.values(this.growPlants) : [],
      branches: [] as GrowBranch[],
      leafClusters: [] as GrowLeafCluster[],
      leaves: [] as GrowLeaf[],
      flowers: [] as GrowFlower[],
      petals: [] as GrowPetal[],
    }
  }

  public defaultClusterReferences() {
    return {
      leafClusters: {} as { [key: number]: GrowLeaf[] },
      flowers: {} as { [key: number]: GrowPetal[] },
    }
  }

  public defaultSelected() {
    return {
      plants: null,
      branches: null,
      leafClusters: null,
      leaves: null,
      flowers: null,
      petals: null,
    }
  }
  //#endregion

  //#region Styling
  public get dropdownStyle() {
    return (key: GrowDataKey) => {
      const style = {
        "max-height": "0px",
        overflow: "hidden",
        "padding-right": 0,
      }
      if (this.showDropdown != key) {
        return style
      }
      style.overflow = "auto"
      if (this.dropdownTarget instanceof HTMLElement) {
        const elRect = this.$el.getBoundingClientRect()
        const dropRect = this.dropdownTarget.getBoundingClientRect()
        // -5 for some padding
        style["max-height"] =
          Math.max(50, elRect.height - dropRect.height - 5) + "px"
        // scroll this dropdown parent to the top, after potential scroll increase caused by dropdown opening
        setTimeout(() => {
          this.$el.scrollTop = this.$el.scrollTop + dropRect.y - elRect.y
        }, 151)
      } else {
        style["max-height"] = "200px"
      }
      return style
    }
  }
  //#endregion
}
</script>

<style>
.select-wrapper {
  min-width: 200px;
  flex: 1 1 calc(50% - 0.25rem);
}
</style>
