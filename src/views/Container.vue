<template>
  <div id="grid-container" class="w-full">
    <!-- zone used for undocked widgets -->
    <zone v-if="fixturesAdded" :zoneData="getZone(0)" />
    <div
      class="container-wrapper"
      v-for="container in containers"
      :key="container.id"
      :id="container.name"
    >
      <template v-for="zone in containerZones(container.id)">
        <zone
          v-if="zoneOpenWidgets(zone).length"
          :key="'zone-' + zone.id"
          :zoneData="zone"
        >
          <!-- <template v-for="widget in zoneWidgets(zone.id)">
            <widget :widgetData="widget" :key="'widget-' + widget.id">
              <x :is="widget.component" />
            </widget>
          </template> -->
        </zone>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import Zone from "@/components/Zone.vue"
import containerFixture from "@/fixtures/Grid/Containers"
import zonesFixture from "@/fixtures/Grid/Zones"
import widgetsFixture from "@/fixtures/Grid/Widgets"

@Component({
  components: {
    Zone
  }
})
export default class Container extends GridMixin {
  public fixturesAdded = false

  public mounted() {
    // zones first as both widgets and containers reference them
    for (const zone of zonesFixture) {
      grid.addZone(zone)
    }
    for (const container of containerFixture) {
      grid.addContainer(container)
    }
    for (const widget of widgetsFixture) {
      grid.addWidget(widget)
    }

    this.fixturesAdded = true
  }
}
</script>

<style>
#grid-container {
  display: grid;
  /* grid-template-columns: 1fr 2fr; */
  grid-template-columns: minmax(min-content, 1fr) minmax(min-content, 2fr);
  /* grid-template-rows: 1fr 1fr 1fr 1fr 1fr 1fr 1fr 1fr; */
  gap: 0.25rem;
  grid-template-areas: "lookup playground";
  max-height: 100%;
}

#grid-container .container-wrapper {
  max-height: 100%;
  /* max-width: 100%; */
  overflow-y: auto;
}

#plant-lookup {
  /* grid-area: 1 / 1 / 1 / 2; */
  display: grid;
  grid-auto-rows: auto;
  grid-gap: 0.25rem;
  background-color: lime;
}

#plant-playground {
  /* grid-area: 1 / 2 / 1 / 4; */
  display: grid;
  grid-auto-rows: auto;
  grid-gap: 0.25rem;
  background-color: green;
}

#z-1 {
  background: blue;
  grid-area: 1 / 1 / 2 / 2;
}

#z-2 {
  background: teal;
  grid-area: 2 / 1 / 2 / 2;
}

#z-3 {
  background: purple;
  grid-area: 1 / 1 / 3 / 2;
}

#z-4 {
  background: violet;
  grid-area: 1 / 2 / 3 / 3;
}

#z-5 {
  background: pink;
  grid-area: 3 / 1 / 4 / 3;
}
</style>
