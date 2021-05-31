<template>
  <div
    ref="grid-parent"
    class="h-screen w-full overflow-auto scrollbar-light-mini dark:scrollbar-dark-mini"
  >
    <div class="h-full w-full flex" v-if="ready">
      <template v-for="(container, index) in containers">
        <div
          v-if="addDivider(index)"
          :key="'divider-' + index"
          :title="messages.dividerTitle"
          class="divider h-full z-10 cursor-pointer"
        >
          <div
            class="divider-line h-full opacity-30 transition-all border-l-0 border-pink-400 dark:border-yellow-400 border-dashed hover:border-l-2"
            :class="{ 'border-l-2': showDivider }"
            @mousedown="mouseUpdatesContainers($event, index)"
          />
        </div>
        <div
          v-else-if="index == 0"
          :key="'padding-left-' + index"
          ref="grid-padding"
          class="h-full"
          style="min-width: 0.25rem"
        />
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
    </div>
  </div>
</template>

<script lang="ts">
import Component, { mixins } from "vue-class-component"
import { Watch, Ref } from "vue-property-decorator"
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
  @Ref("grid-parent") gridParent!: HTMLElement
  @Ref("grid-padding") gridPadding!: HTMLElement[]

  public ready = false

  public dividers = {} as { [key: number]: HTMLDivElement }

  public containerIndex = 0
  public windowResizing = false
  public initGridWidth = 0
  public resizeTimer!: number
  public containersResizing = [] as number[]
  public showDivider = true

  public mounted() {
    this.addFixtures()
    this.ready = true
    // want users to notice the divider so they know it's draggable
    this.pulseDivider()

    window.addEventListener("resize", this.windowResize)
    document.addEventListener("mouseup", this.mouseUpdatesContainers)
    document.addEventListener("touchend", this.mouseUpdatesContainers)
    document.addEventListener("touchstart", this.checkDivider)

    this.$nextTick(() => {
      // containers won't be fully mounted until tick after ready = true
      this.setContainerSizes({ updateRatio: true, allContainers: true })
    })
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

  public checkDivider(e: TouchEvent) {
    if (e.type == "touchstart") {
      if (
        e.touches[0].target instanceof HTMLDivElement &&
        e.touches[0].target.classList.contains("divider-line")
      ) {
        e.touches[0].target.dispatchEvent(new Event("mousedown"))
      }
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

  public get addDivider() {
    return (index: number) => {
      return (
        index != 0 &&
        this.containers[index].size.width &&
        this.containers[index - 1].size.width
      )
    }
  }

  public windowResize() {
    clearTimeout(this.resizeTimer)

    // want to cache the grid size before resize, so that can calc container %
    // taking into account the grid-padding elements
    if (this.initGridWidth == 0) {
      this.initGridWidth = grid.overallWidth
    }

    this.windowResizing = true
    this.setContainerSizes()

    this.resizeTimer = setTimeout(() => {
      this.windowResizing = false
      this.initGridWidth = 0
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

  @Watch("enforceContainerMin")
  public stopEnforcing(enforce: boolean, wasEnforced: boolean) {
    if (!enforce && wasEnforced) {
      // update the size now that a minWidth is no longer being enforced
      this.setContainerSizes({ updateRatio: true })
    }
  }

  public setContainerSizes(
    options: { updateRatio?: boolean; allContainers?: boolean } = {
      updateRatio: false,
      allContainers: false,
    }
  ) {
    const { updateRatio, allContainers } = options
    const updateContainers = allContainers
      ? this.containers
      : this.containersWithWidth
    if (!(this.gridParent instanceof HTMLElement)) {
      this.$toasted.error(this.messages.generalError)
      return
    }
    const parentRect = this.gridParent.getBoundingClientRect()
    grid.setGridSize({ height: parentRect.height, width: parentRect.width })

    for (const container of updateContainers) {
      const containerEl = document.getElementById(container.name)
      if (!containerEl) {
        this.$toasted.error(this.messages.generalError)
        return
      }

      const { height, width } = containerEl.getBoundingClientRect()
      let newRatio!: Size
      const minWidth = this.enforceContainerMin ? 250 : width

      if (updateRatio || this.enforceContainerMin) {
        newRatio = {
          height: height / parentRect.height,
          width: minWidth / parentRect.width,
        }
      }
      grid.setContainerSize({
        id: container.id,
        newSize: { height, width: minWidth },
        newRatio,
      })
    }
  }

  public get containersWithWidth() {
    return this.containers.filter(c => {
      return c.size.width
    })
  }

  public get enforceContainerMin() {
    return (
      this.openContainers > 1 && grid.overallWidth < this.openContainers * 250
    )
  }

  public closeContainer(containerIndex: number) {
    // prioritize 'next' container for getting remaining width, else previous container
    const nextIndex =
      containerIndex < this.containersWithWidth.length - 1
        ? containerIndex + 1
        : containerIndex - 1
    // if there was only one container, do nothing
    if (nextIndex >= 0 && nextIndex < this.containersWithWidth.length) {
      const nextContainer = this.containersWithWidth[nextIndex]
      const closeContainer = this.containers[containerIndex]

      // tricky logic for small screens, want to enforce min-width/horizontal scroll
      //  ONLY IF screen width is too small & open containers > 1
      let newWidthRatio =
        closeContainer.sizeRatio.width + nextContainer.sizeRatio.width
      let newWidth = closeContainer.size.width + nextContainer.size.width
      if (!this.enforceContainerMin && newWidthRatio > 1) {
        const availWidth =
          grid.overallWidth - this.gridPadding[0].getBoundingClientRect().width
        newWidthRatio = availWidth / grid.overallWidth
        newWidth = availWidth
      }
      // add the closing container's width/width ratio to the next container, and reset the closing container
      grid.setContainerSize({
        id: nextContainer.id,
        newSize: {
          height: nextContainer.size.height,
          width: newWidth,
        },
        newRatio: {
          height: nextContainer.sizeRatio.height,
          width: newWidthRatio,
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

      let newWidth = nextContainer.size.width - restoreSize.width
      let newWidthRatio = nextContainer.sizeRatio.width - restoreRatio.width
      if (this.enforceContainerMin && this.containersWithWidth.length == 1) {
        // previously had 1 container open, now opening second, need to re-enforce minWidth on ratios
        // make both containers on small screen same size on restore
        newWidth = 250
        newWidthRatio = 250 / grid.overallWidth
        restoreSize.width = newWidth
        restoreRatio.width = newWidthRatio
      } else if (!this.enforceContainerMin && restoreRatio.width > 1) {
        // min was previously enforced, only way to get ratio > 1, but is no longer enforced
        //  set restore/next container to share space taken by next container
        newWidth = nextContainer.size.width / 2
        newWidthRatio = nextContainer.sizeRatio.width / 2
        restoreSize.width = newWidth
        restoreRatio.width = newWidthRatio
      }

      grid.setContainerSize({
        id: nextContainer.id,
        newSize: {
          height: nextContainer.size.height,
          width: newWidth,
        },
        newRatio: {
          height: nextContainer.sizeRatio.height,
          width: newWidthRatio,
        },
      })
      grid.setContainerSize({
        id: restoreContainer.id,
        newSize: restoreSize,
        newRatio: restoreRatio,
      })
    }
  }

  public mouseUpdatesContainers(
    e: MouseEvent | TouchEvent,
    containerIndex?: number
  ) {
    // container resizer only appears for indexes > 0
    if (containerIndex) {
      if (e instanceof MouseEvent) e.preventDefault()
      this.containerIndex = containerIndex
      this.trackSize = true

      document.addEventListener("mousemove", this.updateContainerSizes)
      document.addEventListener("touchmove", this.updateContainerSizes)
    } else {
      this.containerIndex = 0
      this.trackSize = false
      this.sizeStart = null
      this.containersResizing = []

      document.removeEventListener("mousemove", this.updateContainerSizes)
      document.removeEventListener("touchmove", this.updateContainerSizes)
    }
  }

  public updateContainerSizes(e: MouseEvent | TouchEvent) {
    const { pageX } =
      e instanceof MouseEvent ? e : e.touches[0] || e.changedTouches[0]

    // initialize values
    if (this.sizeStart == null) {
      this.sizeStart = {
        x: pageX,
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
      leftContainer.size.width + pageX - this.sizeStart.x
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

      this.sizeStart.x = pageX
    }
  }

  @Watch("movingZones")
  public trackMouse(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.mouseHighlightsZones)
      document.addEventListener("touchmove", this.mouseHighlightsZones)
    } else {
      document.removeEventListener("mousemove", this.mouseHighlightsZones)
      document.removeEventListener("touchmove", this.mouseHighlightsZones)
    }
  }

  public mouseHighlightsZones(e: MouseEvent | TouchEvent) {
    // can't use mouseenter/mouseleaves on zone as widget is still child of zone as it's being dragged :(
    const { pageX, pageY } =
      e instanceof MouseEvent ? e : e.touches[0] || e.changedTouches[0]
    const mousePos = { x: pageX, y: pageY }
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
      if (grow.plants[this.testPlant.id] == this.testPlant) {
        if (this.testPlant.id == grow.activeGrowPlant?.id) {
          grow.removeActivePlant()
        }
        grow.deletePlant(this.testPlant)
      }
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

  @Watch("zone4.open")
  public zone4Open(open: boolean) {
    if (this.growWidget.currentZone == this.growWidget.defaultZone) {
      // want growWidget to take up all columns if zone 4 is closed, and it's in zone 3 (default zone)
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

  // @Watch("growWidget.open")
  // public growOpen(open: boolean) {
  //   if (!open) {
  //     this.toggleGrowHelpers(false)
  //   }
  // }

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

  public get zone4() {
    return this.getZone(4)
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
