import { MenuWidget } from "@/store/interfaces"
import SearchIcon from "@/assets/icons/search.svg"
import InfoIcon from "@/assets/icons/info.svg"
import PlantIcon from "@/assets/icons/plant.svg"
import WelcomeIcon from "@/assets/icons/welcome.svg"
import ControlsIcon from "@/assets/icons/controls.svg"
import SelectIcon from "@/assets/icons/select.svg"

const menuWidgets: MenuWidget[] = [
  {
    widgetName: "welcome",
    text: "Welcome",
    icon: WelcomeIcon,
    group: "Information"
  },
  {
    widgetName: "search",
    text: "Plant Search",
    icon: SearchIcon,
    group: "Find Plants"
  },
  {
    widgetName: "active-plant",
    text: "Investigate Plant",
    icon: InfoIcon,
    group: "Find Plants"
  },
  {
    widgetName: "grow",
    text: "Plant Window",
    icon: PlantIcon,
    group: "Create Plants"
  },
  {
    widgetName: "controls",
    text: "Control Plant",
    icon: ControlsIcon,
    group: "Create Plants"
  },
  {
    widgetName: "select",
    text: "Selection Helper",
    icon: SelectIcon,
    group: "Create Plants"
  }
]

export default menuWidgets
