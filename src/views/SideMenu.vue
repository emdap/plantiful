<template>
  <div>
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
      id="side-menu"
      class="transition-size duration-300 bg-white dark:bg-gray-900 h-screen pt-2 pb-4 px-3 flex flex-col shadow-md font-bold text-sm fixed"
      :class="expanded ? 'w-52' : 'w-12'"
    >
      <div
        class="flex items-center w-full mb-6 cursor-pointer fill-current"
        @click="expanded = !expanded"
        :class="
          expanded
            ? 'text-green-700 hover:text-pink-800 dark:text-yellow-600 dark:hover:text-yellow-900'
            : 'text-gray-500  hover:text-pink-400 dark:hover:text-yellow-400'
        "
      >
        <div
          class="text-base text-left whitespace-nowrap overflow-hidden transition-all"
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
          class="h-6 mb-2 whitespace-nowrap w-full 
        border-gray-100 dark:border-gray-800 text-gray-500 border-t-1 transition-all"
          :class="
            expanded
              ? 'border-opacity-0 dark:border-opacity-0'
              : 'duration-300 border-opacity-100'
          "
        >
          <div
            class="font-mono dark:border-gray-500 border-b-1 pb-1 text-xs tracking-wider transition-all text-left"
            :class="expanded ? 'duration-500 opacity-100' : 'opacity-0'"
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
              ? 'text-green-600 hover:text-green-900 dark:text-yellow-600 dark:hover:text-yellow-800'
              : 'hover:tracking-wider text-gray-300 hover:text-pink-400 dark:text-gray-500 dark:hover:text-yellow-400'
          "
          class="mb-4 transition-all cursor-pointer fill-current flex items-center gap-3 text-left"
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
      <div
        class="mt-auto ml-auto icon"
        :title="darkMode ? 'Day Mode' : 'Night Mode'"
        @click="darkMode = !darkMode"
      >
        <dark-icon
          class="text-yellow-400 hover:text-pink-400 "
          v-if="darkMode"
        />
        <light-icon class="text-pink-400 hover:text-yellow-400" v-else />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { grid } from "@/mixins/GridMixin.vue"
import { MenuWidget, MenuGroups, GridWidget } from "@/store/interfaces"
import ArrowIcon from "@/assets/icons/arrow.svg"
import LightIcon from "@/assets/icons/light-mode.svg"
import DarkIcon from "@/assets/icons/dark-mode.svg"
import menuWidgets from "@/fixtures/Grid/MenuWidgets"
import { Watch } from "vue-property-decorator"

@Component({
  components: {
    ArrowIcon,
    LightIcon,
    DarkIcon
  }
})
export default class SideMenu extends Vue {
  public expanded = false
  public menuGroups = MenuGroups
  public darkMode = false

  // TODO: this should be someone elses responsibility
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
}
</script>
