<template>
  <div id="zone-wrapper" class="h-full">
    <!-- TODO: need containers afterall, for 2 separate grid systems -->
    <zone v-for="zone in zones" :key="zone.id" :zoneData="zone">
      <template v-for="widget in zone.widgets">
        <adjustable :widgetData="getWidget(widget)" :key="widget">
          <x :is="getWidget(widget).component" />
        </adjustable>
      </template>
    </zone>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import ContainerMixin, { container } from "@/mixins/ContainerMixin.vue"
import Zone from "@/components/Zone.vue"
import zonesFixture from "@/fixtures/Container/Zones"
import widgetsFixture from "@/fixtures/Container/Widgets copy"
import Adjustable from "@/components/Adjustable.vue"

@Component({
  components: {
    Zone,
    Adjustable
  }
})
export default class ZoneWrapper extends ContainerMixin {
  public mounted() {
    // register all zones and then widgets
    for (const zone of zonesFixture) {
      container.addZone(zone)
    }
    for (const widget of widgetsFixture) {
      container.addWidget(widget)
    }
  }
}
</script>

<style>
#zone-wrapper {
  display: grid;
  grid-template-columns: 1.5fr 1fr 1fr 1fr;
  grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
  gap: 0.25rem 0.25rem;
  grid-template-areas:
    "z-1 z-3 z-3 z-4"
    "z-1 z-3 z-3 z-4"
    "z-1 z-3 z-3 z-4"
    "z-1 z-3 z-3 z-4"
    "z-2 z-3 z-3 z-4"
    "z-2 z-5 z-5 z-5"
    "z-2 z-5 z-5 z-5"
    "z-2 z-5 z-5 z-5";
}

#z-1 {
  grid-area: z-1;
  background-color: lime;
}

#z-2 {
  grid-area: z-2;
  background-color: lime;
}

#z-3 {
  grid-area: z-3;
  background-color: green;
}

#z-4 {
  grid-area: z-4;
  background-color: green;
}

#z-5 {
  grid-area: z-5;
  background-color: green;
}
</style>
