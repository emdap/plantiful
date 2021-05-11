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
    icon: WelcomeIcon,
    group: "Information",
  },
  {
    widgetName: "search",
    icon: SearchIcon,
    group: "Find Plants",
  },
  {
    widgetName: "active-plant",
    icon: InfoIcon,
    group: "Find Plants",
  },
  {
    widgetName: "grow",
    icon: PlantIcon,
    group: "Create Plants",
  },
  {
    widgetName: "controls",
    icon: ControlsIcon,
    group: "Create Plants",
  },
  {
    widgetName: "select-create",
    icon: SelectIcon,
    group: "Create Plants",
  },
]

export default menuWidgets
