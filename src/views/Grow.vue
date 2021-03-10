<template>
  <div id="grow-window" class="flex flex-grow h-screen">
    <widget :initWidgetState="growWidget" :flexGrow="true">
      <entity
        v-for="entity in entities"
        :key="`entity-${entity.id}`"
        :entityData="entity"
      />
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
export default class Grow extends GrowMixin {}
</script>
