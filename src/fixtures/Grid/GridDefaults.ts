import { GridAreaDict } from "@/store/interfaces"
import { NO_POSITION, NO_SIZE } from "@/fixtures/Defaults"

export const INIT_WIDGET = () => {
  return {
    docked: true,
    size: NO_SIZE(),
    position: NO_POSITION(),
  }
}

export const INIT_ZONE = () => {
  return {
    open: false,
    size: NO_SIZE(),
    sizeRatio: NO_SIZE(),
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
  }
}

export const INIT_CONTAINER = () => {
  return {
    zones: [],
    size: NO_SIZE(),
    sizeRatio: NO_SIZE(),
    columns: {} as GridAreaDict,
    rows: {} as GridAreaDict,
    zonesGrowing: false,
  }
}
