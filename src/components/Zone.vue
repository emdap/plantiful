<template>
  <div
    class="overflow-auto scrollbar-thin scrollbar-light dark:scrollbar-dark justify-self-stretch align-self-stretch justify-items-stretch"
    :id="zoneData.gridArea"
    :class="[
      zoneData.id == 0 ? 'absolute' : 'static',
      `bg-opacity-20 bg-${zoneData.color}-200 dark:bg-${zoneData.color}-900 hover:bg-opacity-50`
    ]"
    :style="styleObj"
  >
    <template v-if="ready">
      <widget
        v-for="widget in zoneOpenWidgets(zoneData)"
        :widgetData="widget"
        :key="'widget-' + widget.name"
      >
        <x :is="widget.component" />
      </widget>
    </template>
  </div>
</template>

<script lang="ts">
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
  public ready = false

  public mounted() {
    this.ready = true
  }

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
