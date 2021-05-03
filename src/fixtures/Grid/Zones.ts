import { GridZone } from "@/store/interfaces"
import { INIT_ZONE } from "../Defaults"

function gridPosition(startRow = 0, startCol = 0, endRow = 0, endCol = 0) {
  return {
    rows: {
      start: startRow,
      end: endRow,
    },
    columns: {
      start: startCol,
      end: endCol,
    },
  }
}

const zones: GridZone[] = [
  {
    id: 0,
    name: "z-0",
    containerId: 0,
    color: "gray",
    ...gridPosition(),
    ...INIT_ZONE(),
  },
  {
    id: 1,
    name: "z-1",
    containerId: 1,
    color: "blue",
    ...gridPosition(1, 1, 1, 1),
    ...INIT_ZONE(),
  },
  {
    id: 2,
    name: "z-2",
    containerId: 1,
    color: "purple",
    ...gridPosition(2, 1, 2, 1),
    ...INIT_ZONE(),
  },
  {
    id: 3,
    name: "z-3",
    containerId: 2,
    color: "green",
    ...gridPosition(1, 1, 2, 2),
    ...INIT_ZONE(),
  },
  {
    id: 4,
    name: "z-4",
    containerId: 2,
    color: "pink",
    ...gridPosition(1, 3, 2, 3),
    ...INIT_ZONE(),
  },
  {
    id: 5,
    name: "z-5",
    containerId: 2,
    color: "yellow",
    ...gridPosition(3, 1, 3, 3),
    ...INIT_ZONE(),
  },
]

export default zones
