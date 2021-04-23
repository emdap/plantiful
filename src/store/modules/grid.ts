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
import util from "@/utilities/containerUtil"

// TODO: possibly defunct functions marked with // D

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
  movingZones = false
  targetZone: GridZone | null = null

  overallHeight = 0
  overallWidth = 0
  // D
  activeWidget: GridWidget | null = null
  // D
  activeZone: GridZone | null = null

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

  get findClosestZone() {
    return (position: Position): GridZone => {
      let approxZone!: GridZone
      let zone!: GridZone
      for (zone of Object.values(this.zones)) {
        if (zone.id == 0) {
          continue
        }
        const distance = util.checkMouseZoneDistance(
          position,
          zone.startPoint,
          zone.endPoint
        )
        if (distance.x == 0 && distance.y == 0) {
          return zone
        } else if (distance.x <= 16 && distance.y <= 16) {
          approxZone = zone
        }
      }
      // if approxZone didn't match either, return the last zone it matched, OR the last zone iterated
      return approxZone ? approxZone : this.targetZone ? this.targetZone : zone
    }
  }

  @Action
  zonesTrackMouse(track: boolean) {
    this.SET_MOVING_ZONES(track)
  }

  @Action
  mountZone(payload: { id: number; mounted: boolean }) {
    this.ZONE_MOUNTED(payload)
  }

  @Action
  setTargetZone(mousePos: Position) {
    const closestZone = this.findClosestZone(mousePos)
    this.SET_TARGET_ZONE(closestZone.id)
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
    if (widget.open) {
      this.widgetToZone({
        widget,
        zoneId: widget.defaultZone
      })
    }
  }

  @Action
  widgetToZone(payload: { widget: GridWidget; zoneId: number }) {
    const { widget, zoneId } = payload
    if (zoneId) this.TOGGLE_ZONE({ id: zoneId, open: widget.docked })
    if (zoneId == widget.currentZone) {
      // happens if container re-renders
      return
    }
    const prevZoneId = widget.currentZone
    // TODO: break down mutation
    if (zoneId && this.zones[zoneId].widgets.length) {
      // need to displace existing widget from non-0 zone
    }
    this.ZONE_WIDGETS({
      widgetName: widget.name,
      newZoneId: zoneId,
      prevZoneId
    })
    this.WIDGET_ZONE({ name: widget.name, zoneId })
  }

  @Action
  setZoneSize(payload: {
    zone: GridZone
    newHeight: number
    newWidth: number
  }) {
    const { zone, newHeight, newWidth } = payload
    this.ZONE_SIZE({ id: zone.id, newHeight, newWidth })
  }

  // D
  @Action
  propogateZoneSize(zone: GridZone) {
    for (const widgetName in zone.widgets) {
      const widget = this.widgets[widgetName]
      if (widget.open) {
        this.setWidgetSize({
          widget,
          setZone: false,
          newHeight: zone.height,
          newWidth: zone.width
        })
      }
    }
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
  setZonePoints(payload: { zone: GridZone; newStart: Position }) {
    const { zone, newStart } = payload
    const newEnd = {
      x: newStart.x + zone.width,
      y: newStart.y + zone.height
    }
    this.ZONE_POSITION({
      id: zone.id,
      newStart,
      newEnd
    })
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
    if (!widget.open) {
      // move widget to its default zone before opening
      this.widgetToZone({ widget, zoneId: widget.defaultZone })
    } else if (!widget.docked) {
      // initialize docked for next open
      this.TOGGLE_DOCKED(widget.name)
      // if has current zone/!=0, remove widget from zone list
      if (widget.currentZone) {
        this.RESET_ZONE_WIDGETS(widget.currentZone)
      }
    }
    this.TOGGLE_WIDGET(widget.name)
  }

  get containerZones() {
    return (containerId: number) => {
      const container = this.getContainer(containerId)
      return container
        ? container.zones.map(id => {
            return this.getZone(id)
          })
        : []
    }
  }

  @Action
  toggleZone(zone: GridZone) {
    this.TOGGLE_ZONE({ id: zone.id })
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
  toggleDocked(widget: GridWidget) {
    this.TOGGLE_DOCKED(widget.name)
    if (!widget.docked) {
      this.widgetToZone({ widget, zoneId: 0 })
    } else {
      if (widget.currentZone == 0) {
        this.widgetToZone({ widget, zoneId: widget.defaultZone })
      }
    }
  }

  @Action
  widgetToClosestZone(payload: { widget: GridWidget; mousePos: Position }) {
    const { widget, mousePos } = payload
    const closestZone = this.findClosestZone(mousePos)
    if (!closestZone && widget.docked) {
      this.toggleDocked(widget)
    } else {
      this.widgetToZone({ widget, zoneId: closestZone.id })
    }
  }

  @Mutation
  TOGGLE_ZONE(payload: { id: number; open?: boolean }) {
    const { id, open } = payload
    if (!id) {
      return
    }
    const zone = this.zones[id]
    Vue.set(zone, "open", open ? true : !zone.open)
    for (const id of this.containers[zone.containerId].zones) {
      Vue.set(this.zones[id], "mounted", false)
    }
  }

  // TODO: Merge with above and split Actions differently
  @Mutation
  ZONE_MOUNTED(payload: { id: number; mounted: boolean }) {
    const { id, mounted } = payload
    Vue.set(this.zones[id], "mounted", mounted)
  }

  @Mutation
  SET_MOVING_ZONES(moving: boolean) {
    this.movingZones = moving
  }

  @Mutation
  SET_TARGET_ZONE(id: number) {
    this.targetZone = this.zones[id]
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

    if (prevZoneId != undefined) {
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
        if (prevZoneId == 0) {
          moveWidget.docked = false
          moveWidget.position = this.widgets[widgetName].position
        }
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
    if (zone.containerId) {
      this.containers[zone.containerId].zones.push(zone.id)
    }
  }

  @Mutation
  ADD_CONTAINER(container: GridContainer) {
    Vue.set(this.containers, container.id, container)
  }

  @Mutation
  TOGGLE_WIDGET(name: string) {
    // TODO: revise this / move logic to action
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
  RESET_ZONE_WIDGETS(id: number) {
    this.zones[id].widgets = []
  }

  @Mutation
  SET_GRID_SIZE(payload: { height: number; width: number }) {
    this.overallHeight = payload.height
    this.overallWidth = payload.width
  }

  // D
  @Mutation
  REFRESH_CONTAINERS() {
    const containers = Object.values(this.containers)
    for (const container of containers) {
      Vue.delete(this.containers, container.id)
      Vue.set(this.containers, container.id, container)
    }
  }
}
