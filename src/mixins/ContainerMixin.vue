<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import ContainerModule from "@/store/modules/container"
import { WidgetEntity } from "@/store/interfaces"

export const container = getModule(ContainerModule)

@Component({})
export default class ContainerMixin extends Vue {
  // public get widgets() {
  //   return container.widgets
  // }

  public get countOpenWidgets() {
    return Object.values(container.widgets).filter(w => {
      return w.open
    }).length
  }

  // public get menuWidgetKeys() {
  //   return Object.keys(container.widgets)
  // }

  public get widgetList() {
    return Object.values(container.widgets)
  }

  public get activeWidget(): WidgetEntity | null {
    return container.activeWidget
  }

  public get getWidget() {
    return (name: string): WidgetEntity => {
      //   return container.getWidget(name)
      return container.getWidget(name)
    }
  }
}
</script>
