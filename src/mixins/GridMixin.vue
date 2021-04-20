<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import GridModule from "@/store/modules/grid"
import { GridWidget, GridZone, GridContainer } from "@/store/interfaces"
import menuWidgets from "@/fixtures/Grid/MenuWidgets"

export const grid = getModule(GridModule)

@Component({})
export default class GridMixin extends Vue {
  public get countOpenWidgets() {
    return Object.values(grid.widgets).filter(w => {
      return w.open
    }).length
  }

  // public get widgets() {
  //   return Object.values(grid.widgets)
  // }

  // public get zones() {
  //   return Object.values(grid.zones)
  // }

  public get containers() {
    return Object.values(grid.containers)
  }

  public get menuWidgetList() {
    return menuWidgets
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
      //   return grid.getWidget(name)
      return grid.getWidget(name)
    }
  }

  public get getZone() {
    return (id: number): GridZone => {
      //   return grid.getWidget(name)
      return grid.getZone(id)
    }
  }

  public get getContainer() {
    return (id: number): GridContainer => {
      return grid.getContainer(id)
    }
  }
}
</script>
