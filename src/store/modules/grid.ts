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

  get widgetMessages() {
    return widgetMessages
  }

  get getWidget() {
    return (name: string): GridWidget => {
      return this.widgets[name]
    }
  }

  get getZone() {
    return (id: number): GridZone => {
      return this.zones[id]
    }
  }

  get getContainer() {
    return (id: number): GridContainer => {
      return this.containers[id]
    }
  }

  @Action
  setGridSize(payload: { height: number; width: number }) {
    this.SET_GRID_SIZE(payload)
  }

  @Action
  addZone(zone: GridZone) {
    this.ADD_ZONE(zone)
  }

  @Action
  addContainer(container: GridContainer) {
    this.ADD_CONTAINER(container)
  }

  @Action
  addWidget(widget: GridWidget) {
    this.ADD_WIDGET(widget)
    this.WIDGET_ZONE({ name: widget.name, zoneId: widget.defaultZone })
    this.ZONE_WIDGETS({
      widgetName: widget.name,
      newZoneId: widget.defaultZone
    })
  }

  @Action
  widgetToZone(payload: { name: string; zoneId: number }) {
    const { name, zoneId } = payload
    const prevZoneId = this.getWidget(name).currentZone
    this.ZONE_WIDGETS({ widgetName: name, newZoneId: zoneId, prevZoneId })
    this.WIDGET_ZONE(payload)
  }

  @Action
  setWidgetSize(payload: {
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
  setWidgetPosition(payload: { name: string; newPosition: Position }) {
    this.WIDGET_POSITION(payload)
  }

  @Action
  setZonePosition(payload: {
    id: number
    newStart: Position
    newEnd: Position
  }) {
    this.ZONE_POSITION(payload)
  }

  @Action
  setActive(payload: { which: "widget" | "zone"; id: string | number }) {
    const { which, id } = payload
    if (which == "widget" && typeof id == "string") {
      this.ACTIVE_WIDGET(id)
    } else if (which == "zone" && typeof id == "number") {
      this.ACTIVE_ZONE(id)
    }
  }

  @Action
  removeActive(which: "widget" | "zone") {
    if (which == "widget") {
      this.ACTIVE_WIDGET(null)
    } else {
      this.ACTIVE_ZONE(null)
    }
  }

  @Action
  toggleWidget(widget: GridWidget) {
    console.log(widget.name, widget.open)
    if (widget) {
      this.TOGGLE_WIDGET(widget.name)
      // initialize docked & in default zone for next open
      if (!widget.open && !widget.docked) {
        this.TOGGLE_DOCKED(widget.name)
        this.WIDGET_ZONE({ name: widget.name, zoneId: widget.defaultZone })
      }
    }
    console.log(widget.name, widget.open)
  }

  @Action
  toggleWidgetName(payload: { name: string; forceShow?: boolean }) {
    const { name, forceShow } = payload
    const widget = this.getWidget(name)
    if (widget && forceShow != undefined && widget.open != forceShow) {
      this.toggleWidget(widget)
    }
  }

  @Action
  toggleDocked(widget: GridWidget): Promise<void> {
    this.TOGGLE_DOCKED(widget.name)
    return Promise.resolve()
    // TODO: add code for assigning to nearest zone
  }

  @Mutation
  WIDGET_ZONE(payload: { name: string; zoneId: number }) {
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
  ZONE_WIDGETS(payload: {
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
  WIDGET_SIZE(payload: { name: string; newHeight: number; newWidth: number }) {
    const { name, newHeight, newWidth } = payload
    const widget = this.widgets[name]
    widget.height = newHeight
    widget.width = newWidth
  }

  @Mutation
  ZONE_SIZE(payload: { id: number; newHeight: number; newWidth: number }) {
    const { id, newHeight, newWidth } = payload
    const zone = this.zones[id]
    zone.height = newHeight
    zone.width = newWidth
  }

  @Mutation
  WIDGET_POSITION(payload: { name: string; newPosition: Position }) {
    const { name, newPosition } = payload
    const widget = this.widgets[name]
    widget.position = newPosition
  }

  @Mutation
  ZONE_POSITION(payload: { id: number; newStart: Position; newEnd: Position }) {
    const { id, newStart, newEnd } = payload
    const zone = this.zones[id]

    zone.startPoint = newStart
    zone.endPoint = newEnd
  }

  @Mutation
  ACTIVE_WIDGET(id: string | null) {
    if (id) {
      this.activeWidget = this.widgets[id]
    } else {
      this.activeWidget = null
    }
  }

  @Mutation
  ACTIVE_ZONE(id: number | null) {
    if (id) {
      this.activeZone = this.zones[id]
    } else {
      this.activeZone = null
    }
  }

  @Mutation
  ADD_WIDGET(widget: GridWidget) {
    Vue.set(this.widgets, widget.name, widget)
  }

  @Mutation
  ADD_ZONE(zone: GridZone) {
    Vue.set(this.zones, zone.id, zone)
  }

  @Mutation
  ADD_CONTAINER(container: GridContainer) {
    Vue.set(this.containers, container.id, container)
  }

  @Mutation
  TOGGLE_WIDGET(name: string) {
    // not allowing welcome and search to be open at same time for any reason
    if (
      this.widgets["welcome"].open &&
      name == "search" &&
      !this.widgets[name].open
    ) {
      this.widgets["welcome"].open = false
    }
    this.widgets[name].open = !this.widgets[name].open
  }

  @Mutation
  TOGGLE_DOCKED(name: string) {
    this.widgets[name].docked = !this.widgets[name].docked
  }

  @Mutation
  SET_GRID_SIZE(payload: { height: number; width: number }) {
    this.overallHeight = payload.height
    this.overallWidth = payload.width
  }
}
