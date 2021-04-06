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
    launchDocked: true,
    inMenu: true,
    display: {
      width: "30vw",
      height: "100vh",
      minHeight: 500,
      minWidth: 200
    }
  },
  {
    name: "active-plant",
    order: 4,
    icon: "A",
    open: false,
    launchDocked: false,
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
    isDocked: false,
    launchDocked: true,
    inMenu: true,
    display: {
      // flexGrow: true,
      left: "calc(30vw + 3rem + 10px)", // size of welcome widget + side menu width + some gap
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
    launchDocked: true,
    inMenu: true,
    display: {
      height: "full",
      flexGrow: true
    }
  }
]

export default widgets
