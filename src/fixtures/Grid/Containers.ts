import { GridContainer } from "@/store/interfaces"
import { INIT_CONTAINER } from "@/fixtures/Grid/GridDefaults"

const containers: GridContainer[] = [
  {
    id: 1,
    name: "plant-lookup",
    ...INIT_CONTAINER(),
  },
  {
    id: 2,
    name: "plant-playground",
    ...INIT_CONTAINER(),
  },
]

export default containers
