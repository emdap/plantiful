<template>
  <div id="side-menu" class="h-full z-50">
    <div
      @click="expanded = false"
      class="absolute top-0 left-0 bg-green-900 dark:bg-gray-900 transition-opacity duration-500"
      :class="
        expanded
          ? 'h-screen w-screen delay-200 opacity-70'
          : 'h-0 w-0 opacity-0'
      "
    />
    <div
      class="transition-all duration-300 bg-white dark:bg-gray-900 h-full pt-2 pb-4 px-3 flex flex-col shadow-md text-sm fixed overflow-auto scrollbar-light-mini dark:scrollbar-dark-mini"
      :class="expanded ? 'w-52' : 'w-12'"
    >
      <div
        class="flex h-6 items-center w-full mb-6 cursor-pointer fill-current sticky top-0 bg-white dark:bg-gray-900"
        @click="expanded = !expanded"
        :class="
          expanded
            ? 'text-green-700 hover:text-pink-800 dark:text-yellow-600 dark:hover:text-yellow-800'
            : 'text-gray-500  hover:text-pink-400 dark:hover:text-yellow-400'
        "
      >
        <div
          class="text-base text-left whitespace-nowrap overflow-hidden transition-all font-bold"
          :class="expanded ? 'delay-200 duration-500 opacity-100' : 'opacity-0'"
        >
          CSS Garden
        </div>
        <div class="ml-auto">
          <arrow-icon
            class="transform transition-all delay-100 duration-500"
            :style="arrowStyle"
          />
        </div>
      </div>
      <div v-for="(group, index) in menuGroups" :key="index" class="mb-4">
        <div
          class="h-6 mb-2 whitespace-nowrap
        border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-300 border-t-1 transition-all"
          :class="
            expanded
              ? 'border-opacity-0 dark:border-opacity-0'
              : 'duration-300 border-opacity-100'
          "
        >
          <div
            class="font-mono dark:border-gray-500 border-b-1 pb-1 text-xs tracking-wider transition-all text-left font-bold "
            :class="expanded ? 'duration-500 opacity-100' : 'opacity-0 hidden'"
          >
            {{ group }}
          </div>
        </div>
        <div
          v-for="mWidget in menuWidgetList[group]"
          :key="mWidget.widgetName"
          :title="mWidget.widget.text"
          :class="
            mWidget.widget.open
              ? 'text-green-600 hover:text-green-900 dark:text-yellow-500 dark:hover:text-yellow-700'
              : 'hover:tracking-wider text-gray-300 hover:text-pink-400 dark:text-gray-500 dark:hover:text-yellow-400'
          "
          class="mb-4 transition-all cursor-pointer fill-current flex items-center text-left font-medium tracking-wide"
          @click="toggleMenuWidget(mWidget.widget)"
          @mouseenter="flashWidget(mWidget.widget)"
        >
          <div class="w-6 mr-3">
            <icon :is="mWidget.icon" />
          </div>
          <div class="overflow-hidden whitespace-nowrap">
            {{ mWidget.widget.text }}
          </div>
        </div>
      </div>
      <div
        class="text-pink-400 dark:text-pink-400 hover:text-yellow-400 mt-auto ml-auto icon"
        :title="darkMode ? 'Day Mode' : 'Night Mode'"
        @click="darkMode = !darkMode"
      >
        <dark-icon v-if="darkMode" />
        <light-icon v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { grid } from "@/mixins/GridMixin.vue"
import { MenuGroups, GridWidget } from "@/store/interfaces"
import ArrowIcon from "@/assets/icons/arrow.svg"
import LightIcon from "@/assets/icons/light-mode.svg"
import DarkIcon from "@/assets/icons/dark-mode.svg"
import menuWidgets from "@/fixtures/Grid/MenuWidgets"
import { Watch } from "vue-property-decorator"

@Component({
  components: {
    ArrowIcon,
    LightIcon,
    DarkIcon,
  },
})
export default class SideMenu extends Vue {
  public expanded = false
  public menuGroups = MenuGroups
  public darkMode = false

  public mounted() {
    if (
      ("theme" in localStorage && localStorage.theme == "dark") ||
      (!("theme" in localStorage) &&
        !window.matchMedia("(prefers-color-scheme: dark)").matches)
    ) {
      this.darkMode = true
    }
  }

  @Watch("darkMode")
  public toggleDarkMode(dark: boolean) {
    if (dark) {
      localStorage.theme = "dark"
      document.documentElement.classList.add("dark")
    } else {
      localStorage.theme = "light"
      document.documentElement.classList.remove("dark")
    }
  }

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
      if (widget) {
        grouped[mWidget.group].push({ ...mWidget, widget })
      }
    }
    return grouped
  }

  public toggleMenuWidget(widget: GridWidget) {
    grid.toggleWidget(widget)
  }

  public flashWidget(widget: GridWidget) {
    if (!this.expanded && widget.open) {
      grid.setActiveWidget(widget.name)
    }
  }
}
</script>

<style>
#side-menu {
  grid-area: side-menu;
  min-height: -webkit-fill-available;
}
</style>
