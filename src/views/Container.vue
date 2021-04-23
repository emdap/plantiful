<template>
  <div class="w-full h-full">
    <div v-if="ready" id="grid-container" class="w-full h-full">
      <div
        class="container-wrapper"
        :style="containerStyle(container.id)"
        v-for="container in containers"
        :key="container.id"
        :id="container.name"
      >
        <template v-for="zone in containerZones(container.id)">
          <zone
            v-if="zone.open"
            :key="'zone-' + zone.id"
            :zoneData="zone"
            :containerId="container.id"
          >
          </zone>
        </template>
      </div>
    </div>
    <!-- zone used for undocked widgets -- // TODO: should make new component that just iterates widgets -->
    <zone v-if="ready" :zoneData="getZone(0)" />
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import { Watch } from "vue-property-decorator"
import containerFixture from "@/fixtures/Grid/Containers"
import zonesFixture from "@/fixtures/Grid/Zones"
import widgetsFixture from "@/fixtures/Grid/Widgets"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import Zone from "@/components/Zone.vue"
import util from "@/utilities/containerUtil"
import { GrowPlant } from "@/store/interfaces"
import { TEST_PLANT } from "@/fixtures/Grow/Defaults"

@Component({
  components: {
    Zone
  }
})
export default class Container extends mixins(GridMixin, GrowMixin) {
  public ready = false
  public testPlant = {} as GrowPlant

  public mounted() {
    this.addFixtures()
    this.setGridSize()
    window.addEventListener("resize", this.setGridSize)
    this.ready = true
  }

  public addFixtures() {
    for (const container of containerFixture) {
      grid.addContainer(container)
    }
    for (const zone of zonesFixture) {
      grid.addZone(zone)
    }
    for (const widget of widgetsFixture) {
      grid.addWidget(widget)
    }
  }

  public async growTestPlant() {
    this.testPlant = await this.growPlant(TEST_PLANT)
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

  public get containerStyle() {
    return (id: number) => {
      // might have to add more to this
      // TODO: dynamic sizing for containers like there is for zones, or leverage CSS
      return this.containerOpenZones(id).length ? "flex-grow: 1" : "width: 0"
    }
  }

  @Watch("movingZones")
  public trackMouse(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.mouseHighlightsZones)
    } else {
      document.removeEventListener("mousemove", this.mouseHighlightsZones)
    }
  }

  public mouseHighlightsZones(e: MouseEvent) {
    // can't use mouseenter/mouseleaves on zone as widget is still child of zone as it's being dragged :(
    const mousePos = { x: e.pageX, y: e.pageY }
    if (!grid.targetZone) {
      grid.setTargetZone(mousePos)
    } else {
      const distance = util.checkMouseZoneDistance(
        mousePos,
        grid.targetZone.startPoint,
        grid.targetZone.endPoint
      )
      // only update target zone when mouse leaves
      if (distance.x != 0 || distance.y != 0) {
        grid.setTargetZone(mousePos)
      }
    }
  }

  // Particular logic for widgets can go here
  public get welcomeWidget() {
    return this.getWidget("welcome")
  }

  @Watch("welcomeWidget.open")
  public toggleWelcome(open: boolean) {
    if (open) {
      this.growTestPlant()
    } else {
      grow.removeActivePlant()
      grow.deleteEntity({ dataKey: "plants", id: this.testPlant.id })
    }
  }
}
</script>

<style>
#grid-container {
  display: flex;
  overflow: auto;
}

#grid-container .container-wrapper {
  height: 100%;
  display: grid;
  grid-auto-rows: auto;
  grid-auto-columns: auto;
  overflow: auto;
}

#plant-lookup {
  width: 33%;
}

#plant-playground {
  width: 67%;
}

.zone {
  /* need to do padding instead of grid gap so that can calculate
  ratio of zone size -> grid size accurately */
  background-clip: content-box !important;
  padding: 4px;
}

#z-1 {
  grid-area: 1 / 1 / 2 / 2;
}

#z-2 {
  /* grid-area: 2 / 1 / 2 / 2; */
}

#z-3 {
  grid-area: 1 / 1 / 3 / 3;
}

#z-4 {
  grid-area: 1 / 3 / 3 / 4;
}

#z-5 {
  grid-column: 1 / 4;
}
</style>
