import { GridWidget } from "@/store/interfaces"
import Welcome from "@/views/Welcome.vue"
import PlantSearch from "@/views/PlantSearch.vue"
import ActivePlant from "@/components/Garden/ActivePlant.vue"
import Grow from "@/views/Grow.vue"
import Controls from "@/views/Controls.vue"
import SelectCreate from "@/views/SelectCreate.vue"
import { INIT_WIDGET } from "@/fixtures/Grid/GridDefaults"

const widgets: GridWidget[] = [
  {
    component: Welcome,
    name: "welcome",
    text: "Introduction",
    open: true,
    defaultZone: 1,
    ...INIT_WIDGET(),
  },
  {
    component: PlantSearch,
    name: "search",
    text: "Plant Search",
    open: false,
    defaultZone: 1,
    ...INIT_WIDGET(),
  },
  {
    component: ActivePlant,
    name: "active-plant",
    text: "Investigate Plant",
    open: false,
    defaultZone: 2,
    ...INIT_WIDGET(),
  },
  {
    component: Grow,
    name: "grow",
    text: "Plants",
    open: true,
    defaultZone: 3,
    ...INIT_WIDGET(),
  },
  {
    component: Controls,
    name: "controls",
    text: "Control Plant",
    open: true,
    defaultZone: 4,
    ...INIT_WIDGET(),
  },
  {
    component: SelectCreate,
    name: "select-create",
    text: "Select & Create",
    open: true,
    defaultZone: 5,
    ...INIT_WIDGET(),
  },
]

export default widgets
