<template>
  <div
    id="entity-select"
    class="pt-3 w-full h-full overflow-auto scrollbar-light dark:scrollbar-dark"
    style="scroll-behavior: smooth"
  >
    <div id="entity-select-wrapper" class="flex flex-wrap self-start mb-2 mr-2">
      <div
        v-for="(key, index) in iterateDataKeys"
        :key="index"
        class="select-wrapper m-1 relative"
      >
        <ul
          role="listbox"
          @mousedown="toggleDropdown($event, key)"
          class="cursor-pointer focus:outline-none bg-green-100 dark:bg-yellow-200"
        >
          <div
            :id="key + '-selected'"
            :tabindex="disableSelect(key).disable ? -1 : index + 1"
            @focus="showDropdown = key"
            @keydown.esc="showDropdown = null"
            class="p-2 flex dark:text-black focus:outline-none overflow-hidden whitespace-nowrap"
            :class="selectClass(key)"
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
              <drop-down-icon
                class="fill-current ml-auto transition-transform transform"
                :class="showDropdown == key ? 'rotate-180' : 'rotate-0'"
              />
            </div>
          </div>
          <div
            class="transition-all scrollbar-light dark:scrollbar-dark absolute bg-green-200 dark:bg-yellow-200 z-50 w-full shadow-sm pb-6"
            :style="dropdownStyle(key)"
          >
            <li
              v-for="(option, optIndex) in options[key]"
              :key="optIndex"
              :id="optionId(key, optIndex + 1)"
              :tabindex="showDropdown == key ? index + 1 : -1"
              class="px-4 py-2 flex dark:text-black hover:bg-green-400 dark:hover:bg-yellow-500 focus:outline-none focus:bg-green-300 dark:focus:bg-yellow-300"
              :class="{
                'bg-green-500 text-white dark:text-white dark:bg-yellow-600':
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
              <button
                v-if="key == 'plants'"
                @mousedown="deletePlant($event, option.id)"
                class="py-1 px-2 text-xs ml-auto mr-4 btn-red"
              >
                DELETE
              </button>
            </li>
            <div
              class="h-2 w-full sticky bottom-0 bg-gradient-to-t from-green-200 dark:from-yellow-200"
            />
          </div>
        </ul>
      </div>
      <div v-if="showHelp" class="help-box">
        Use this tool to select plants and parts of plants. Plants may also be
        deleted from the "Plant" dropdown.
        <br /><br />
        <strong>Tips:</strong>
        <ul class="list-disc pl-6">
          <li v-for="(tip, index) in tips" :key="index">
            {{ tip }}
          </li>
        </ul>
      </div>
    </div>
    <button @click="showHelp = !showHelp" class="btn-help ml-1 mb-1">
      {{ showHelp ? "Hide Help" : "Help" }}
    </button>
    <!-- <div class="fade-bar" /> -->
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
import { Watch } from "vue-property-decorator"
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

  public tips = [
    "Plants and parts of plants can also be selected by double clicking on them.",
    'Mousing over an item in a dropdown will highlight it in the "Grow" window.',
    'The dropdowns here are responsive to "tab" and "enter".',
  ]

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

  public deleteEach(dataKey: GrowDataKey, entityList: number[]) {
    entityList.forEach(id => {
      grow.deleteEntity({
        dataKey,
        id,
      })
    })
  }

  public deletePlant(e: MouseEvent, id: number | undefined) {
    e.stopPropagation()
    // delete leaves/petals first
    let plant!: GrowPlant
    if (id != undefined && id != this.activeGrowPlant?.id) {
      plant = this.getEntity("plants", id) as GrowPlant
    } else if (this.activeGrowPlant) {
      plant = this.activeGrowPlant
      this.selected.plants = null
    } else {
      this.$toasted.error(selectMessages.noDelete)
      return
    }

    grow.deletePlant(plant)
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
        return this.hasGrowPlants
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

  @Watch("growPlantsDict")
  public plantsUpdated() {
    this.options.plants = Object.values(this.growPlantsDict)
  }
  //#endregion

  //#region Setters
  public selectEntity(dataKey: GrowDataKey, id: number) {
    if (dataKey == "plants") {
      grow.setActivePlant(id)
      grow.setActiveEntity({ dataKey, id })
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
          optionLists.clusterReferences[key][cluster.id] = cluster.children.map(
            id => {
              return this.getEntity(clusterChildren[key], id)
            }
          ) as GrowLeaf[] | GrowPetal[]
        }
      }
    }

    return optionLists
  }

  public setSelected(optIndex: number) {
    if (this.activeEntity && this.activeEntityType) {
      if (
        this.activeEntityType == "flowers" ||
        this.activeEntityType == "leafClusters" ||
        this.options.leaves.length ||
        this.options.flowers.length
      ) {
        // FYI if this component is mounted when a leaf/petal is selected, selected cluster won't update; no reference from child -> parent
        this.setClusterChildrenOptions()
      }

      this.selected[this.activeEntityType] = optIndex
      // reset other selections to null, unless a cluster child was just selected
      if (
        (childrenKeys as readonly string[]).indexOf(this.activeEntityType) == -1
      ) {
        for (const key of [...plantKeys, ...childrenKeys]) {
          if (key != this.activeEntityType && this.selected[key]) {
            this.selected[key] = null
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
      plants: this.hasGrowPlants ? Object.values(this.growPlantsDict) : [],
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
  public get selectClass() {
    return (key: GrowDataKey) => {
      const disabled = this.disableSelect(key).disable
      return {
        "text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-300 cursor-not-allowed": disabled,
        "hover:bg-green-200 dark:hover:bg-yellow-400 focus:bg-green-200 dark:focus:bg-yellow-400": !disabled,
        "bg-green-300 dark:bg-yellow-500":
          this.selected[key] && this.showDropdown != key,
        "bg-green-200 dark:bg-yellow-400":
          !disabled && this.showDropdown == key,
      }
    }
  }

  public get dropdownStyle() {
    return (key: GrowDataKey) => {
      const style = {
        "max-height": "0px",
        overflow: "hidden",
        padding: 0,
      }
      if (this.showDropdown != key) {
        return style
      }
      style.overflow = "auto"
      if (this.dropdownTarget instanceof HTMLElement) {
        const elRect = this.$el.getBoundingClientRect()
        const dropRect = this.dropdownTarget.getBoundingClientRect()
        // -16 for padding
        style["max-height"] =
          Math.max(50, elRect.height - dropRect.height - 16) + "px"
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
  min-width: 190px;
  flex: 1 1 calc(50% - 0.5rem);
}
</style>
