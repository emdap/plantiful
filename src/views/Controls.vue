<template>
  <div
    id="controls"
    class="overflow-auto w-full scrollbar-light dark:scrollbar-dark"
  >
    <div
      v-for="controlTuple in visibleControls"
      :key="controlTuple[0]"
      class="pr-1 mr-2"
    >
      <h4
        @focus="toggleHighlight(controlTuple[0], true)"
        @blur="toggleHighlight(controlTuple[0], false)"
        title="Highlight active entity"
        tabindex="1"
        class="mt-2 py-1 mb-1 -mr-2 font-semibold sticky top-0 bg-white dark:bg-gray-700 text-black dark:text-gray-100 cursor-pointer ring-pink-400 dark:ring-yellow-500 focus:ring-2 focus:outline-none rounded-md"
      >
        {{ getControlSectionTitle(controlTuple[0]) }}
      </h4>
      <div
        v-for="controlList in ['onEntity', 'onOptions']"
        :key="controlList"
        :id="`${controlTuple[0]}-${controlList.toLowerCase()}`"
      >
        <div
          v-for="control in controls[controlTuple[0]][controlList]"
          :key="control.text"
          :id="`${controlTuple[0]}-${control.text}`"
          class="border-t-1 border-gray-200 dark:border-gray-800"
        >
          <template v-if="control.children">
            <h4 class="font-semibold my-2 text-gray-500 dark:text-gray-400">
              {{ control.text }}
            </h4>
            <div
              v-for="child in control.children"
              :key="child.text"
              :id="`${controlTuple[0]}-${control.text}-${child.text}`"
            >
              <control-field
                :control="child"
                :dataKey="controlTuple[0]"
                :controlList="controlList"
                :curValue="getCurValue(controlList, control, child)"
                @value-updated="
                  updateProperty(...arguments, controlList, control.property)
                "
              />
            </div>
          </template>
          <template v-else>
            <control-field
              :control="control"
              :dataKey="controlTuple[0]"
              :controlList="controlList"
              :curValue="getCurValue(controlList, control)"
              @value-updated="updateProperty(...arguments, controlList)"
            />
          </template>
        </div>
      </div>
      <!-- <div v-if="controls[controlTuple[0]].special">
        <h3 class="mb-2">
          Special {{ getControlSectionTitle(controlTuple[0]) }}
        </h3>
        <div
          v-for="control in controls[controlTuple[0]].special"
          :key="control.code"
          class="flex flex-row items-center w-full"
        >
          <h4 class="flex font-semibold mb-1 inline-block mr-2">
            {{ control.text }}
          </h4>
          <input
            class="flex ml-auto mr-5"
            type="checkbox"
            @change="specialControl($event, control.code)"
          />
        </div>
      </div> -->
    </div>
    <div class="fade-bar" />
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import Component from "vue-class-component"
import controlLists from "@/fixtures/Grow/ControlLists"
import ControlField from "@/components/Grow/ControlField.vue"
import {
  GrowDataKey,
  ControlList,
  GrowPlant,
  Rotation,
  PlantOptions,
  AnyControl,
  DropdownControl,
  Control,
  GrowType,
  LeafOptions,
  GrowLeafCluster,
  LeafClusterOptions,
  GrowBranch,
  GrowOptionsType,
  PossibleNestedControl,
  BranchOptions,
  GrowFlower,
  FlowerOptions,
  GrowControlKeys,
  GrowOptionsControlKeys,
  GrowPetal,
  PetalOptions,
} from "@/store/interfaces"
import { Watch } from "vue-property-decorator"
import { Position } from "node_modules/vue-router/types/router"

// this is hideous, not sure how to best improve. Define these types elsewhere? Stop with the options vs actual grow instance? remove nesting??
type PropertyControls = {
  plants: PropertyData<GrowPlant, PlantOptions, Rotation & Position>
  branches: PropertyData<GrowBranch, BranchOptions>
  leaves: PropertyData<{}, LeafOptions>
  leafClusters: PropertyData<GrowLeafCluster, LeafClusterOptions, Rotation>
  flowers: PropertyData<GrowFlower, FlowerOptions, Rotation>
  petals: PropertyData<GrowPetal, PetalOptions>
}

type PropertyData<P, O = {}, C = {}> = {
  show: boolean
  onEntity?: ControlList<P, C>
  onOptions?: ControlList<O>
  special?: { text: string; code: string }[]
  // user doesn't care if it's on the entity or on the build options for the entity, but i do
}

@Component({
  components: {
    ControlField,
  },
})
export default class Controls extends GrowMixin {
  public controls: PropertyControls = this.allControlsDisabled()

  public allControlsDisabled() {
    return {
      plants: {
        show: false,
        onEntity: controlLists.plantControls,
        onOptions: controlLists.plantOptionsControls,
        special: controlLists.specialPlantControls,
      },
      branches: {
        show: false,
        onEntity: controlLists.branchControls,
        onOptions: controlLists.branchOptionsControls,
      },
      leafClusters: {
        show: false,
        onEntity: controlLists.leafClusterControls,
        onOptions: controlLists.leafClusterOptionsControls,
      },
      leaves: {
        show: false,
        onOptions: controlLists.leafOptionsControls,
      },
      flowers: {
        show: false,
        onEntity: controlLists.flowerControls,
        onOptions: controlLists.flowerOptionsControls,
      },
      petals: {
        show: false,
        onOptions: controlLists.petalOptionsControls,
      },
    }
  }

  public mounted() {
    this.initVisibleControls()
  }

  public initVisibleControls() {
    if (this.activeGrowPlant) {
      this.controls.plants.show = true
    } else {
      this.controls = this.allControlsDisabled()
    }
  }

  public getCurValue(
    controlList: "onEntity" | "onOptions",
    control: AnyControl<GrowType, PossibleNestedControl>,
    child: Control<GrowType> | DropdownControl<GrowType>
  ) {
    // feel like this wasn't the best approach, struggled to figure out how to make this completely dynamic
    let sourceEntity!: GrowType
    if (grow.activeEntity) {
      sourceEntity = grow.activeEntity
    } else {
      // somehow accessed controls without there being an active plant/entity
      this.$toasted.error(this.messages.noActiveEntity)
      return
    }
    if (!child) {
      if (controlList == "onOptions") {
        const typesafeProp = control as Control<
          typeof sourceEntity.optionsReference
        >
        return sourceEntity.optionsReference[typesafeProp.property]
      }
      const typesafeProp = control as Control<typeof sourceEntity>
      return sourceEntity[typesafeProp.property]
    }

    const typesafeProp = control as Control<typeof sourceEntity>
    // controls with children is only possible on the entity, not the entity options
    const parentControl = sourceEntity[typesafeProp.property]
    const typesafeChild = child as Control<typeof parentControl>
    if (parentControl && parentControl[typesafeChild.property] != undefined) {
      return parentControl[typesafeChild.property]
    }
    return "Value updating..."
  }

  public updateProperty(
    dataKey: GrowDataKey,
    property: GrowControlKeys | GrowOptionsControlKeys,
    newValue: number | string | string[],
    propertyList: "onEntity" | "onOptions",
    parentProperty?: "rotation" | "position"
  ) {
    if (!grow.activeEntity) {
      return // should be impossible
    }
    const entityPayload = {
      id: grow.activeEntity.id,
      dataKey,
    }
    if (propertyList == "onEntity") {
      let mergeData!: { [key in GrowControlKeys]?: GrowType[keyof GrowType] }

      if (parentProperty) {
        mergeData = {
          // merge with other parentcontrolLists, as updating only 1 child property at a time (rotation.x, position.y, etc)
          [parentProperty]: {
            ...grow.activeEntity[parentProperty],
            [property]: newValue,
          },
        }
      } else {
        mergeData = { [property]: newValue }
      }
      grow.mergeEntity({ ...entityPayload, mergeData })
    } else if (propertyList == "onOptions") {
      const optionsDup = {
        ...grow.activeEntity.optionsReference,
        [property]: newValue,
      }
      grow.setEntityOptions({
        ...entityPayload,
        propertyRef: property as GrowOptionsControlKeys,
        newOptions: optionsDup,
      })
    }
    this.$forceUpdate()
  }

  @Watch("activeGrowPlant")
  public activePlantChanged() {
    this.initVisibleControls()
  }

  @Watch("activeEntity")
  public activeEntityChanged(newEntity: GrowType, oldEntity: GrowType) {
    if (newEntity?.id != oldEntity?.id) {
      this.resetScroll()
    }
  }

  @Watch("activeEntityType")
  public updateControlListsList(current: GrowDataKey, previous: GrowDataKey) {
    if (current != previous) {
      if (!previous && !current) {
        this.controls = this.allControlsDisabled()
        return
      }
      if (previous) this.controls[previous].show = false
      if (current) this.controls[current].show = true
    }
  }

  public resetScroll() {
    if (this.$el instanceof HTMLElement) {
      this.$el.scrollTop = 0
    }
  }

  public toggleHighlight(dataKey: GrowDataKey, highlight: boolean) {
    if (!highlight) {
      // don't want to reset type, as will mess with order of operations if plant-select is what caused the @blur
      grow.setHighlightEntity(null)
    } else if (this.activeEntity?.id) {
      grow.setHighlightType(dataKey)
      grow.setHighlightEntity(this.activeEntity.id)
    }
  }

  // TODO: does this actually need to be a getter?
  public get getControlSectionTitle() {
    return (dataKey: GrowDataKey) => {
      return this.growDataKeyText(dataKey) + " Controls"
    }
  }

  public get visibleControls(): [
    GrowDataKey[number],
    PropertyData<GrowType, GrowOptionsType, PossibleNestedControl>
  ][] {
    return Object.entries(this.controls).filter(c => {
      return c[1].show
    }) as [
      GrowDataKey[number],
      PropertyData<GrowType, GrowOptionsType, PossibleNestedControl>
    ][]
  }
}
</script>
