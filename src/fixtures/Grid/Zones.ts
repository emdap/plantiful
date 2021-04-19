import { GridZone } from "@/store/interfaces"
import { NO_POSITION } from "../Grow/Defaults"

// height/width are percentages

const zones: GridZone[] = [
  {
    id: 0,
    width: 100,
    height: 100,
    gridArea: "z-0",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[]
  },
  {
    id: 1,
    width: 100 / 3,
    height: 50,
    gridArea: "z-1",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[]
  },
  {
    id: 2,
    width: 100 / 3,
    height: 50,
    gridArea: "z-2",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[]
  },
  {
    id: 3,
    width: 500 / 12,
    height: 500 / 8,
    gridArea: "z-3",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[]
  },
  {
    id: 4,
    width: 300 / 12,
    height: 500 / 8,
    gridArea: "z-4",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[]
  },
  {
    id: 5,
    width: 200 / 3,
    height: 300 / 8,
    gridArea: "z-5",
    startPoint: NO_POSITION(),
    endPoint: NO_POSITION(),
    widgets: [] as string[]
  }
]

export default zones
