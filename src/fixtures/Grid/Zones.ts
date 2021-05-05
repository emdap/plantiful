import { GridZone } from "@/store/interfaces"
import { INIT_ZONE } from "@/fixtures/Grid/GridDefaults"

const zones: GridZone[] = [
  {
    id: 0,
    name: "z-0",
    containerId: 0,
    color: "gray",
    rows: [],
    columns: [],
    ...INIT_ZONE(),
  },
  {
    id: 1,
    name: "z-1",
    containerId: 1,
    color: "blue",
    rows: [1],
    columns: [1],
    ...INIT_ZONE(),
  },
  {
    id: 2,
    name: "z-2",
    containerId: 1,
    color: "purple",
    rows: [2],
    columns: [1],
    ...INIT_ZONE(),
  },
  {
    id: 3,
    name: "z-3",
    containerId: 2,
    color: "green",
    rows: [1, 2],
    columns: [1, 2],
    ...INIT_ZONE(),
  },
  {
    id: 4,
    name: "z-4",
    containerId: 2,
    color: "pink",
    rows: [1, 2],
    columns: [3],
    ...INIT_ZONE(),
  },
  {
    id: 5,
    name: "z-5",
    containerId: 2,
    color: "yellow",
    rows: [3],
    columns: [1, 2, 3],
    ...INIT_ZONE(),
  },
]

export default zones
