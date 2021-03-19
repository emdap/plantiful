import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import {
  ContainerState,
  WidgetEntity,
  DefaultWidget,
  WidgetStateOptionals
} from "@/store/interfaces"
import messages from "@/fixtures/Messages"
import store from "@/store"

@Module({
  dynamic: true,
  namespaced: true,
  name: "container",
  store
})
export default class ContainerModule extends VuexModule
  implements ContainerState {
  widgets: WidgetEntity[] = []
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
    console.log("toggle widget", widget.name, widget.open)
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
    // assign defaults to empty properties
    // move this to a function, or just do it from the components themselves
    // for (const key of WidgetStateOptionals) {
    //   if (widget[key] == undefined) {
    //     widget[key] = DefaultWidget[key]
    //   }
    // }
    this.widgets.push(widget as WidgetEntity)
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
    return (name: string): WidgetEntity | undefined => {
      return this.widgets.find(w => {
        return w.name == name
      })
    }
  }
}
