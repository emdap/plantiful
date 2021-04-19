<template>
  <div
    :id="zoneData.gridArea"
    :style="styleObj"
    :class="{ absolute: zoneData.id == 0 }"
  >
    <!-- Zone {{zoneData.id}} -->
    <slot></slot>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import { Prop } from "vue-property-decorator"
import { GridZone } from "@/store/interfaces"

@Component({})
export default class Zone extends GridMixin {
  @Prop({ required: true }) zoneData!: GridZone

  // public mounted() {
  //   // console.log(this.$el.getBoundingClientRect())
  // }

  // public get styleObj() {
  //   return {
  //     // height: this.zoneData.height + "%",
  //     // width: this.zoneData.width + "%"
  //     // height: this.zoneData.
  //   }
  // }
}
</script>
