<template>
  <div
    id="side-menu"
    class="bg-white h-screen pt-2 pb-4 items-center flex flex-col shadow-md font-bold text-2xl w-full"
  >
    <menu-icon
      :is="menuWidget.icon"
      v-for="menuWidget in menuWidgetList"
      :key="`${menuWidget.widgetName}-icon`"
      :class="menuWidget.open ? 'text-green-600' : 'text-gray-500'"
      class="mb-8 cursor-pointer fill-current hover:text-pink-400"
    />
    <!-- @click="clickWidget(widget)" -->
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GridMixin from "@/mixins/GridMixin.vue"

@Component({})
export default class Menu extends GridMixin {
  // public clickWidget(widget: string) {
  //   container.toggleWidget(widget)
  // }
}
</script>
