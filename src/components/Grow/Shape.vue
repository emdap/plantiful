<template>
  <div></div>
</template>

<script lang="ts">
import Vue from "vue"
import { GrowShape } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop } from "vue-property-decorator"
import messages from "@/fixtures/Messages"

@Component({})
export default class Shape extends Vue {
  @Prop() growData!: GrowShape

  public mounted() {
    if (!this.growData) {
      throw console.error(messages.grow.missingGrowData)
    }
  }

  public get styleObj() {
    const transitionSpeed = this.growData.transitionSpeed
      ? this.growData.transitionSpeed
      : 0
    const borderKeys = ["top", "right", "bottom", "left"] as const
    const borders = {} as Record<string, string>
    for (const key of borderKeys) {
      const currentBorder = this.growData.border[key]
      const color = currentBorder.visibility
        ? this.growData.color
        : "transparent"
      borders[`border-${key}`] = `${currentBorder.size}px solid ${color}`
    }
    return {
      top: this.growData.position.top,
      right: this.growData.position.right,
      bottom: this.growData.position.bottom,
      left: this.growData.position.left,
      height: this.growData.height,
      width: this.growData.width,
      transition: `all ${transitionSpeed}s`,
      opacity: this.growData.opacity,
      "z-index": this.growData.zIndex,
      tabindex: this.growData.tabIndex,
      ...borders
    }
  }
}
</script>

<style scoped></style>
