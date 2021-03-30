<template>
  <div id="grow-container" class="flex flex-grow h-full overflow-hidden">
    <widget
      :initWidgetState="growWidget.entity"
      :initDisplay="growWidget.display"
    >
      <div
        id="entity-wrapper"
        class="h-full w-full"
        @dblclick.self="removeActive()"
      >
        <entity
          v-for="entity in entities"
          :key="makeGrowId('plant', entity.id, 0)"
          :entityData="entity"
        />
      </div>
    </widget>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import Entity from "@/components/Grow/Entity.vue"
import Widget from "@/components/Widget.vue"
import { WidgetInit } from "@/store/interfaces"
import PlantIcon from "@/assets/icons/plant.svg"
// temp
import { TEST_PLANT } from "@/fixtures/Grow/Defaults"

@Component({
  components: {
    Widget,
    Entity
  }
})
export default class Grow extends GrowMixin {
  public growWidget: WidgetInit = {
    entity: {
      name: "grow",
      icon: PlantIcon,
      open: false,
      docked: true,
      inMenu: true
    },
    display: {
      flexGrow: true
    }
  }

  public mounted() {
    // temp
    this.growPlant(TEST_PLANT)
  }

  public removeActive() {
    grow.removeActiveEntity()
  }
}
</script>
