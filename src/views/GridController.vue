<template>
  <div class="w-full h-full">
    <div v-if="ready" :id="mainId" class="w-full h-full flex overflow-auto">
      <template v-for="(container, index) in containers">
        <div
          v-if="index != 0"
          :key="'divider-' + index"
          class="divider h-full z-10 cursor-pointer"
          @mousedown="resizeContainers($event, index)"
        />
        <container
          class="container"
          :id="container.name"
          :containerData="container"
          :containerIndex="index"
          :key="index"
          @close-container="closeContainer"
          @restore-container="restoreContainer"
        />
      </template>
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
import Container from "@/components/Grid/Container.vue"
import Zone from "@/components/Grid/Zone.vue"
import util from "@/utilities/containerUtil"
import { GrowPlant, Position, Size } from "@/store/interfaces"
import { TEST_PLANT } from "@/fixtures/Grow/TestPlant"
import { NO_SIZE } from "@/fixtures/Defaults"

@Component({
  components: {
    Container,
    Zone,
  },
})
export default class GridController extends mixins(GridMixin, GrowMixin) {
  public ready = false
  public mainId = "grid-controller"

  // TODO: add this to GridMixin and use same code in Widget.vue -- parts tagged with // M
  public trackSize = false
  public sizeStart = null as Position | null

  public containerIndex = 0

  public mounted() {
    this.addFixtures()
    window.addEventListener("resize", this.windowResize)
    document.addEventListener("mouseup", this.resizeContainers)
    this.ready = true
    this.$nextTick(() => {
      // containers won't be fully mounted until tick after ready = true
      this.setContainerSizes(true)
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
    this.setContainerSizes()
  }

  public setContainerSizes(updateRatio = false) {
    // #container is defined in App.vue, is 100vh and 100vw - menu size
    const parentContainer = document.getElementById(this.mainId)
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

  public closeContainer(containerIndex: number) {
    // prioritize 'next' container for getting remaining width, else previous container
    const nextIndex =
      containerIndex < this.containers.length - 1
        ? containerIndex + 1
        : containerIndex - 1
    // if there was only one container, do nothing
    if (nextIndex >= 0) {
      const closeContainer = this.containers[containerIndex]
      const nextContainer = this.containers[nextIndex]

      // add the closing container's width/width ratio to the next container, and reset the closing container
      grid.setContainerSize({
        id: nextContainer.id,
        newSize: {
          height: nextContainer.size.height,
          width: closeContainer.size.width + nextContainer.size.width,
        },
        newRatio: {
          height: nextContainer.sizeRatio.height,
          width: closeContainer.sizeRatio.width + nextContainer.sizeRatio.width,
        },
      })

      grid.setContainerSize({
        id: closeContainer.id,
        newSize: NO_SIZE(),
        newRatio: NO_SIZE(),
      })
    }
  }

  public restoreContainer(
    containerIndex: number,
    restoreSize: Size,
    restoreRatio: Size
  ) {
    // taking back width from the container that got it in 'closeContainer'
    const nextIndex =
      containerIndex < this.containers.length - 1
        ? containerIndex + 1
        : containerIndex - 1
    if (nextIndex >= 0) {
      const restoreContainer = this.containers[containerIndex]
      const nextContainer = this.containers[nextIndex]

      grid.setContainerSize({
        id: nextContainer.id,
        newSize: {
          height: nextContainer.size.height,
          width: nextContainer.size.width - restoreSize.width,
        },
        newRatio: {
          height: nextContainer.sizeRatio.height,
          width: nextContainer.sizeRatio.width - restoreRatio.width,
        },
      })

      grid.setContainerSize({
        id: restoreContainer.id,
        newSize: restoreSize,
        newRatio: restoreRatio,
      })
    }
  }

  public resizeContainers(e: MouseEvent, containerIndex?: number) {
    if (containerIndex) {
      e.preventDefault()
      this.containerIndex = containerIndex
      this.trackSize = true
    } else {
      this.containerIndex = 0
      this.trackSize = false
    }
  }

  // M
  @Watch("trackSize")
  mouseUpdatesSize(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.updateContainerSizes)
    } else {
      this.sizeStart = null
      document.removeEventListener("mousemove", this.updateContainerSizes)
    }
  }

  // M -- hmm actually this is a unique case with two entities & taking into account divider width
  public updateContainerSizes(e: MouseEvent) {
    e.preventDefault()
    // let startWidth!: number

    // initialize values
    if (this.sizeStart == null) {
      this.sizeStart = {
        x: e.pageX,
        y: e.pageY, // only need x in this case
      }
    }
    const leftContainer = this.containers[this.containerIndex - 1]
    const rightContainer = this.containers[this.containerIndex]

    // TODO: need to incorporate minimum widths
    const leftWidth = Math.min(
      this.gridSize.width,
      leftContainer.size.width + e.pageX - this.sizeStart.x
    )

    const leftWidthRatio = leftWidth / this.gridSize.width
    const rightWidth = this.gridSize.width - leftWidth
    const rightWidthRatio = 1 - leftWidthRatio

    if (leftWidthRatio >= 0.1 && leftWidthRatio <= 0.9) {
      // should have 1 action for all of these, take dataKey, pass the key into updateSize
      // also need to align widget properties TODO
      grid.setContainerSize({
        id: leftContainer.id,
        newSize: {
          height: leftContainer.size.height,
          width: leftWidth,
        },
        newRatio: {
          height: leftContainer.sizeRatio.height,
          width: leftWidthRatio,
        },
      })
      grid.setContainerSize({
        id: rightContainer.id,
        newSize: {
          height: rightContainer.size.height,
          width: rightWidth,
        },
        newRatio: {
          height: rightContainer.sizeRatio.height,
          width: rightWidthRatio,
        },
      })

      this.sizeStart = {
        x: e.pageX,
        y: e.pageY,
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
  public testPlant = {} as GrowPlant

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

  public get activePlantWidget() {
    return this.getWidget("active-plant")
  }

  public get searchWidget() {
    return this.getWidget("search")
  }

  public get welcomeWidget() {
    return this.getWidget("welcome")
  }
}
</script>

<style>
#grid-controller .container {
  display: grid;
  grid-auto-rows: auto;
  grid-auto-columns: auto;

  @apply h-full overflow-hidden;
}

#plant-lookup {
  width: 33%;
}

#plant-playground {
  width: 67%;
}

.divider {
  /* need this to exact match zone padding */
  margin: 0 -4px;
  min-width: 8px;
}

.zone {
  /* need to do padding instead of grid gap so that can calculate
  ratio of zone size -> grid size accurately */
  padding: 4px;

  @apply p-1 bg-clip-content;
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
