<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import GridModule from "@/store/modules/grid"
import { GridWidget, GridZone } from "@/store/interfaces"
import menuWidgets from "@/fixtures/Grid/MenuWidgets"

export const grid = getModule(GridModule)

@Component({})
export default class GridMixin extends Vue {
  public get countOpenWidgets() {
    return Object.values(grid.widgets).filter(w => {
      return w.open
    }).length
  }

  public get widgets() {
    return Object.values(grid.widgets)
  }

  public get zones() {
    return Object.values(grid.zones)
  }

  public get menuWidgetList() {
    return menuWidgets
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
}
</script>
