<template>
  <div :id="mainId" class="h-screen w-full flex overflow-auto">
    <template v-if="ready">
      <template v-for="(container, index) in containers">
        <div
          v-if="index != 0 && container.size.width"
          :key="'divider-' + index"
          :title="messages.dividerTitle"
          class="divider h-full z-10 cursor-pointer"
          @mousedown="resizeContainers($event, index)"
        >
          <div
            class="divider-line h-full opacity-30 transition-all border-l-0 border-pink-400 dark:border-yellow-400 border-dashed hover:border-l-2"
            :class="{ 'border-l-2': showDivider }"
          />
        </div>
        <container
          :containerData="container"
          :containerIndex="index"
          :resizing="isResizing(container.id)"
          :key="index"
          @close-container="closeContainer"
          @restore-container="restoreContainer"
          @show-divider="toastAndPulse"
        />
      </template>
      <!-- zone used for undocked widgets -->
      <zone v-if="ready" :zoneData="getZone(0)" />
    </template>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import { Watch } from "vue-property-decorator"
import containerFixture from "@/fixtures/Grid/Containers"
import zonesFixture from "@/fixtures/Grid/Zones"
import widgetsFixture from "@/fixtures/Grid/Widgets"
import GridMixin, { grid } from "@/mixins/GridMixin.vue"
import { grow } from "@/mixins/GrowMixin.vue"
import Container from "@/components/Grid/Container.vue"
import Zone from "@/components/Grid/Zone.vue"
import ThreeDotsIcon from "@/assets/icons/three-dots.svg"
import util from "@/utilities/containerUtil"
import { GrowPlant, Size } from "@/store/interfaces"
import { TEST_PLANT } from "@/fixtures/Grow/TestPlant"
import { NO_SIZE } from "@/fixtures/Defaults"

@Component({
  components: {
    Container,
    Zone,
    ThreeDotsIcon,
  },
})
export default class GridController extends mixins(GridMixin) {
  public ready = false
  public mainId = "grid-controller"

  public containerIndex = 0
  public windowResizing = false
  public resizeTimer!: number
  public containersResizing = [] as number[]
  public showDivider = true

  public mounted() {
    this.addFixtures()
    window.addEventListener("resize", this.windowResize)
    document.addEventListener("mouseup", this.resizeContainers)
    this.ready = true
    this.$nextTick(() => {
      // containers won't be fully mounted until tick after ready = true
      this.setContainerSizes(true)
    })
    // want users to notice the divider so they know it's draggable
    this.pulseDivider()
  }

  public pulseDivider() {
    this.showDivider = true
    setTimeout(() => {
      this.showDivider = false
    }, 2000)
  }

  public toastAndPulse() {
    if (
      this.containers.filter(c => {
        return c.size.width
      }).length > 1
    ) {
      this.$toasted.info(
        "To expand width further, click & drag the dotted line"
      )
      this.pulseDivider()
    }
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
    this.testPlant = await grow.growPlant({
      basePlant: TEST_PLANT,
      varyColors: true,
    })

    grow.addPlant(this.testPlant)
    grow.setActivePlant(this.testPlant.id)
  }

  public windowResize() {
    clearTimeout(this.resizeTimer)

    this.windowResizing = true
    this.setContainerSizes()

    this.resizeTimer = setTimeout(() => {
      this.windowResizing = false
    }, 250)
  }

  public get isResizing() {
    return (id: number) => {
      if (!this.trackSize && !this.windowResizing) {
        return false
      } else if (this.windowResizing) {
        return true
      } else {
        return this.containersResizing.indexOf(id) != -1
      }
    }
  }

  public setContainerSizes(updateRatio = false) {
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
      const nextContainer = this.containers[nextIndex]
      if (!nextContainer.size.width) {
        // next container already closed
        return
      }
      const closeContainer = this.containers[containerIndex]
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
      const nextContainer = this.containers[nextIndex]
      const restoreContainer = this.containers[containerIndex]

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
    // container resizer only appears for indexes > 0
    if (containerIndex) {
      e.preventDefault()
      this.containerIndex = containerIndex
      this.trackSize = true
    } else {
      this.containerIndex = 0
      this.trackSize = false
    }
  }

  @Watch("trackSize")
  mouseUpdatesSize(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.updateContainerSizes)
    } else {
      this.sizeStart = null
      this.containersResizing = []
      document.removeEventListener("mousemove", this.updateContainerSizes)
    }
  }

  public updateContainerSizes(e: MouseEvent) {
    e.preventDefault()

    // initialize values
    if (this.sizeStart == null) {
      this.sizeStart = {
        x: e.pageX,
        y: 0, // only really need x in this case
      }
    }
    const leftContainer = this.containers[this.containerIndex - 1]
    const rightContainer = this.containers[this.containerIndex]

    if (!this.containersResizing.length) {
      this.containersResizing = [leftContainer.id, rightContainer.id]
    }

    const leftWidth = Math.min(
      this.gridSize.width,
      leftContainer.size.width + e.pageX - this.sizeStart.x
    )

    const leftWidthRatio = leftWidth / this.gridSize.width
    const rightWidth = this.gridSize.width - leftWidth
    const rightWidthRatio = 1 - leftWidthRatio

    if (leftWidthRatio >= 0.1 && leftWidthRatio <= 0.9) {
      // should have 1 action for all of these, take dataKey, pass the key into updateSize
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

      this.sizeStart.x = e.pageX
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
      this.toggleSearchers(false)
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

  @Watch("controlsWidget.open")
  public controlsOpen(open: boolean) {
    if (this.growWidget.currentZone == this.growWidget.defaultZone) {
      // want growWidget to take up all columns if controls closed, and it's in zone 3 (default zone)
      if (open) {
        grid.updateZoneColumns({
          zone: this.growWidget.currentZone,
          newColumns: [1, 2],
        })
      } else {
        grid.updateZoneColumns({
          zone: this.growWidget.currentZone,
          newColumns: [1, 2, 3],
        })
      }
    }
  }

  @Watch("growWidget.open")
  public growOpen(open: boolean) {
    if (!open) {
      this.toggleGrowHelpers(false)
    }
  }

  public toggleSearchers(open: boolean) {
    if (this.searchWidget.open != open) {
      grid.toggleWidget(this.searchWidget)
    }
    if (this.activePlantWidget.open != open) {
      grid.toggleWidget(this.activePlantWidget)
    }
  }

  public closeWelcome() {
    if (this.welcomeWidget.open) {
      grid.toggleWidget(this.welcomeWidget)
    }
  }

  public toggleGrowHelpers(show: boolean) {
    grid.toggleWidgetName({ name: "controls", forceShow: show })
    grid.toggleWidgetName({ name: "select-create", forceShow: show })
  }

  // @Watch("showControls")
  // public openControls(show: boolean) {
  //   this.toggleGrowHelpers(show)
  // }

  @Watch("hasGrowPlants")
  public openGrow(show: boolean) {
    if (show && !this.growWidget.open) {
      grid.toggleWidget(this.growWidget)
    }
  }

  public get growWidget() {
    return this.getWidget("grow")
  }

  public get controlsWidget() {
    return this.getWidget("controls")
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
#grid-controller {
  grid-area: main-grid;
}

#plant-lookup {
  width: 33%;
}

#plant-playground {
  width: 67%;
}

.divider {
  /* need this to exact match zone padding */
  @apply -mx-1 min-w-2;
}

.divider-line {
  /* custom class to center border line, aligned with above class */
  @apply ml-border-1;
}

.zone {
  /* using padding instead of grid gap so that empty grid cols/rows have no width */
  @apply p-1 bg-clip-content;
}
</style>
