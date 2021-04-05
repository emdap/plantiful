import { WidgetEntity } from "@/store/interfaces"
import SearchIcon from "@/assets/icons/search.svg"
import PlantIcon from "@/assets/icons/plant.svg"
import WelcomeIcon from "@/assets/icons/welcome.svg"

const widgets: WidgetEntity[] = [
  {
    name: "welcome",
    order: 3,
    icon: WelcomeIcon,
    open: true,
    docked: true,
    inMenu: true,
    display: {
      width: "30vw",
      height: "full",
      minHeight: 500,
      minWidth: 400
    }
  },
  {
    name: "active-plant",
    order: 4,
    icon: "A",
    open: false,
    docked: false,
    inMenu: false,
    display: {
      width: "20vw",
      height: "500",
      left: "100%"
    }
  },
  {
    name: "grow",
    order: 1,
    icon: PlantIcon,
    open: false,
    docked: false,
    inMenu: true,
    display: {
      // flexGrow: true,
      height: 500,
      width: 500,
      minHeight: 500,
      minWidth: 500
    }
  },
  {
    name: "search",
    order: 2,
    icon: SearchIcon,
    open: false,
    docked: true,
    inMenu: true,
    display: {
      height: "full",
      flexGrow: true
    }
  }
]

export default widgets
