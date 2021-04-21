<template>
  <div id="grid-container" class="w-full h-full gap-2 px-2 py-1">
    <!-- zone used for undocked widgets -->
    <zone v-if="fixturesAdded" :zoneData="getZone(0)" />
    <div
      class="container-wrapper"
      :class="growContainer(container.id) ? 'flex-grow' : 'flex-grow-0'"
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
import Component from "vue-class-component"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import Zone from "@/components/Zone.vue"
import containerFixture from "@/fixtures/Grid/Containers"
import zonesFixture from "@/fixtures/Grid/Zones"
import widgetsFixture from "@/fixtures/Grid/Widgets"
import { GridContainer } from "@/store/interfaces"

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

  public get growContainer() {
    return (id: number) => {
      return this.containerZones(id).filter(z => {
        return this.zoneOpenWidgets(z).length
      }).length
    }
  }
}
</script>

<style>
#grid-container {
  display: flex;
  /* grid-template-columns: 1fr 2fr; */
  /* grid-template-columns: fit-content(33vw) auto; */
  /* grid-template-areas: "lookup playground"; */
  overflow: auto;
}

#grid-container .container-wrapper {
  height: 100%;
  display: grid;
  grid-auto-rows: 1fr;
  grid-auto-columns: 1fr;
  overflow: auto;
  @apply gap-2;
}

#plant-lookup {
  width: 33%;
}

#plant-playground {
  width: 67%;
  /* flex-grow: 2; */
}

.zone {
  background-clip: content-box !important;
  box-sizing: content-box;
  overflow: auto;
}

#z-1 {
  grid-area: 1 / 1 / 2 / 2;
}

#z-2 {
  grid-area: 2 / 1 / 2 / 2;
}

#z-3 {
  grid-area: 1 / 1 / 3 / 3;
}

#z-4 {
  grid-area: 1 / 3 / 3 / 4;
}

#z-5 {
  grid-area: 3 / 1 / 4 / 4;
  /* grid-area: auto; */
  /* grid-column: 1 / -1; */
}
</style>
