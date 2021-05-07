<template>
  <div
    id="entity-select"
    class="text-left relative overflow-auto scrollbar-light dark:scrollbar-dark"
  >
    Selection Helper
    <div
      class="bg-gray-400 m-2"
      v-for="(key, index) in iterateDataKeys"
      :key="index"
    >
      <ul
        role="listbox"
        :tabindex="index + 1"
        class="cursor-pointer"
        @mousedown="toggleDropdown($event, key)"
        @focus="showDropdown = key"
      >
        <li
          :id="key"
          role="option"
          :class="{
            'text-gray-300 cursor-not-allowed': disableSelect(key).disable,
          }"
          class="bg-green-200 p-4 "
        >
          {{
            selected[key]
              ? growDataKeyText(key) + " " + selectedText(key)
              : disableSelect(key).message
          }}
        </li>
        <template v-if="showDropdown == key">
          <li
            v-for="(option, optIndex) in options[key]"
            :key="optIndex"
            :id="key + optIndex"
            :tabindex="index + 1"
            class="hover:bg-green-400"
            @mouseover="setHighlightEntity(option.id)"
            @mouseleave="setHighlightEntity(null)"
            @focus="setHighlightEntity(option.id)"
            @blur="setHighlightEntity(null)"
            @click="selectOption(key, option.id, optIndex + 1)"
            @keypress.enter="selectOption(key, option.id, optIndex + 1)"
          >
            {{ growDataKeyText(key) }} - {{ optIndex + 1 }}
          </li>
        </template>
      </ul>
    </div>
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

type OptionList = { [key in GrowDataKey]: GrowType[] }
type ClusterReferenceList<T> = { [key: number]: T[] }
type ClusterReference = {
  leafClusters: ClusterReferenceList<GrowLeaf>
  flowers: ClusterReferenceList<GrowPetal>
}
type SelectedOptions = { [key in GrowDataKey]: null | number }

const clusterDataKeys = ["leafClusters", "flowers"] as const
const clusterChildren = { leafClusters: "leaves", flowers: "petals" } as const

@Component({})
export default class EntitySelect extends GrowMixin {
  public options: OptionList = this.defaultOptions()
  public clusterReferences: ClusterReference = this.defaultClusterReferences()
  public selected: SelectedOptions = this.defaultSelected()
  public showDropdown = null as GrowDataKey | null
  public dropdownTarget = null as HTMLElement | null

  public noLeaves = "Please select a Leaf Cluster first"
  public noPetals = "Please select a Flower first"

  public mounted() {
    if (this.activeGrowPlant) {
      this.setOptionLists()
      this.setSelected(1)
    }
  }

  public toggleDropdown(e: MouseEvent, dataKey: GrowDataKey) {
    const target = e.target instanceof HTMLElement ? e.target : null
    if (dataKey == grow.highlightEntityType && this.dropdownTarget == target) {
      this.showDropdown = null
    } else {
      if (!this.dropdownTarget || this.showDropdown != dataKey) {
        this.dropdownTarget = target
      }
      this.showDropdown = dataKey
    }
  }

  @Watch("showDropdown")
  public setHighlight(dataKey: GrowDataKey | null) {
    if (dataKey) {
      grow.setHighlightType(dataKey)
      document.addEventListener("mousedown", this.mousedownWatch)
    } else {
      if (this.dropdownTarget && this.$el instanceof Element) {
        this.$el.scrollTop = this.dropdownTarget.offsetTop
      }
      this.clearHighlight()
    }
  }

  public clearHighlight() {
    grow.setHighlightType(null)
    this.dropdownTarget = null
    document.removeEventListener("mousedown", this.mousedownWatch)
  }

  public mousedownWatch(e: MouseEvent) {
    if (
      e.target instanceof HTMLElement &&
      e.target != this.dropdownTarget &&
      (!this.dropdownTarget || !this.dropdownTarget.contains(e.target))
    ) {
      this.clearHighlight()
    }
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
        !this.options[dataKey].length
      ) {
        return {
          disable: true,
          message:
            selectMessages.noParentSelected[dataKey as "leaves" | "petals"],
        }
      } else if (dataKey == "plants" && !this.activeGrowPlant) {
        return { disable: false, message: selectMessages.noPlantSelected }
      } else {
        return {
          disable: false,
          message: selectMessages.default + this.growDataKeyText(dataKey),
        }
      }
    }
  }

  public get selectedText() {
    return (key: GrowDataKey) => {
      if (key == "plants" && this.selected.plants) {
        return grow.activeGrowPlant?.name
      } else {
        return this.growDataKeyText(key) + "-" + this.selected[key]
      }
    }
  }

  @Watch("activeEntity")
  public newActive() {
    if (!this.activeEntityType || this.activeEntityType == "plants") {
      // need to refresh option lists
      this.setOptionLists()
    }
    if (this.activeEntity && this.activeEntityType) {
      this.setSelected(
        this.options[this.activeEntityType].indexOf(this.activeEntity) + 1
      )
    }
  }

  @Watch("growPlants")
  public plantsUpdated() {
    this.options.plants = Object.values(this.growPlants)
  }
  //#endregion

  //#region Setters
  public setOptionLists() {
    if (!this.activeGrowPlant) {
      this.setDefaults()
      return
    }

    for (const key of ["branches", "leafClusters", "flowers"] as const) {
      this.options[key] = this.activeGrowPlant[key].map(id => {
        return this.getEntity(key, id)
      })
      if (key != "branches") {
        for (const cluster of this.options[key]) {
          const children =
            key == "leafClusters"
              ? (cluster as GrowLeafCluster).leaves
              : (cluster as GrowFlower).petals
          this.clusterReferences[key][cluster.id] = children.map(id => {
            return this.getEntity(clusterChildren[key], id)
          }) as GrowLeaf[] | GrowPetal[]
        }
      }
    }
  }

  public selectOption(dataKey: GrowDataKey, id: number, optIndex: number) {
    this.activateEntity(true, dataKey, id)
    this.setSelected(optIndex)
  }

  public setSelected(optIndex: number) {
    if (this.activeEntity && this.activeEntityType) {
      this.selected.plants = this.activeGrowPlant ? 1 : null
      if (this.activeEntityType != "plants") {
        // if this component is mounted when a leaf/petal is selected, selected cluster won't update; no reference from child -> parent
        this.selected[this.activeEntityType] = this.activeEntity
          ? optIndex
          : null
        if (
          this.activeEntityType == "leafClusters" ||
          this.activeEntityType == "flowers"
        ) {
          this.setClusterChildrenOptions()
        }
      }
      this.showDropdown = null
    }
  }

  public setClusterChildrenOptions() {
    for (const dataKey of clusterDataKeys) {
      // activeEntity == null will clear the list
      if (this.activeEntity && this.activeEntityType == dataKey) {
        this.options[clusterChildren[dataKey]] = this.clusterReferences[
          dataKey
        ][this.activeEntity.id]
      } else {
        this.options[clusterChildren[dataKey]] = []
      }
    }
  }

  public setDefaults() {
    this.options = this.defaultOptions()
    this.clusterReferences = this.defaultClusterReferences()
    this.selected = this.defaultSelected()
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
}
</script>
