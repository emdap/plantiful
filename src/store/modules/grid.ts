import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import {
  GridAxes,
  GridAxesKeys,
  GridContainer,
  GridPosition,
  GridState,
  GridWidget,
  GridZone,
  Size,
} from "@/store/interfaces"
import store from "@/store"
import Vue from "vue"
import { Position } from "vue-router/types/router"
import util from "@/utilities/containerUtil"

// TODO: possibly defunct functions marked with // D

@Module({
  dynamic: true,
  namespaced: true,
  name: "container",
  store,
})
export default class GridModule extends VuexModule implements GridState {
  containers: { [key: string]: GridContainer } = {}
  widgets: { [key: string]: GridWidget } = {}
  zones: { [key: number]: GridZone } = {}
  movingZones = false
  targetZone: GridZone | null = null
  activeWidget: GridWidget | null = null
  // these are still useful for widgets
  overallHeight = 0
  overallWidth = 0

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
  mountZone(payload: { zone: GridZone; mounted: boolean }) {
    const { zone, mounted } = payload
    this.ZONE_MOUNTED({ id: zone.id, mounted })
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
  setContainerSize(payload: { id: number; newSize: Size; newRatio?: Size }) {
    // TODO: could merge this with setZoneSize
    const { id, newSize, newRatio } = payload
    this.CONTAINER_SIZE({ id, newSize })
    if (newRatio) {
      const roundedRatio: Size = {
        height: parseFloat(newRatio.height.toFixed(4)),
        width: parseFloat(newRatio.width.toFixed(4)),
      }
      this.CONTAINER_RATIO({ id, newRatio: roundedRatio })
    }
  }

  @Action
  addZone(zone: GridZone) {
    this.ADD_ZONE(zone)
    if (zone.containerId) {
      this.POPULATE_CONTAINER(zone)
    }
  }

  @Action
  updateZoneColumns(payload: {
    zone: GridZone | number
    newColumns: GridPosition
  }) {
    const { zone, newColumns } = payload
    this.UPDATE_ZONE_COLUMNS({
      id: typeof zone == "number" ? zone : zone.id,
      newColumns,
    })
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
        zoneId: widget.defaultZone,
      })
    }
  }

  @Action
  widgetToZone(payload: { widget: GridWidget; zoneId: number }) {
    const { widget, zoneId } = payload
    // open or close the zone
    console.log("widget toggling zone")
    if (zoneId) this.toggleZone({ zone: zoneId, open: widget.docked })
    if (zoneId == widget.currentZone) {
      // happens if dropping widget into same zone
      return
    }

    let swapWidget!: GridWidget
    let curPosition!: Position
    const prevZoneId = widget.currentZone

    // check if there's already a widget in this zone
    if (zoneId && this.getZone(zoneId).widgets.length) {
      const swapName = this.getZone(zoneId).widgets[0]
      // will need to move this widget after
      swapWidget = this.getWidget(swapName)
      curPosition = { ...widget.position }
    }
    this.WIDGET_ZONE({ name: widget.name, zoneId })
    this.ZONE_WIDGETS({
      widgetName: widget.name,
      zoneId,
      prevZoneId,
    })

    // move swapWidget to the zone our widget currently occupies
    if (swapWidget && swapWidget.open) {
      // move to zone 0 if previously undocked & closed widget is re-opening into zone
      const newZone = prevZoneId && prevZoneId != zoneId ? prevZoneId : 0
      if (!prevZoneId && swapWidget.docked) {
        this.WIDGET_POSITION({
          name: swapWidget.name,
          newPosition: curPosition,
        })
        // moving to zone 0 -> undock
        this.TOGGLE_DOCKED(swapWidget.name)
      }
      this.widgetToZone({
        widget: swapWidget,
        zoneId: newZone,
      })
    }
  }

  @Action
  setZoneSize(payload: { zone: GridZone; newSize: Size; newRatio?: Size }) {
    const { zone, newSize, newRatio } = payload
    this.ZONE_SIZE({ id: zone.id, newSize })
    if (newRatio) {
      const roundedRatio: Size = {
        height: parseFloat(newRatio.height.toFixed(4)),
        width: parseFloat(newRatio.width.toFixed(4)),
      }
      this.ZONE_RATIO({ id: zone.id, newRatio: roundedRatio })
    }
  }

  // D
  // @Action
  // propogateZoneSize(zone: GridZone) {
  //   for (const widgetName in zone.widgets) {
  //     const widget = this.widgets[widgetName]
  //     if (widget.open) {
  //       this.setWidgetSize({
  //         widget,
  //         setZone: false,
  //         newHeight: zone.height,
  //         newWidth: zone.width
  //       })
  //     }
  //   }
  // }

  @Action
  setWidgetSize(payload: {
    widget: GridWidget
    setZone: boolean
    newSize: Size
  }) {
    // TODO: need to revisit this once widgets can resize zone -- when to update ratio
    const { widget, setZone, newSize } = payload
    // idea: keep widget size synced with zone
    if (setZone && widget.currentZone) {
      this.ZONE_SIZE({ id: widget.currentZone, newSize })
    }
    // const { widget, newSize } = payload
    this.WIDGET_SIZE({ name: widget.name, newSize })
  }

  @Action
  setWidgetPosition(payload: { name: string; newPosition: Position }) {
    this.WIDGET_POSITION(payload)
  }

  @Action
  setZonePoints(payload: { zone: GridZone; newStart: Position }) {
    const { zone, newStart } = payload
    const newEnd = {
      x: newStart.x + zone.size.width,
      y: newStart.y + zone.size.height,
    }
    this.ZONE_POSITION({
      id: zone.id,
      newStart,
      newEnd,
    })
  }

  @Action
  setActiveZone(payload: { containerId: number; zoneId: number | null }) {
    this.ACTIVE_ZONE(payload)
  }

  @Action
  toggleWidget(widget: GridWidget) {
    if (!widget.open) {
      // move widget to its default zone before opening
      // will also toggle zone open if not already
      this.widgetToZone({ widget, zoneId: widget.defaultZone })
    } else if (!widget.docked) {
      // initialize docked for next open
      this.TOGGLE_DOCKED(widget.name)
      // if has current zone/!=0, remove widget from zone list
      if (widget.currentZone) {
        this.ZONE_WIDGETS({
          widgetName: widget.name,
          prevZoneId: widget.currentZone,
        })
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
  toggleZone(payload: { zone: GridZone | number; open?: boolean }) {
    const zone =
      typeof payload.zone == "number"
        ? this.getZone(payload.zone)
        : payload.zone
    const open = payload.open
    if (open == undefined || zone.open != open) {
      this.TOGGLE_ZONE({ openZone: zone.id, open })
      console.log("toggle zone")
      if (zone.containerId) {
        this.CONTAINER_ZONE_OPENED({ containerId: zone.containerId, zone })
      }
    }
  }

  @Action
  toggleWidgetName(payload: { name: string; forceShow?: boolean }) {
    const { name, forceShow } = payload
    const widget = this.getWidget(name)
    if (widget && forceShow != undefined) {
      if (widget.open != forceShow) {
        this.toggleWidget(widget)
      } else if (forceShow == true) {
        this.ACTIVE_WIDGET(name)
      }
    }
  }

  @Action
  setActiveWidget(name?: string) {
    this.ACTIVE_WIDGET(name ? name : null)
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
    } else if (closestZone.id != widget.currentZone) {
      this.widgetToZone({ widget, zoneId: closestZone.id })
    }
  }

  @Mutation
  TOGGLE_ZONE(payload: { openZone: number; open?: boolean }) {
    const { openZone, open } = payload
    if (!openZone) {
      return
    }
    const zone = this.zones[openZone]
    zone.open = open ? true : !zone.open
    // Vue.set(zone, "open", open ? true : !zone.open)

    // for (const id of this.containers[zone.containerId].zones) {
    //   Vue.set(this.zones[id], "mounted", false)
    // }
  }

  @Mutation
  ZONE_MOUNTED(payload: { id: number; mounted: boolean }) {
    const { id, mounted } = payload
    Vue.set(this.zones[id], "mounted", mounted)
  }

  @Mutation
  CONTAINER_ZONE_OPENED(payload: { containerId: number; zone: GridZone }) {
    const { containerId, zone } = payload
    console.log("")
    console.log("opening zone", zone.id)
    console.log("")
    const container = this.containers[containerId]
    for (const axis of GridAxes) {
      if (zone.open) {
        console.log("*", zone.id, "to", axis, zone[axis].start)
        container[axis][zone[axis].start].zones.push(zone.id)
        if (zone[axis].start != zone[axis].end) {
          console.log("*", zone.id, "to", axis, zone[axis].end)
          container[axis][zone[axis].end].zones.push(zone.id)
        }
      } else {
        container[axis][zone[axis].start].zones = container[axis][
          zone[axis].start
        ].zones.filter(zId => {
          return zId != zone.id
        })
        container[axis][zone[axis].end].zones = container[axis][
          zone[axis].end
        ].zones.filter(zId => {
          return zId != zone.id
        })
      }
    }
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
    zoneId?: number
    prevZoneId?: number
  }) {
    const { widgetName, zoneId, prevZoneId } = payload

    // remove from previous zone if there is one
    if (prevZoneId != undefined) {
      const prevZone = this.zones[prevZoneId]
      prevZone.widgets = prevZone.widgets.filter(name => {
        return name != widgetName
      })
    }

    // add to zone if there is one
    if (zoneId != undefined) {
      const zone = this.zones[zoneId]
      zone.widgets.push(widgetName)
    }
  }

  @Mutation
  WIDGET_SIZE(payload: { name: string; newSize: Size }) {
    const { name, newSize } = payload
    const widget = this.widgets[name]
    // TODO: need to convert widget dims to Size
    widget.height = newSize.height
    widget.width = newSize.width
  }

  @Mutation
  ZONE_SIZE(payload: { id: number; newSize: Size }) {
    const { id, newSize } = payload
    const zone = this.zones[id]
    zone.size = newSize
  }

  @Mutation
  ZONE_RATIO(payload: { id: number; newRatio: Size }) {
    const { id, newRatio } = payload
    const zone = this.zones[id]
    zone.sizeRatio = newRatio
  }

  @Mutation
  CONTAINER_SIZE(payload: { id: number; newSize: Size }) {
    const { id, newSize } = payload
    const container = this.containers[id]
    container.size = newSize
  }

  @Mutation
  CONTAINER_RATIO(payload: { id: number; newRatio: Size }) {
    const { id, newRatio } = payload
    const container = this.containers[id]
    container.sizeRatio = newRatio
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
  ACTIVE_ZONE(payload: { containerId: number; zoneId: number | null }) {
    const { containerId, zoneId } = payload
    this.containers[containerId].activeZone = zoneId
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
  UPDATE_ZONE_COLUMNS(payload: { id: number; newColumns: GridPosition }) {
    const { id, newColumns } = payload
    this.zones[id].columns = newColumns
  }

  @Mutation
  POPULATE_CONTAINER(zone: GridZone) {
    const container = this.containers[zone.containerId]
    container.zones.push(zone.id)
    for (const axis of GridAxes) {
      for (const axisKey of GridAxesKeys) {
        // checking if container's reference to zone's start/end row/column exists yet
        if (!container[axis][zone[axis][axisKey]]) {
          // in english example: set container.columns[zone.columns.start] = initial values
          // zones only get pushed in once they're mounted/open
          Vue.set(container[axis], zone[axis][axisKey], {
            sizeRatio: 0,
            zones: [],
          })
        }
      }
    }
    console.log(container)
  }

  @Mutation
  ADD_CONTAINER(container: GridContainer) {
    Vue.set(this.containers, container.id, container)
  }

  @Mutation
  TOGGLE_WIDGET(name: string) {
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
