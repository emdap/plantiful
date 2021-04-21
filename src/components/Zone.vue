<template>
  <div
    class="zone"
    :id="zoneData.gridArea"
    :class="{ absolute: zoneData.id == 0 }"
    :style="styleObj"
  >
    <!-- :style="styleObj" -->
    <widget
      v-for="widget in zoneWidgets(zoneData.id)"
      :widgetData="widget"
      :key="'widget-' + widget.name"
    >
      <x :is="widget.component" />
    </widget>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import { Prop } from "vue-property-decorator"
import { GridZone } from "@/store/interfaces"
import Widget from "@/components/Widget.vue"

@Component({
  components: {
    Widget
  }
})
export default class Zone extends GridMixin {
  @Prop({ required: true }) zoneData!: GridZone

  public get styleObj() {
    if (this.zoneData.id == 0) {
      return { height: 0, width: 0 }
    }
    const style = { width: "", height: "" }
    if (this.zoneData.width) {
      style.width = this.zoneData.width + "px"
    }
    if (this.zoneData.height) {
      style.height = this.zoneData.height + "px"
    }
    return style
  }
}
</script>
