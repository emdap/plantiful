<template>
  <div id="grow-window" class="flex flex-grow h-screen">
    <widget
      :initWidgetState="growWidget.state"
      :initDisplay="growWidget.display"
    >
      <!-- <div id="entity-wrapper" class="flex-row"> -->
      <entity
        v-for="entity in entities"
        :key="`entity-${entity.id}`"
        :entityData="entity"
      />
      <!-- </div> -->
    </widget>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GrowMixin from "@/mixins/GrowMixin.vue"
import Entity from "@/components/Grow/Entity.vue"
import Widget from "@/components/Widget.vue"
import { WidgetInit } from "@/store/interfaces"
import PlantIcon from "@/assets/icons/plant.svg"
// temp
import { testPlant } from "@/fixtures/Grow/Defaults"

@Component({
  components: {
    Widget,
    Entity
  }
})
export default class Grow extends GrowMixin {
  public growWidget: WidgetInit = {
    state: {
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
    this.growPlant(testPlant)
  }
}
</script>
