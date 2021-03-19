<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import ContainerModule from "@/store/modules/container"

export const container = getModule(ContainerModule)

@Component({})
export default class ContainerMixin extends Vue {
  public get widgets() {
    return container.widgets
  }

  public get countOpenWidgets() {
    return container.widgets.filter(w => {
      return w.open
    }).length
  }

  public get menuWidgets() {
    return container.widgets.filter(w => {
      return w.inMenu
    })
  }

  public get activeWidget() {
    return container.activeWidget
  }

  public getWidget(name: string) {
    return container.getWidget(name)
  }
}
</script>
