import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import {
  GridContainer,
  GridState,
  GridWidget,
  GridZone
} from "@/store/interfaces"
import { widgetMessages } from "@/fixtures/Messages"
import store from "@/store"
import Vue from "vue"
import { Position } from "vue-router/types/router"

@Module({
  dynamic: true,
  namespaced: true,
  name: "container",
  store
})
export default class GridModule extends VuexModule implements GridState {
  containers: { [key: string]: GridContainer } = {}
  widgets: { [key: string]: GridWidget } = {}
  zones: { [key: number]: GridZone } = {}
  activeWidget: GridWidget | null = null
  activeZone: GridZone | null = null
  overallHeight = 0
  overallWidth = 0

  public get widgetMessages() {
    return widgetMessages
  }

  public get getWidget() {
    return (name: string): GridWidget => {
      return this.widgets[name]
    }
  }

  public get getZone() {
    return (id: number): GridZone => {
      return this.zones[id]
    }
  }

  public get getContainer() {
    return (id: number): GridContainer => {
      return this.containers[id]
    }
  }

  @Action
  public setGridSize(payload: { height: number; width: number }) {
    this.SET_GRID_SIZE(payload)
  }

  @Action
  public addZone(zone: GridZone) {
    this.ADD_ZONE(zone)
  }

  @Action
  public addContainer(container: GridContainer) {
    this.ADD_CONTAINER(container)
  }

  @Action
  public addWidget(widget: GridWidget) {
    this.ADD_WIDGET(widget)
    this.WIDGET_ZONE({ name: widget.name, zoneId: widget.defaultZone })
    this.ZONE_WIDGETS({
      widgetName: widget.name,
      newZoneId: widget.defaultZone
    })
  }

  // @Action
  // public resetWidget(widget: GridWidget) {
  //   if (!widget.docked) {
  //     this.TOGGLE_DOCKED(widget.name)
  //   }
  //   if (widget.currentZone != widget.defaultZone) {
  //     this.WIDGET_ZONE
  //   }
  // }

  @Action
  public widgetToZone(payload: { name: string; zoneId: number }) {
    const { name, zoneId } = payload
    const prevZoneId = this.getWidget(name).currentZone
    this.ZONE_WIDGETS({ widgetName: name, newZoneId: zoneId, prevZoneId })
    this.WIDGET_ZONE(payload)
  }

  // @Action
  // public setWidgetSize(payload: {
  //   name: string
  //   newHeight: number
  //   newWidth: number
  // }) {
  //   this.WIDGET_SIZE(payload)
  // }

  @Action
  public setWidgetSize(payload: {
    widget: GridWidget
    setZone: boolean
    newHeight: number
    newWidth: number
  }) {
    const { widget, setZone, newHeight, newWidth } = payload
    // idea: keep widget size synced with zone
    if (setZone && widget.currentZone) {
      this.ZONE_SIZE({ id: widget.currentZone, newHeight, newWidth })
    }
    this.WIDGET_SIZE({ name: widget.name, newHeight, newWidth })
  }

  @Action
  public setWidgetPosition(payload: { name: string; newPosition: Position }) {
    this.WIDGET_POSITION(payload)
  }

  @Action
  public setZonePosition(payload: {
    id: number
    newStart: Position
    newEnd: Position
  }) {
    this.ZONE_POSITION(payload)
  }

  @Action
  public setActive(payload: { which: "widget" | "zone"; id: string | number }) {
    const { which, id } = payload
    if (which == "widget" && typeof id == "string") {
      this.ACTIVE_WIDGET(id)
    } else if (which == "zone" && typeof id == "number") {
      this.ACTIVE_ZONE(id)
    }
  }

  @Action
  public removeActive(which: "widget" | "zone") {
    if (which == "widget") {
      this.ACTIVE_WIDGET(null)
    } else {
      this.ACTIVE_ZONE(null)
    }
  }
  // @Action
  // public registerWidget(widget: GridWidget) {
  //   if (!widget.name) {
  //     throw console.error(this.widgetMessages.registerError)
  //   }
  //   if (!this.getWidget(widget.name)) {
  //     this.REGISTER_WIDGET(widget)
  //     // this.SORT_WIDGETS()
  //   }
  // }

  // @Action
  // public toggleFocus(widget: GridWidget) {
  //   if (widget) {
  //     this.TOGGLE_FOCUS(widget)
  //   }
  // }

  @Action
  public toggleWidget(widget: GridWidget) {
    if (widget) {
      this.TOGGLE_WIDGET(widget.name)
      // initialize docked & in default zone for next open
      if (!widget.open && !widget.docked) {
        this.TOGGLE_DOCKED(widget.name)
        this.WIDGET_ZONE({ name: widget.name, zoneId: widget.defaultZone })
      }
    }
  }

  @Action
  public toggleDocked(widget: GridWidget) {
    if (widget) {
      this.TOGGLE_DOCKED(widget.name)
      // TODO: add code for assigning to nearest zone
    }
  }

  @Mutation
  public WIDGET_ZONE(payload: { name: string; zoneId: number }) {
    const { name, zoneId } = payload
    const widget = this.widgets[name]

    if (widget.currentZone) {
      widget.currentZone = zoneId
    } else {
      // currentZone starts off as undefined
      Vue.set(this.widgets[name], "currentZone", zoneId)
    }
  }

  @Mutation
  public ZONE_WIDGETS(payload: {
    widgetName: string
    newZoneId: number
    prevZoneId?: number
  }) {
    const { widgetName, newZoneId, prevZoneId } = payload
    let prevZone!: GridZone
    const newZone = this.zones[newZoneId]

    if (prevZoneId) {
      prevZone = this.zones[prevZoneId]
      prevZone.widgets = prevZone.widgets.filter(name => {
        return name != widgetName
      })
    } else {
      prevZone = this.zones[0]
    }

    // don't allow 2 open widgets in zone at same time, unless zone 0
    if (
      this.widgets[widgetName].open &&
      newZoneId != 0 &&
      newZone.widgets.length
    ) {
      const moveWidgetName = newZone.widgets[0]
      const moveWidget = this.widgets[moveWidgetName]
      if (moveWidget.open) {
        newZone.widgets = []
        prevZone.widgets.push(moveWidgetName)
        moveWidget.currentZone = prevZoneId
      }
    }

    newZone.widgets.push(widgetName)
  }

  @Mutation
  public WIDGET_SIZE(payload: {
    name: string
    newHeight: number
    newWidth: number
  }) {
    const { name, newHeight, newWidth } = payload
    const widget = this.widgets[name]
    widget.height = newHeight
    widget.width = newWidth
  }

  @Mutation
  public ZONE_SIZE(payload: {
    id: number
    newHeight: number
    newWidth: number
  }) {
    const { id, newHeight, newWidth } = payload
    const zone = this.zones[id]
    zone.height = newHeight
    zone.width = newWidth
  }

  @Mutation
  public WIDGET_POSITION(payload: { name: string; newPosition: Position }) {
    const { name, newPosition } = payload
    const widget = this.widgets[name]
    widget.position = newPosition
  }

  @Mutation
  public ZONE_POSITION(payload: {
    id: number
    newStart: Position
    newEnd: Position
  }) {
    const { id, newStart, newEnd } = payload
    const zone = this.zones[id]

    zone.startPoint = newStart
    zone.endPoint = newEnd
  }

  @Mutation
  public ACTIVE_WIDGET(id: string | null) {
    if (id) {
      this.activeWidget = this.widgets[id]
    } else {
      this.activeWidget = null
    }
  }

  @Mutation
  public ACTIVE_ZONE(id: number | null) {
    if (id) {
      this.activeZone = this.zones[id]
    } else {
      this.activeZone = null
    }
  }

  @Mutation
  public ADD_WIDGET(widget: GridWidget) {
    Vue.set(this.widgets, widget.name, widget)
  }

  @Mutation
  public ADD_ZONE(zone: GridZone) {
    Vue.set(this.zones, zone.id, zone)
  }

  @Mutation
  public ADD_CONTAINER(container: GridContainer) {
    Vue.set(this.containers, container.id, container)
  }

  @Mutation
  public TOGGLE_WIDGET(name: string) {
    this.widgets[name].open = !this.widgets[name].open
  }

  @Mutation
  public TOGGLE_DOCKED(name: string) {
    this.widgets[name].docked = !this.widgets[name].docked
  }

  @Mutation
  public SET_GRID_SIZE(payload: { height: number; width: number }) {
    this.overallHeight = payload.height
    this.overallWidth = payload.width
  }
}
