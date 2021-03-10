<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import WindowModule from "@/store/modules/window"

export const window = getModule(WindowModule)

@Component({})
export default class WindowMixin extends Vue {
  public get widgets() {
    return window.widgets
  }

  public get menuWidgets() {
    return window.widgets.filter(w => {
      return w.inMenu
    })
  }

  public get activeWidget() {
    return window.activeWidget
  }

  public getWidget(name: string) {
    return window.getWidget(name)
  }
}
</script>
