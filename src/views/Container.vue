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
        </zone>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { grow } from "@/mixins/GrowMixin.vue"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import Zone from "@/components/Zone.vue"
import containerFixture from "@/fixtures/Grid/Containers"
import zonesFixture from "@/fixtures/Grid/Zones"
import widgetsFixture from "@/fixtures/Grid/Widgets"
import { TEST_PLANT } from "@/fixtures/Grow/Defaults"
import { Watch } from "vue-property-decorator"

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
    this.setGridSize()
    window.addEventListener("resize", this.setGridSize)
  }

  public setGridSize() {
    // #container is defined in App.vue, is 100vh and 100vw - menu size
    const container = document.getElementById("container")
    if (!container) {
      return console.error("Container does not exist?")
    }
    const { height, width } = container.getBoundingClientRect()
    grid.setGridSize({ height, width })
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
  height: 100%;
}

/* #grid-container .container-wrapper { */
/* max-height: 100vh; */
/* max-width: 100%; */
/* overflow-y: auto; */
/* } */

#plant-lookup {
  /* grid-area: 1 / 1 / 1 / 2; */
  display: grid;
  grid-auto-rows: auto;
  height: 100vh;
  /* background-color: lime; */
}

#plant-playground {
  /* grid-area: 1 / 2 / 1 / 4; */
  display: grid;
  grid-auto-rows: auto;
  /* grid-gap: 0.25rem; */
  height: 100vh;
  /* background-color: green; */
}

.zone {
  background-clip: content-box !important;
  box-sizing: content-box;
  overflow: auto;
  @apply p-1;
}

#z-1 {
  background: blue;
  max-height: 100%;
  grid-area: 1 / 1 / 2 / 2;
}

#z-2 {
  background: teal;
  grid-area: 2 / 1 / 2 / 2;
}

#z-3 {
  background: purple;
  height: 62.5vh;
  width: 64.5vw;
  grid-area: 1 / 1 / 3 / 2;
}

#z-4 {
  background: violet;
  grid-area: 1 / 2 / 3 / 3;
}

#z-5 {
  background: pink;
  /* height: 37.5%; */
  grid-area: 3 / 1 / 4 / 3;
}
</style>
