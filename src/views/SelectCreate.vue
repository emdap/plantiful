<template>
  <div id="select-create" class="text-left w-full h-full grid gap-2">
    <div
      id="navbar"
      class="pt-1 flex flex-col overflow-hidden pr-2 border-r-1 dark:border-gray-900"
    >
      <div
        v-for="(nav, index) in navItems"
        :key="index"
        @click="showChild(nav.id)"
        class="p-2 uppercase text-xs font-semibold cursor-pointer transition-all"
        :class="{
          'bg-pink-400 dark:bg-gray-800 text-white dark:text-gray-300 tracking-wider':
            nav.show,
          'bg-transparent text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 hover:tracking-wide': !nav.show,
        }"
      >
        {{ nav.name }}
      </div>
    </div>
    <entity-select :class="{ hidden: !selectEntity.show }" />
    <entity-create :class="{ hidden: !createEntity.show }" />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import EntitySelect from "@/components/Grow/EntitySelect.vue"
import EntityCreate from "@/components/Grow/EntityCreate.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { Watch, Ref } from "vue-property-decorator"

type NavItem = {
  id: string
  name: string
  show: boolean
}

@Component({
  components: {
    EntitySelect,
    EntityCreate,
  },
})
export default class SelectCreate extends GrowMixin {
  @Ref("entity-select") entitySelect!: HTMLElement
  @Ref("entity-create") entityCreate!: HTMLElement

  public selectEntity: NavItem = {
    id: "entitySelect",
    name: "Selection Helper",
    show: true,
  }

  public createEntity: NavItem = {
    id: "entityCreate",
    name: "Create Custom",
    show: false,
  }

  public navItems = [this.selectEntity, this.createEntity]

  @Watch("hasGrowPlants")
  public plantsUpdated(hasPlants: boolean, hadPlants: boolean) {
    if (hasPlants) {
      this.selectEntity.show = true
      this.createEntity.show = false
      this.navItems = [this.selectEntity, this.createEntity]
    } else {
      this.selectEntity.show = false
      this.createEntity.show = true
      this.navItems = [this.createEntity]
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
}
</script>

<style>
#select-create {
  grid-template-columns: minmax(10%, 100px) 1fr;
}
</style>
