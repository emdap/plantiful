import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import { ContainerState, WidgetEntity } from "@/store/interfaces"
import messages from "@/fixtures/Messages"
import store from "@/store"
import Vue from "vue"

@Module({
  dynamic: true,
  namespaced: true,
  name: "container",
  store
})
export default class ContainerModule extends VuexModule
  implements ContainerState {
  widgets: { [key: string]: WidgetEntity } = {}
  activeWidget: WidgetEntity | null = null

  @Action
  public registerWidget(widget: WidgetEntity) {
    if (!widget.name) {
      throw console.error(messages.widget.registerError)
    }
    if (!this.getWidget(widget.name)) {
      this.REGISTER_WIDGET(widget)
      // this.SORT_WIDGETS()
    }
  }

  @Action
  public toggleFocus(widget: WidgetEntity) {
    if (widget) {
      this.TOGGLE_FOCUS(widget)
    }
  }

  @Action
  public toggleWidget(widget: WidgetEntity) {
    if (widget) {
      this.TOGGLE_WIDGET(widget)
      // this.SORT_WIDGETS()
    }
  }

  @Action
  public toggleDocked(widget: WidgetEntity) {
    if (widget) {
      this.TOGGLE_DOCKED(widget)
    }
  }

  // TODO: have focus actions/controls from widgets
  @Mutation
  public TOGGLE_FOCUS(widget: WidgetEntity) {
    if (this.activeWidget == widget) {
      this.activeWidget = null
    } else {
      this.activeWidget = widget
    }
  }

  @Mutation
  public REGISTER_WIDGET(widget: WidgetEntity) {
    Vue.set(this.widgets, widget.name, widget)
  }

  @Mutation
  public TOGGLE_WIDGET(widget: WidgetEntity) {
    widget.open = !widget.open
  }

  @Mutation
  public TOGGLE_DOCKED(widget: WidgetEntity) {
    widget.docked = !widget.docked
  }

  // TODO: modify widget positioning based on order, draggable to change order
  // not using currently - future enhancement
  // @Mutation
  // public INC_ORDER(widget: WidgetEntity) {
  //   widget.order++
  // }

  // @Mutation
  // public DEC_ORDER(widget: WidgetEntity) {
  //   widget.order--
  // }

  // @Mutation
  // public SORT_WIDGETS() {
  //   this.widgets.sort((a: WidgetEntity, b: WidgetEntity) => {
  //     return a.order - b.order
  //   })
  // }

  public get getWidget() {
    return (name: string): WidgetEntity => {
      return this.widgets[name]
    }
  }
}
