import { GridWidget } from "@/store/interfaces"
import Welcome from "@/views/Welcome.vue"
import PlantSearch from "@/views/PlantSearch.vue"
import ActivePlant from "@/components/Garden/ActivePlant.vue"
import Grow from "@/views/Grow.vue"
import Controls from "@/views/Controls.vue"
import EntitySelect from "@/components/Grow/EntitySelect.vue"
import { NO_POSITION } from "../Defaults"

const widgets: GridWidget[] = [
  {
    component: Welcome,
    name: "welcome",
    text: "Introduction",
    open: true,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 1,
  },
  {
    component: PlantSearch,
    name: "search",
    text: "Plant Search",
    open: false,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 1,
  },
  {
    component: ActivePlant,
    name: "active-plant",
    text: "Investigate Plant",
    open: false,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 2,
  },
  {
    component: Grow,
    name: "grow",
    text: "Plant Window",
    open: false,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 3,
  },
  {
    component: Controls,
    name: "controls",
    text: "Edit Plant",
    open: false,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 4,
  },
  {
    component: EntitySelect,
    name: "select",
    text: "Selection Helper",
    open: false,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 5,
  },
]

export default widgets
