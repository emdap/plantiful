<template>
  <div class="overflow-auto">
    <h1>
      Controls
    </h1>
    <div v-for="controlTuple in visibleControls" :key="controlTuple[0]">
      <h3>{{ getControlSectionTitle(controlTuple[0]) }}</h3>
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
                :curValue="
                  getCurValue(controlTuple[0], controlList, control, child)
                "
                @value-updated="
                  updateProperty(...arguments, controlList, control.property)
                "
              />
            </div>
          </template>
          <template v-else>
            <control-field
              :control="control"
              :curValue="getCurValue(controlTuple[0], controlList, control)"
              @value-updated="updateProperty(...arguments, controlList)"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import GrowMixin from "@/mixins/GrowMixin.vue"
import Component from "vue-class-component"
import properties from "@/fixtures/Grow/ModifiableProperties"
import ControlField from "@/components/Grow/ControlField.vue"
import {
  GrowDataKey,
  ControlList,
  GrowPlant,
  Rotation,
  GrowShape,
  PlantOptions,
  GrowEntity,
  AnyControl,
  DropdownControl,
  Control,
  GrowType,
  NestedControl
} from "@/store/interfaces"
import { Watch } from "vue-property-decorator"
import { Position } from "node_modules/vue-router/types/router"
import { Prop } from "vue/types/options"

type PropertyControls = {
  [key in GrowDataKey]: PropertyData
}

type PropertyData = {
  show: boolean
  onEntity?: ControlList<any, any>
  onOptions?: ControlList<any, any>
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
    growDataKey: GrowDataKey,
    controlList: "onEntity" | "onOptions",
    control: AnyControl<any, any>,
    child: Control<any> | DropdownControl<any>
  ) {
    // feel like this wasn't the best approach, struggled to figure out how to make this completely dynamic
    console.log(
      "getting cur value",
      growDataKey,
      controlList,
      control.property,
      child?.property
    )
    let sourceEntity!: GrowType
    if (growDataKey == "plants" && this.activeGrowPlant) {
      sourceEntity = this.activeGrowPlant
    } else if (this.activeEntity) {
      sourceEntity = this.activeEntity
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
        console.log(
          typesafeProp.property,
          sourceEntity.optionsReference[typesafeProp.property]
        )
        return sourceEntity.optionsReference[typesafeProp.property]
      }
      const typesafeProp = control as Control<typeof sourceEntity>
      console.log(typesafeProp.property, sourceEntity[typesafeProp.property])
      return sourceEntity[typesafeProp.property]
    }

    const typesafeProp = control as Control<typeof sourceEntity>
    // controls with children is only possible on the entity, not the entity options
    const parentControl = sourceEntity[typesafeProp.property]
    const typesafeChild = child as Control<typeof parentControl>
    console.log(
      typesafeProp.property,
      parentControl,
      typesafeChild.property,
      parentControl && parentControl[typesafeChild.property]
    )
    return parentControl && parentControl[typesafeChild.property]
  }

  public updateProperty(
    property: string,
    newValue: number | string,
    propertyList: "onEntity" | "onOptions",
    parentProperty?: string
  ) {
    console.log(
      "update emit received for ",
      property,
      parentProperty,
      " - update to ",
      newValue,
      "from list ",
      propertyList
    )
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
      console.log(section)
      if (section == "leafClusters") {
        return "Leaf Cluster Controls"
      }
      return `${section[0].toUpperCase()}${section.substring(
        1,
        section.length - 1
      )} Controls`
    }
  }

  public get visibleControls(): [GrowDataKey[number], PropertyData][] {
    return Object.entries(this.controls).filter(c => {
      return c[1].show
    })
  }
}
</script>
