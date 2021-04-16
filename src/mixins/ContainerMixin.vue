<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import ContainerModule from "@/store/modules/container"
import { WidgetCopy, ContainerZone } from "@/store/interfaces"
import menuWidgets from "@/fixtures/Container/MenuWidgets"

export const container = getModule(ContainerModule)

@Component({})
export default class ContainerMixin extends Vue {
  public get countOpenWidgets() {
    return Object.values(container.widgets).filter(w => {
      return w.open
    }).length
  }

  public get widgets() {
    return Object.values(container.widgets)
  }

  public get zones() {
    return Object.values(container.zones)
  }

  public get menuWidgetList() {
    return menuWidgets
  }

  public get activeWidget(): WidgetCopy | null {
    return container.activeWidget
  }

  public get getWidget() {
    return (name: string): WidgetCopy => {
      //   return container.getWidget(name)
      return container.getWidget(name)
    }
  }

  public get getZone() {
    return (id: number): ContainerZone => {
      //   return container.getWidget(name)
      return container.getZone(id)
    }
  }
}
</script>
