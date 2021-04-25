import { GridZone } from "@/store/interfaces"
import { INIT_ZONE } from "../Defaults"

const zones: GridZone[] = [
  {
    id: 0,
    name: "z-0",
    containerId: 0,
    color: "gray",
    ...INIT_ZONE(),
  },
  {
    id: 1,
    name: "z-1",
    containerId: 1,
    color: "blue",
    ...INIT_ZONE(),
  },
  {
    id: 2,
    name: "z-2",
    containerId: 1,
    color: "purple",
    ...INIT_ZONE(),
  },
  {
    id: 3,
    name: "z-3",
    containerId: 2,
    color: "green",
    ...INIT_ZONE(),
  },
  {
    id: 4,
    name: "z-4",
    containerId: 2,
    color: "pink",
    ...INIT_ZONE(),
  },
  {
    id: 5,
    name: "z-5",
    containerId: 2,
    color: "yellow",
    ...INIT_ZONE(),
  },
]

export default zones
