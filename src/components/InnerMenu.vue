<template>
  <div
    id="navbar"
    class="pt-3 flex flex-col relative border-r-1 dark:border-gray-800 transition-all h-full"
    :class="expanded ? 'w-1/6 ml-0' : 'ml-1 w-0'"
    :style="`min-width: ${expanded ? minWidth : 0}px;`"
  >
    <div
      class="absolute z-10 -right-2 top-1 cursor-pointer bg-white dark:bg-gray-700 rounded-full border-1 dark:border-gray-800 hover:text-pink-400 hover:border-pink-400 dark:hover:text-yellow-500 dark:hover:border-yellow-500 text-gray-300 dark:text-gray-800 w-4 h-4 transform transition-all"
      :style="arrowStyle"
      @click="expanded = !expanded"
    >
      <arrow-icon class="fill-current" viewBox="0 0 40 40" />
    </div>
    <span
      :class="expanded ? 'opacity-100' : 'opacity-0'"
      class="overflow-x-hidden pr-5 transition-opacity"
    >
      <slot v-if="showSlot"></slot>
    </span>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import ArrowIcon from "@/assets/icons/drop-down.svg"
import { Prop, Watch } from "vue-property-decorator"

@Component({
  components: {
    ArrowIcon,
  },
})
export default class InnerMenu extends Vue {
  @Prop({ default: true }) startExpanded!: boolean
  @Prop({ default: 90 }) minWidth!: number

  public expanded = this.startExpanded
  public showSlot = this.startExpanded

  public get arrowStyle() {
    const angle = this.expanded ? -90 : 90
    return { transform: `rotateZ(${angle}deg)` }
  }

  @Watch("expanded")
  public isExpanded(expanded: boolean) {
    setTimeout(
      () => {
        this.showSlot = expanded
      },
      expanded ? 75 : 150
    )
  }
}
</script>
