<template>
  <div>
    <div
      v-if="expanded"
      @click="expanded = false"
      class="absolute top-0 left-0 h-screen w-screen bg-green-900 bg-opacity-70"
    />
    <div
      id="side-menu"
      class="transition-all duration-300 bg-white h-screen pt-2 pb-4 px-3 flex flex-col shadow-md font-bold text-sm fixed"
      :class="expanded ? 'w-52' : 'w-12'"
    >
      <div
        :class="expanded ? 'text-green-700' : 'text-gray-500'"
        class="self-end mb-6 cursor-pointer fill-current hover:text-pink-600"
        @click="expanded = !expanded"
      >
        <arrow-icon
          class="transform transition-all delay-100 duration-500"
          :style="arrowStyle"
        />
      </div>
      <div v-for="(group, index) in menuGroups" :key="index" class="mb-4">
        <div
          class="h-6 mt-1 mb-4 whitespace-nowrap w-full 
        border-gray-100 text-gray-600"
          :class="expanded ? 'border-t-0' : 'border-t-1'"
        >
          <div
            class="border-b-1 pb-2  border-gray-100 transition-all text-left"
            :class="expanded ? 'duration-500 opacity-100' : 'opacity-0'"
          >
            {{ group }}
          </div>
        </div>
        <div
          v-for="mWidget in menuWidgetList[group]"
          :key="mWidget.widgetName"
          :class="
            mWidget.widget.open
              ? 'text-green-600 hover:text-pink-800'
              : 'text-gray-300 hover:text-pink-400'
          "
          class="mb-4 transition-all cursor-pointer fill-current hover:tracking-wider flex items-center gap-3 text-left"
          @click="toggleMenuWidget(mWidget.widget)"
        >
          <div class="w-6">
            <icon :is="mWidget.icon" />
          </div>
          <div class="overflow-hidden whitespace-nowrap">
            {{ mWidget.widget.text }}
          </div>
        </div>
      </div>
      <!-- @click="clickWidget(widget)" -->
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { grid } from "@/mixins/GridMixin.vue"
import { MenuWidget, MenuGroups, GridWidget } from "@/store/interfaces"
import ArrowIcon from "@/assets/icons/arrow.svg"
import menuWidgets from "@/fixtures/Grid/MenuWidgets"

@Component({
  components: {
    ArrowIcon
  }
})
export default class SideMenu extends Vue {
  public expanded = false
  public menuGroups = MenuGroups

  public get menuClass() {
    return this.expanded ? "items-center w-20" : "items-center w-full"
  }

  public get arrowStyle() {
    const angle = this.expanded ? -180 : 0
    return { transform: `rotateZ(${angle}deg)` }
  }

  public get menuWidgetList() {
    const grouped = {} as { [key in typeof MenuGroups[number]]: {}[] }
    for (const mWidget of menuWidgets) {
      if (!grouped[mWidget.group]) {
        grouped[mWidget.group] = []
      }
      const widget = grid.getWidget(mWidget.widgetName)
      grouped[mWidget.group].push({ ...mWidget, widget })
    }
    return grouped
  }

  public toggleMenuWidget(widget: GridWidget) {
    // const widget = grid.getWidget(menuWidget.widgetName)
    grid.toggleWidget(widget)
  }
  // public menuWidgetOpen(menuWidget: MenuWidget) {
  //   return grid.getWidget(menuWidget.widgetName)?.open
  // }
}
</script>
