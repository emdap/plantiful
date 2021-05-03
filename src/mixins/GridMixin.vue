<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import GridModule from "@/store/modules/grid"
import { gridMessages } from "@/fixtures/Messages"
import {
  GridWidget,
  GridZone,
  GridContainer,
  Size,
  Position,
} from "@/store/interfaces"

export const grid = getModule(GridModule)

@Component({})
export default class GridMixin extends Vue {
  public messages = gridMessages

  // State getters
  public get movingZones() {
    return grid.movingZones
  }

  public get containerZones() {
    return grid.containerZones
  }

  public get activeWidget(): GridWidget | null {
    return grid.activeWidget
  }

  public get getWidget() {
    return grid.getWidget
  }

  public get getZone() {
    return grid.getZone
  }

  public get getContainer() {
    return grid.getContainer
  }

  public get zoneLastDim() {
    return grid.zoneLastDim
  }

  public get gridSize() {
    return {
      height: grid.overallHeight,
      width: grid.overallWidth,
    }
  }

  public get countOpenWidgets() {
    return Object.values(grid.widgets).filter(w => {
      return w.open
    }).length
  }

  public get containers() {
    return Object.values(grid.containers)
  }

  public get containerOpenZones() {
    return (containerId: number) => {
      return this.containerZones(containerId).filter(zone => {
        return zone.open
      })
    }
  }

  // public get containerMountedZones() {
  //   return (containerId: number) => {
  //     return this.containerZones(containerId).filter(zone => {
  //       return zone.mounted
  //     })
  //   }
  // }

  public get zoneWidgets() {
    return (zoneId: number) => {
      return grid.getZone(zoneId).widgets.map(id => {
        return grid.getWidget(id)
      })
    }
  }

  public get zoneOpenWidgets() {
    return (zone: GridZone) => {
      return zone.widgets.reduce(
        (openList: GridWidget[], curWidget: string) => {
          const widget = grid.getWidget(curWidget)
          if (widget.open) {
            openList.push(widget)
          }
          return openList
        },
        [] as GridWidget[]
      )
    }
  }

  // Mixin
  public sizeStart: Position | null = null
  public trackSize = false

  public getCurrentRect() {
    const el = this.$el as HTMLElement
    const { width, height, x, y } = el.getBoundingClientRect()
    const offsetX = el.offsetLeft
    const offsetY = el.offsetTop

    return {
      width: parseFloat(width.toFixed(2)),
      height: parseFloat(height.toFixed(2)),
      x,
      y,
      offsetX,
      offsetY,
    }
  }

  public updateSize(
    e: MouseEvent,
    payload: {
      minimum: Size
      maximum: Size
      entity: GridWidget | GridZone | GridContainer
    }
  ) {
    e.preventDefault()
    let startWidth!: number, startHeight!: number
    const { minimum, maximum, entity } = payload

    if (this.sizeStart == null) {
      this.sizeStart = {
        x: e.pageX,
        y: e.pageY,
      }
    }
    // initialize size if it is still 0
    if (!entity.size.height || !entity.size.width) {
      const { height, width } = this.getCurrentRect()
      startHeight = height
      startWidth = width
    } else {
      startHeight = entity.size.height
      startWidth = entity.size.width
    }

    const height = Math.min(
      maximum.height,
      Math.max(minimum.height, startHeight + e.pageY - this.sizeStart.y)
    )

    const width = Math.min(
      maximum.width,
      Math.max(minimum.width, startWidth + e.pageX - this.sizeStart.x)
    )

    this.sizeStart = {
      x: e.pageX,
      y: e.pageY,
    }

    return {
      height,
      width,
    }
  }
}
</script>
