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
    color: "gray"
  },
  {
    id: 1,
    width: 0,
    height: 0,
    gridArea: "z-1",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "blue"
  },
  {
    id: 2,
    width: 0,
    height: 0,
    gridArea: "z-2",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "purple"
  },
  {
    id: 3,
    width: 0,
    height: 0,
    gridArea: "z-3",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "green"
  },
  {
    id: 4,
    width: 0,
    height: 0,
    gridArea: "z-4",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "pink"
  },
  {
    id: 5,
    width: 0,
    height: 0,
    gridArea: "z-5",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[],
    color: "yellow"
  }
]

export default zones
