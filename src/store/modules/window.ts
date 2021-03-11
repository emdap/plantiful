import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import {
  WindowState,
  WidgetState,
  DefaultWidget,
  WidgetStateProp,
  WidgetStateOptionals
} from "@/store/interfaces"
import messages from "@/fixtures/Messages"
import store from "@/store"

@Module({
  dynamic: true,
  namespaced: true,
  name: "window",
  store
})
export default class WindowModule extends VuexModule implements WindowState {
  widgets: WidgetState[] = []
  activeWidget: WidgetState | null = null

  @Action
  public registerWidget(widget: WidgetStateProp) {
    if (!widget.name) {
      throw console.error(messages.widget.registerError)
    }
    if (!this.getWidget(widget.name)) {
      this.REGISTER_WIDGET(widget)
      this.SORT_WIDGETS()
    }
  }

  @Action
  public toggleFocus(widget: WidgetState) {
    if (widget) {
      this.TOGGLE_FOCUS(widget)
    }
  }

  @Action
  public toggleWidget(widget: WidgetState) {
    // const widget = this.getWidget(name)
    if (widget) {
      this.TOGGLE_WIDGET(widget)
      this.SORT_WIDGETS()
    }
    console.log("toggle widget", widget.name, widget.open)
  }

  @Action
  public toggleDocked(widget: WidgetState) {
    if (widget) {
      this.TOGGLE_DOCKED(widget)
    }
  }

  // TODO: have focus actions/controls from widgets
  @Mutation
  public TOGGLE_FOCUS(widget: WidgetState) {
    if (this.activeWidget == widget) {
      this.activeWidget = null
    } else {
      this.activeWidget = widget
    }
  }

  @Mutation
  public REGISTER_WIDGET(widget: WidgetStateProp) {
    // assign defaults to empty properties
    for (const key of WidgetStateOptionals) {
      if (widget[key] == undefined) {
        widget[key] = DefaultWidget[key]
      }
    }
    this.widgets.push(widget as WidgetState)
  }

  @Mutation
  public TOGGLE_WIDGET(widget: WidgetState) {
    widget.open = !widget.open
  }

  @Mutation
  public TOGGLE_DOCKED(widget: WidgetState) {
    widget.docked = !widget.docked
  }

  // TODO: modify widget positioning based on order, draggable to change order
  @Mutation
  public INC_ORDER(widget: WidgetState) {
    widget.order++
  }

  @Mutation
  public DEC_ORDER(widget: WidgetState) {
    widget.order--
  }

  @Mutation
  public SORT_WIDGETS() {
    this.widgets.sort((a: WidgetState, b: WidgetState) => {
      return a.order - b.order
    })
  }

  public get getWidget() {
    return (name: string): WidgetState | undefined => {
      return this.widgets.find(w => {
        return w.name == name
      })
    }
  }
}
