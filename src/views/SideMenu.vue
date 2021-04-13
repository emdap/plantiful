<template>
  <div
    id="side-menu"
    class="bg-white h-screen pt-2 pb-4 items-center flex flex-col border-gray-100 border-solid border-r-2 font-bold text-2xl w-full"
  >
    <menu-icon
      :is="widget.icon"
      v-for="widget in menuWidgetList"
      :key="`${widget.name}-icon`"
      :class="widget.open ? 'text-green-600' : 'text-gray-500'"
      class="mb-8 cursor-pointer fill-current hover:text-pink-400"
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
