<template>
  <div id="controls" class="overflow-auto h-full">
    <div v-for="controlTuple in visibleControls" :key="controlTuple[0]">
      <h3 class="mb-2">{{ getControlSectionTitle(controlTuple[0]) }}</h3>
      <div
        v-for="controlList in ['onEntity', 'onOptions']"
        :key="controlList"
        :id="`${controlTuple[0]}-${controlList}`"
      >
        <div
          v-for="control in controls[controlTuple[0]][controlList]"
          :key="control.text"
          :id="`${controlTuple[0]}-${control.text}`"
          class="pb-2 mb-2 border-b-1 border-gray-200 border-solid"
        >
          <template v-if="control.children">
            <h4 class="font-semibold">{{ control.text }}</h4>
            <div
              v-for="child in control.children"
              :key="child.text"
              :id="`${controlTuple[0]}-${control.text}-${child.text}`"
            >
              <control-field
                :control="child"
                :dataKey="controlTuple[0]"
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
              :curValue="getCurValue(controlList, control)"
              @value-updated="updateProperty(...arguments, controlList)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import Component from "vue-class-component"
import properties from "@/fixtures/Grow/ModifiableProperties"
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
  FlowerOptions
} from "@/store/interfaces"
import { Watch } from "vue-property-decorator"
import { Position } from "node_modules/vue-router/types/router"

// this is hideous, not sure how to best improve. Define these types elsewhere? Stop with the options vs actual grow instance? remove nesting??
type PropertyControls = {
  plants: PropertyData<GrowPlant, PlantOptions, Rotation & Position>
  branches: PropertyData<GrowBranch, BranchOptions>
  leaves: PropertyData<{}, LeafOptions>
  leafClusters: PropertyData<GrowLeafCluster, LeafClusterOptions, Rotation>
  flowers: PropertyData<GrowFlower, FlowerOptions>
}

type GrowControlKeys =
  | keyof GrowPlant
  | keyof GrowBranch
  | keyof GrowLeafCluster
  | keyof GrowFlower
type GrowOptionsControlKeys =
  | keyof PlantOptions
  | keyof BranchOptions
  | keyof LeafClusterOptions
  | keyof LeafOptions
  | keyof FlowerOptions

type PropertyData<P, O = {}, C = {}> = {
  show: boolean
  onEntity?: ControlList<P, C>
  onOptions?: ControlList<O>
  // user doesn't care if it's on the entity or on the build options for the entity, but i do
  // 1 requires direct change to object, the other is a parameter for a build function  -- is this always the case?
  // TODO: perhaps move everything to the build functions? is it possible
}

@Component({
  components: {
    ControlField
  }
})
export default class Controls extends GrowMixin {
  public controls: PropertyControls = this.allControlsDisabled()

  public allControlsDisabled() {
    return {
      plants: {
        show: false,
        onEntity: properties.plantControls,
        onOptions: properties.plantOptionsControls
      },
      branches: {
        show: false,
        onEntity: properties.branchControls
        // onOptions: [] as ControlList<any, any>
      },
      leafClusters: {
        show: false,
        onEntity: properties.leafClusterControls,
        onOptions: properties.leafClusterOptionsControls
      },
      leaves: {
        show: false,
        // onEntity: [] as ControlList<never, never>,
        onOptions: properties.leafOptionsControls
      },
      flowers: {
        show: false
        // onEntity: [] as ControlList<never, never>,
        // onOptions: [] as ControlList<never, never>
      }
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
      console.error("no active plant or active entity!")
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
    return parentControl && parentControl[typesafeChild.property]
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
      dataKey
    }
    // console.log(
    //   "update emit received for ",
    //   dataKey,
    //   property,
    //   parentProperty,
    //   " - update to ",
    //   newValue,
    //   "from list ",
    //   propertyList
    // )
    if (parentProperty) {
      const newValues = {
        ...grow.activeEntity[parentProperty],
        [property]: newValue
      }
      if (parentProperty == "rotation") {
        grow.setRotation({
          ...entityPayload,
          newRotations: newValues as Rotation
        })
      } else if (parentProperty == "position") {
        grow.setPosition({
          ...entityPayload,
          newPositions: newValues as Position
        })
      }
    } else {
      if (propertyList == "onEntity") {
        const entityDup = { ...grow.activeEntity, [property]: newValue }
        grow.setEntity({
          ...entityPayload,
          newEntity: entityDup
        })
      } else if (propertyList == "onOptions") {
        const optionsDup = {
          ...grow.activeEntity.optionsReference,
          [property]: newValue
        }
        grow.setEntityOptions({
          ...entityPayload,
          newOptions: optionsDup as GrowOptionsType
        })
      }
    }
  }

  @Watch("activeGrowPlant")
  public activePlantChanged() {
    this.initVisibleControls()
  }

  @Watch("activeEntityType")
  public updatePropertiesList(current: GrowDataKey, previous: GrowDataKey) {
    if (current != previous) {
      if (!previous && !current) {
        this.controls = this.allControlsDisabled()
        return
      }
      if (previous) this.controls[previous].show = false
      if (current) this.controls[current].show = true
    }
  }

  public get getControlSectionTitle() {
    return (section: GrowDataKey) => {
      if (section == "leafClusters") {
        return "Leaf Cluster Controls"
      }
      return `${section[0].toUpperCase()}${section.substring(
        1,
        section.length - 1
      )} Controls`
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
