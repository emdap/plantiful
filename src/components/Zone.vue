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
import ContainerMixin, { container } from "@/mixins/ContainerMixin.vue"
import { Prop } from "vue-property-decorator"
import { ContainerZone } from "@/store/interfaces"

@Component({})
export default class Zone extends ContainerMixin {
  @Prop({ required: true }) zoneData!: ContainerZone

  public mounted() {
    // console.log(this.$el.getBoundingClientRect())
    console.log(this.zoneData.widgets)
  }

  public get styleObj() {
    return {
      // height: this.zoneData.height + "%",
      // width: this.zoneData.width + "%"
      // height: this.zoneData.
    }
  }
}
</script>
