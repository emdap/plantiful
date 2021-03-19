<template>
  <div
    id="side-menu"
    class="h-screen py-4 px-2 border-gray-200 border-solid border-r-2 font-bold text-2xl w-full"
  >
    <menu-icon
      :is="widget.icon"
      v-for="(widget, index) in menuWidgets"
      :key="`widget-icon-${index}`"
      :style="{ fill: widget.open ? 'purple' : 'gray' }"
      class="mb-4 cursor-pointer"
      @click="clickWidget(widget)"
    />
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import ContainerMixin, { container } from "@/mixins/ContainerMixin.vue"
import { WidgetEntity } from "@/store/interfaces"

@Component({})
export default class Menu extends ContainerMixin {
  public clickWidget(widget: WidgetEntity) {
    container.toggleWidget(widget)
  }
}
</script>
