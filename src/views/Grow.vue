<template>
  <div id="grow-window" class="flex flex-grow h-screen">
    <widget :initWidgetState="growWidgetState" :flexGrow="true">
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
import { WidgetState } from "@/store/interfaces"

@Component({
  components: {
    Widget,
    Entity
  }
})
export default class Grow extends GrowMixin {
  public growWidgetState: WidgetState = {
    name: "grow",
    icon: "G",
    open: false,
    docked: true,
    inMenu: true
  }
}
</script>
