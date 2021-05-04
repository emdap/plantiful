import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import {
  GridAxes,
  GridContainer,
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
  containers: { [key: number]: GridContainer } = {}
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

  get zoneNextRowCol() {
    // return the row/column after, the row/column before, or null if neither exist
    return (zone: GridZone, axis: typeof GridAxes[number]): number | null => {
      const container = this.getContainer(zone.containerId)
      const lastDim = this.zoneLastDim(zone, axis)
      if (container[axis][lastDim + 1]) {
        return container[axis][lastDim + 1].zones.length && lastDim + 1
      } else if (container[axis][zone[axis][0] - 1]) {
        return (
          container[axis][zone[axis][0] - 1].zones.length && zone[axis][0] - 1
        )
      }
      return null
    }
  }

  get zoneAtIntersection() {
    // return the zone that exists at the intersection of row/col in container
    return (
      containerId: number,
      row: number,
      column: number
    ): GridZone | undefined => {
      return Object.values(this.zones).find(z => {
        return (
          z.containerId == containerId &&
          z.rows.indexOf(row) != -1 &&
          z.columns.indexOf(column) != -1
        )
      })
    }
  }

  get zoneLastDim() {
    return (zone: GridZone, which: typeof GridAxes[number]) => {
      return zone[which][zone[which].length - 1]
    }
  }

  @Action
  zoneDistributeRatio(payload: {
    containerId: number
    ratio: { columns?: number; rows?: number }
    rows?: number[]
    columns?: number[]
    proportional?: boolean
  }) {
    // evenly distribute ratio across all rows/columns
    const { containerId, ratio, proportional } = payload
    for (const axis of GridAxes) {
      if (payload[axis] && ratio[axis]) {
        const rowCols = payload[axis] as number[]
        let denom = rowCols.length
        let amount!: number, container!: GridContainer

        if (!proportional) {
          // every dim gets same ratio
          amount = (ratio[axis] as number) / denom
        } else {
          // dim will get ratio proportional to its current ratio
          container = this.getContainer(containerId)
          denom = rowCols.reduce((prev: number, current) => {
            return container[axis][current].zones.length
              ? prev + container[axis][current].sizeRatio
              : 0
          }, 0)
        }
        for (const i in rowCols) {
          if (proportional) {
            amount =
              (container[axis][rowCols[i]].sizeRatio / denom) *
              (ratio[axis] as number)
          }
          this.SET_CONTAINER_DIM_RATIO({
            id: containerId,
            axis,
            dim: rowCols[i],
            ratio: amount,
          })
        }
      }
    }
  }

  @Action
  incContainerDim(payload: {
    containerId: number
    incRatio: number
    axis: typeof GridAxes[number]
    dim: number
  }) {
    const { containerId, incRatio, axis, dim } = payload
    const updateDim = this.getContainer(containerId)[axis][dim]
    const ratio =
      updateDim.sizeRatio != -1 ? updateDim.sizeRatio + incRatio : incRatio

    this.SET_CONTAINER_DIM_RATIO({ id: containerId, axis, dim, ratio })
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

  // @Action
  // setSize(payload: {which: "containers" | "zones", entity: number | GridZone, newSize: Size, newRatio?: Size}) {
  //   const {entity, which, newSize, newRatio} = payload
  //   let sizeMutation!: Function
  //   let ratioMutation!: Function
  //   if (which == "containers") {
  //     sizeMutation = this.CONTAINER_SIZE
  //     ratioMutation = this.CONTAINER_RATIO
  //   } else {
  //     sizeMutation = this.CONTAINER_SIZE
  //     ratioMutation = this.CONTAINER_RATIO
  //   }
  // }

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
    newColumns: number[]
  }) {
    const { newColumns } = payload
    const zone =
      typeof payload.zone == "number"
        ? this.getZone(payload.zone)
        : payload.zone
    const removeColumns = zone.columns.filter(c => {
      return newColumns.indexOf(c) == -1
    })
    const addColumns = newColumns.filter(c => {
      return zone.columns.indexOf(c) == -1
    })
    this.CONTAINER_ZONE_CHANGED({
      id: zone.id,
      containerId: zone.containerId,
      open: false,
      columns: removeColumns,
    })
    this.CONTAINER_ZONE_CHANGED({
      id: zone.id,
      containerId: zone.containerId,
      open: true,
      columns: addColumns,
    })

    // TODO: add ratio spread function here too
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
  toggleZonesGrowing(containerId: number) {
    this.ZONES_GROWING(containerId)
  }

  @Action
  setZoneSize(payload: {
    zone: GridZone | number
    newSize: Size
    newRatio?: Size
    distribute?: boolean
  }) {
    const { newSize, newRatio, distribute } = payload
    const zone =
      typeof payload.zone == "number"
        ? this.getZone(payload.zone)
        : payload.zone
    this.ZONE_SIZE({ id: zone.id, newSize })
    if (newRatio) {
      const roundedRatio: Size = {
        height: parseFloat(newRatio.height.toFixed(4)),
        width: parseFloat(newRatio.width.toFixed(4)),
      }
      if (distribute) {
        this.zoneDistributeRatio({
          ...zone,
          ratio: {
            // rows: roundedRatio.height,
            columns: roundedRatio.width,
          },
        })
        // console.log(zone.id, "dist height", roundedRatio.height)
        this.zoneDistributeRatio({
          ...zone,
          ratio: {
            rows: roundedRatio.height,
            // columns: roundedRatio.width
          },
        })
      }
      this.ZONE_RATIO({ id: zone.id, newRatio: roundedRatio })
    }
  }

  @Action
  setWidgetSize(payload: { widget: GridWidget; newSize: Size }) {
    const { widget, newSize } = payload
    // idea: keep widget size synced with zone
    // if (setZone && widget.currentZone) {
    //   this.setZoneSize({ zone: widget.currentZone, newSize })
    // }
    this.WIDGET_SIZE({ name: widget.name, newSize })
  }

  @Action
  setWidgetPosition(payload: { name: string; newPosition: Position }) {
    this.WIDGET_POSITION(payload)
  }

  @Action
  setZonePoints(payload: { zone: GridZone; startPoint: Position }) {
    const { zone, startPoint } = payload

    const newEnd = {
      x: startPoint.x + zone.size.width,
      y: startPoint.y + zone.size.height,
    }
    this.ZONE_POSITION({
      id: zone.id,
      newStart: startPoint,
      newEnd,
    })
  }

  @Action
  resetZoneDimRatios(zone: GridZone) {
    for (const axis of GridAxes) {
      for (const dim of zone[axis]) {
        this.SET_CONTAINER_DIM_RATIO({
          id: zone.containerId,
          axis,
          dim,
          ratio: -1,
        })
      }
    }
  }

  @Mutation
  SET_CONTAINER_DIM_RATIO(payload: {
    id: number
    axis: typeof GridAxes[number]
    dim: number
    ratio: number
  }) {
    const { id, axis, dim, ratio } = payload
    this.containers[id][axis][dim].sizeRatio = ratio
  }

  // @Mutation
  // SET_CONTAINER_ROW_RATIO(payload: { id: number; row: number; ratio: number }) {
  //   const { id, row, ratio } = payload
  //   this.containers[id].rows[row].sizeRatio = ratio
  // }

  // @Mutation
  // SET_CONTAINER_COL_RATIO(payload: {
  //   id: number
  //   column: number
  //   ratio: number
  // }) {
  //   const { id, column, ratio } = payload
  //   this.containers[id].columns[column].sizeRatio = ratio
  // }

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
      if (zone.containerId) {
        this.CONTAINER_ZONE_CHANGED({ ...zone })
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
  CONTAINER_ZONE_CHANGED(payload: {
    id: number
    containerId: number
    open: boolean
    rows?: number[]
    columns?: number[]
  }) {
    const { containerId, id, open } = payload
    const container = this.containers[containerId]
    for (const axis of GridAxes) {
      if (payload[axis]) {
        // typescript still clocking payload[axis] as possibly undefined
        const rowCols = payload[axis] as number[]
        for (const dim of rowCols) {
          if (open) {
            container[axis][dim].zones.push(id)
          } else {
            container[axis][dim].zones = container[axis][dim].zones.filter(
              z => {
                return z != id
              }
            )
            // all zones removed, reset sizeRatio
            if (container[axis][dim].zones.length == 0) {
              container[axis][dim].sizeRatio = -1
            }
          }
        }
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
    widget.size = newSize
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
  ADD_WIDGET(widget: GridWidget) {
    Vue.set(this.widgets, widget.name, widget)
  }

  @Mutation
  ADD_ZONE(zone: GridZone) {
    Vue.set(this.zones, zone.id, zone)
  }

  @Mutation
  UPDATE_ZONE_COLUMNS(payload: { id: number; newColumns: number[] }) {
    const { id, newColumns } = payload
    this.zones[id].columns = newColumns
  }

  @Mutation
  POPULATE_CONTAINER(zone: GridZone) {
    const container = this.containers[zone.containerId]
    container.zones.push(zone.id)
    for (const axis of GridAxes) {
      for (const dim of zone[axis]) {
        // checking if container's reference to zone's start/end row/column exists yet
        if (!container[axis][dim]) {
          // in english example: set container.columns[1] = initial values
          // zones will get pushed in once they're opened
          Vue.set(container[axis], dim, {
            sizeRatio: -1,
            zones: [],
          })
        }
      }
    }
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

  @Mutation
  ZONES_GROWING(containerId: number) {
    this.containers[containerId].zonesGrowing = !this.containers[containerId]
      .zonesGrowing
  }
}
