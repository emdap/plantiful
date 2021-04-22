<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import GridModule from "@/store/modules/grid"
import {
  GridWidget,
  GridZone,
  GridContainer,
  MenuWidget
} from "@/store/interfaces"

export const grid = getModule(GridModule)

@Component({})
export default class GridMixin extends Vue {
  public get movingZones() {
    return grid.movingZones
  }

  public get countOpenWidgets() {
    return Object.values(grid.widgets).filter(w => {
      return w.open
    }).length
  }

  public get containers() {
    return Object.values(grid.containers)
  }

  public get containerZones() {
    return (containerId: number) => {
      return grid.getContainer(containerId).zones.map(id => {
        return grid.getZone(id)
      })
    }
  }

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

  public get activeWidget(): GridWidget | null {
    return grid.activeWidget
  }

  public get getWidget() {
    return (name: string): GridWidget => {
      return grid.getWidget(name)
    }
  }

  public get getZone() {
    return (id: number): GridZone => {
      return grid.getZone(id)
    }
  }

  public get getContainer() {
    return (id: number): GridContainer => {
      return grid.getContainer(id)
    }
  }

  public get gridSize() {
    return {
      height: grid.overallHeight,
      width: grid.overallWidth
    }
  }

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
      offsetY
    }
  }
}
</script>
