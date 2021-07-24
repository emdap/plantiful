<template>
  <div id="select-create" class="text-left w-full h-full flex">
    <inner-menu style="max-width: 110px">
      <div
        v-for="(nav, index) in navItems"
        :key="index"
        @click="showChild(nav.id)"
        class="p-2 w-24 uppercase overflow-x-hidden scrollbar-light-mini dark:scrollbar-dark-mini text-xs font-semibold cursor-pointer transition-all"
        :class="{
          'bg-pink-400 dark:bg-gray-800 text-white dark:text-gray-300 tracking-wider':
            nav.show,
          'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:tracking-wide': !nav.show,
        }"
      >
        {{ nav.name }}
      </div>
    </inner-menu>
    <div
      class="flex-grow h-full w-full overflow-auto scrollbar-light-mini dark:scrollbar-dark-mini pl-4"
    >
      <entity-select :class="{ hidden: !selectEntity.show }" />
      <entity-create :class="{ hidden: !createEntity.show }" />
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import EntitySelect from "@/components/Grow/EntitySelect.vue"
import EntityCreate from "@/components/Grow/EntityCreate.vue"
import GrowMixin from "@/mixins/GrowMixin.vue"
import InnerMenu from "@/components/InnerMenu.vue"
import { Watch, Ref } from "vue-property-decorator"

type NavItem = {
  id: string
  order: number
  name: string
  show: boolean
}

@Component({
  components: {
    EntitySelect,
    EntityCreate,
    InnerMenu,
  },
})
export default class SelectCreate extends GrowMixin {
  @Ref("entity-select") entitySelect!: HTMLElement
  @Ref("entity-create") entityCreate!: HTMLElement
  public expanded = true

  public selectEntity: NavItem = {
    id: "entitySelect",
    order: 2,
    name: "Selection Helper",
    show: false,
  }

  public createEntity: NavItem = {
    id: "entityCreate",
    order: 1,
    name: "Create Custom",
    show: false,
  }

  public navItems: NavItem[] = []

  public mounted() {
    this.setNavItems([this.selectEntity, this.createEntity])
  }

  @Watch("hasGrowPlants")
  public plantsUpdated(hasPlants: boolean) {
    if (hasPlants) {
      this.setNavItems([this.selectEntity, this.createEntity])
    } else {
      // hide this menu item completely
      this.selectEntity.show = false
      this.setNavItems([this.createEntity])
    }
  }

  public showChild(navId: "entitySelect" | "entityCreate") {
    for (const item of this.navItems) {
      if (item.id == navId && !item.show) {
        item.show = true
      } else if (item.id != navId) {
        item.show = false
      }
    }
  }

  public setNavItems(navItems: NavItem[]) {
    navItems
      .sort((a, b) => {
        return a.order - b.order
      })
      .forEach((nav, index) => {
        if (index == 0) {
          nav.show = true
        } else {
          nav.show = false
        }
      })

    this.navItems = navItems
  }
}
</script>
