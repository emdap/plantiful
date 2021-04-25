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
    <!-- zone used for undocked widgets -->
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
import Zone from "@/components/Grid/Zone.vue"
import util from "@/utilities/containerUtil"
import { GrowPlant, Size } from "@/store/interfaces"
import { TEST_PLANT } from "@/fixtures/Grow/TestPlant"

@Component({
  components: {
    Zone,
  },
})
export default class Container extends mixins(GridMixin, GrowMixin) {
  public ready = false
  public testPlant = {} as GrowPlant

  public mounted() {
    this.addFixtures()
    window.addEventListener("resize", this.windowResize)
    this.ready = true
    this.$nextTick(() => {
      // containers won't be fully mounted until tick after ready = true
      this.setContainerSize(true)
    })
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

  public windowResize() {
    this.setContainerSize()
  }

  public setContainerSize(updateRatio = false) {
    // #container is defined in App.vue, is 100vh and 100vw - menu size
    const parentContainer = document.getElementById("container")
    if (!parentContainer) {
      this.$toasted.error(this.messages.generalError)
      return
    }
    const parentRect = parentContainer.getBoundingClientRect()
    grid.setGridSize({ height: parentRect.height, width: parentRect.width })

    for (const container of this.containers) {
      const containerEl = document.getElementById(container.name)
      if (!containerEl) {
        this.$toasted.error(this.messages.generalError)
        return
      }
      const { height, width } = containerEl.getBoundingClientRect()
      let newRatio!: Size

      if (updateRatio) {
        newRatio = {
          height: height / parentRect.height,
          width: width / parentRect.width,
        }
      }
      grid.setContainerSize({
        id: container.id,
        newSize: { height, width },
        newRatio,
      })
    }
  }

  public get containerStyle() {
    return (id: number) => {
      const container = this.getContainer(id)
      if (container.sizeRatio.height && container.sizeRatio.width) {
        return {
          height: container.sizeRatio.height * 100 + "%",
          width: container.sizeRatio.width * 100 + "%",
        }
      }
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
  public get activePlantWidget() {
    return this.getWidget("active-plant")
  }

  public get searchWidget() {
    return this.getWidget("search")
  }

  public get welcomeWidget() {
    return this.getWidget("welcome")
  }

  public closeSearchers() {
    if (this.searchWidget?.open) {
      grid.toggleWidget(this.searchWidget)
    }
    if (this.activePlantWidget?.open) {
      grid.toggleWidget(this.activePlantWidget)
    }
  }

  public closeWelcome() {
    if (this.welcomeWidget.open) {
      grid.toggleWidget(this.welcomeWidget)
    }
  }

  @Watch("welcomeWidget.open")
  public toggleWelcome(open: boolean) {
    if (open) {
      this.growTestPlant()
      this.closeSearchers()
    } else {
      grow.removeActivePlant()
      grow.deleteEntity({ dataKey: "plants", id: this.testPlant.id })
    }
  }

  @Watch("searchWidget.open")
  public searchOpen(open: boolean) {
    if (open) {
      this.closeWelcome()
    }
  }

  @Watch("activePlantWidget.open")
  public activePlantOpen(open: boolean) {
    if (open) {
      this.closeWelcome()
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
