import { WidgetCopy } from "@/store/interfaces"
import Welcome from "@/views/Welcome.vue"
import PlantSearch from "@/views/PlantSearch.vue"
import ActivePlant from "@/components/ActivePlant.vue"
import Grow from "@/views/Grow.vue"
import Controls from "@/views/Controls.vue"
import { NO_POSITION } from "../Grow/Defaults"

const widgets: WidgetCopy[] = [
  {
    component: Welcome,
    name: "welcome",
    open: true,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 1
  },
  {
    component: PlantSearch,
    name: "search",
    open: false,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 1
  },
  {
    component: ActivePlant,
    name: "active-plant",
    open: false,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 2
  },
  {
    component: Grow,
    name: "grow",
    open: false,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 3
  },
  {
    component: Controls,
    name: "controls",
    open: false,
    docked: true,
    height: 0,
    width: 0,
    position: NO_POSITION(),
    defaultZone: 5
  }
]

export default widgets
