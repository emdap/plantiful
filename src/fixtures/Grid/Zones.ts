import { GridZone } from "@/store/interfaces"
import { NO_POSITION } from "../Grow/Defaults"

const zones: GridZone[] = [
  {
    id: 0,
    width: 0,
    height: 0,
    gridArea: "z-0",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "white"
  },
  {
    id: 1,
    width: 0,
    height: 0,
    gridArea: "z-1",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "blue-200"
  },
  {
    id: 2,
    width: 0,
    height: 0,
    gridArea: "z-2",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "purple-200"
  },
  {
    id: 3,
    width: 0,
    height: 0,
    gridArea: "z-3",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "green-200"
  },
  {
    id: 4,
    width: 0,
    height: 0,
    gridArea: "z-4",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "pink-200"
  },
  {
    id: 5,
    width: 0,
    height: 0,
    gridArea: "z-5",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "yellow-200"
  }
]

export default zones
