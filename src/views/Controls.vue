<template>
  <div
    id="controls"
    class="overflow-auto w-full scrollbar-light dark:scrollbar-dark"
  >
    <div v-if="!activeGrowPlant" class="font-semibold mt-10">
      {{ controlMessages.selectPlant }}
    </div>
    <div
      v-for="(entityControl, index) in visibleControls"
      :key="index"
      class="pr-1 mr-2"
    >
      <h4
        @focus="toggleHighlight(entityControl.dataKey, true)"
        @blur="toggleHighlight(entityControl.dataKey, false)"
        title="Highlight active entity"
        tabindex="1"
        class="mt-2 py-1 mb-1 -mr-2 font-semibold sticky top-0 transition-colors bg-white dark:bg-gray-700 text-black dark:text-gray-100 cursor-pointer ring-pink-400 dark:ring-yellow-500 focus:ring-2 focus:outline-none rounded-md"
      >
        {{ controlSectionTitle(entityControl.dataKey) }}
      </h4>
      <div
        v-for="control in entityControl.controls"
        :key="`${entityControl.dataKey}-${control.property}`"
        :id="`${entityControl.dataKey}-${control.property}`"
        class="border-t-1 border-gray-200 dark:border-gray-800"
      >
        <template v-if="control.children">
          <h4 class="font-semibold my-2 text-gray-500 dark:text-gray-400">
            {{ control.text }}
          </h4>
          <div
            v-for="child in control.children"
            :key="child.text"
            :id="`${entityControl.dataKey}-${control.text}-${child.text}`"
          >
            <control-field
              :control="child"
              :propertyOn="control.propertyOn"
              :dataKey="entityControl.dataKey"
              :curValue="getCurValue(control, child)"
              @value-updated="updateProperty(...arguments, control.property)"
            />
          </div>
        </template>
        <template v-else>
          <control-field
            :control="control"
            :dataKey="entityControl.dataKey"
            :curValue="getCurValue(control)"
            @value-updated="updateProperty"
          />
        </template>
      </div>
      <!-- <div v-if="controls[controlTuple[0]].special">
        <h3 class="mb-2">
          Special {{ controlSectionTitle(controlTuple[0]) }}
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
  AnyControl,
  DropdownControl,
  Control,
  GrowType,
  PossibleNestedControl,
  GrowControlKeys,
  GrowOptionsControlKeys,
} from "@/store/interfaces"
import { Watch } from "vue-property-decorator"
import { controlMessages } from "@/fixtures/Messages"

export type EntityControl = {
  dataKey: GrowDataKey
  show: boolean
  controls: ControlList
  special?: { text: string; code: string }[]
  // user doesn't care if it's on the entity or on the build options for the entity, but i do
}

@Component({
  components: {
    ControlField,
  },
})
export default class Controls extends GrowMixin {
  public controls: EntityControl[] = this.allControlsDisabled()
  public controlMessages = controlMessages

  public allControlsDisabled() {
    return [
      {
        dataKey: "plants" as const,
        show: false,
        controls: controlLists.plantControls.sort(controlLists.sortControlList),
        special: controlLists.specialPlantControls,
      },
      {
        dataKey: "branches" as const,
        show: false,
        controls: controlLists.branchControls.sort(
          controlLists.sortControlList
        ),
      },
      {
        dataKey: "leafClusters" as const,
        show: false,
        controls: controlLists.leafClusterControls.sort(
          controlLists.sortControlList
        ),
      },
      {
        dataKey: "leaves" as const,
        show: false,
        controls: controlLists.leafControls.sort(controlLists.sortControlList),
      },
      {
        dataKey: "flowers" as const,
        show: false,
        controls: controlLists.flowerControls.sort(
          controlLists.sortControlList
        ),
      },
      {
        dataKey: "petals" as const,
        show: false,
        controls: controlLists.petalControls.sort(controlLists.sortControlList),
      },
    ]
  }

  public mounted() {
    this.initVisibleControls()
  }

  public initVisibleControls() {
    if (this.activeGrowPlant) {
      const plantList = this.getControlList("plants")
      if (plantList) plantList.show = true
    } else {
      this.controls = this.allControlsDisabled()
    }
  }

  public getCurValue(
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
      if (control.propertyOn == "options") {
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
    payload: {
      dataKey: GrowDataKey
      control: AnyControl<GrowType, PossibleNestedControl>
      propertyOn: "entity" | "options"
      newValue: number | string | string[]
    },
    parentProperty?: "rotation" | "position"
  ) {
    const { dataKey, control, propertyOn, newValue } = payload
    if (!grow.activeEntity) {
      return // should be impossible
    }
    const entityPayload = {
      id: grow.activeEntity.id,
      dataKey,
    }
    if (propertyOn == "entity") {
      let mergeData!: { [key in GrowControlKeys]?: GrowType[keyof GrowType] }

      if (parentProperty) {
        mergeData = {
          // merge with other parentcontrolLists, as updating only 1 child property at a time (rotation.x, position.y, etc)
          [parentProperty]: {
            ...grow.activeEntity[parentProperty],
            [control.property]: newValue,
          },
        }
      } else {
        mergeData = { [control.property]: newValue }
      }
      grow.mergeEntity({ ...entityPayload, mergeData })
    } else if (propertyOn == "options") {
      const optionsDup = {
        ...grow.activeEntity.optionsReference,
        [control.property]: newValue,
      }
      grow.setEntityOptions({
        ...entityPayload,
        propertyRef: control.property as GrowOptionsControlKeys,
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
      const prevList = this.getControlList(previous)
      const curList = this.getControlList(current)
      if (prevList) prevList.show = false
      if (curList) curList.show = true
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

  public controlSectionTitle(dataKey: GrowDataKey) {
    return this.growDataKeyText(dataKey) + " Controls"
  }

  public getControlList(dataKey: GrowDataKey) {
    return this.controls.find(c => {
      return c.dataKey == dataKey
    })
  }

  public get visibleControls(): EntityControl[] {
    return this.controls.filter(c => {
      return c.show == true
    })
  }
}
</script>
