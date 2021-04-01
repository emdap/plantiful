import { WidgetEntity } from "@/store/interfaces"
import SearchIcon from "@/assets/icons/search.svg"
import PlantIcon from "@/assets/icons/plant.svg"

const widgets: WidgetEntity[] = [
  {
    name: "search",
    icon: SearchIcon,
    open: true,
    docked: true,
    inMenu: true,
    display: {
      height: "full",
      flexGrow: true
    }
  },
  {
    name: "active-plant",
    icon: "A",
    open: false,
    docked: false,
    inMenu: false,
    display: {
      width: "20vw",
      left: "100%"
    }
  },
  {
    name: "grow",
    icon: PlantIcon,
    open: false,
    docked: true,
    inMenu: true,
    display: {
      flexGrow: true
    }
  }
]

export default widgets
