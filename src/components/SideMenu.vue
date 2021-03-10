<template>
  <div
    id="menu"
    class="h-screen py-4 px-4 border-gray-200 border-solid border-r-2 font-bold text-2xl"
  >
    <div
      v-for="(widget, index) in menuWidgets"
      :key="`widget-icon-${index}`"
      class="mb-2 cursor-pointer"
      :class="widget.open ? 'text-purple-600' : 'text-green-400'"
      @click="clickWidget(widget)"
    >
      {{ widget.icon }}
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import WindowMixin, { window } from "@/mixins/WindowMixin.vue"
import { WidgetState } from "@/store/interfaces"

@Component({})
export default class Menu extends WindowMixin {
  public clickWidget(widget: WidgetState) {
    if (widget.open) {
      window.toggleFocus(widget)
    } else {
      window.toggleWidget(widget)
    }
  }
}
</script>
