<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import { Watch } from "vue-property-decorator"
import GrowModule from "@/store/modules/grow"
import { grid } from "@/mixins/GridMixin.vue"
import { growMessages } from "@/fixtures/Messages"
import {
  GrowBasis,
  GrowPlant,
  GrowShape,
  Plant,
  GrowData,
  GrowType,
  GrowDataKey
} from "@/store/interfaces"

export const grow = getModule(GrowModule)

@Component({})
export default class GrowMixin extends Vue {
  public messages = growMessages
  public highlightBg = "pink"
  public highlightDuration = 1000

  public toggleSearchPlants(forceShow?: boolean) {
    grid.toggleWidgetName({ name: "search", forceShow })
  }

  public toggleControlsWidget(forceShow?: boolean) {
    grid.toggleWidgetName({ name: "controls", forceShow })
  }

  public toggleGrow(forceShow?: boolean) {
    grid.toggleWidgetName({ name: "grow", forceShow })
  }

  public get growPlants(): GrowData<GrowPlant> {
    return grow.plants
  }

  public get activeGrowPlant(): GrowPlant | null {
    return grow.activeGrowPlant
  }

  public get activeEntity(): GrowType | null {
    return grow.activeEntity
  }

  public get activeEntityType(): string | null {
    return grow.activeEntityType
  }

  public get getEntity() {
    return grow.getEntity
  }

  public get showControls() {
    return grow.showControls
  }

  public get hasGrowPlants() {
    return Object.entries(grow.plants).length != 0
  }

  public activateEntity(
    plantActive: boolean,
    dataKey: GrowDataKey,
    id: number
  ) {
    if (plantActive) {
      grow.setActiveEntity({ id, dataKey })
    }
  }

  public async growPlant(basePlant: Plant) {
    this.toggleGrow(true)

    const plant = await grow.growPlant({
      basePlant
    })

    grow.addPlant(plant)
    grow.setActivePlant(plant.id)

    return plant
  }

  public get entityStyle() {
    // convert entity attributes to CSS style properties
    return (growData: GrowBasis | GrowShape, posBottom = false) => {
      const transitionSpeed = growData.transitionSpeed
        ? growData.transitionSpeed
        : 0
      let opacity = 100
      const borderKeys = ["top", "right", "bottom", "left"] as const
      const borders = {} as Record<string, string>
      if ("border" in growData) {
        opacity = growData.opacity ? growData.opacity : opacity
        for (const key of borderKeys) {
          const currentBorder = growData.border[key]
          if (!currentBorder) continue
          const color = currentBorder.show ? growData.color : "transparent"
          borders[`border-${key}`] = `${currentBorder.size}px solid ${color}`
        }
      }

      const position = {
        x: growData.position ? growData.position.x + "px" : "50%",
        y: growData.position ? growData.position.y + "px" : "50%"
      }

      const yPos = {
        top: "",
        bottom: ""
      }
      if (posBottom) {
        yPos.bottom = position.y
      } else {
        yPos.top = position.y
      }

      return {
        transform: `rotateX(${growData.rotation.x}deg) rotateY(${growData.rotation.y}deg) rotateZ(${growData.rotation.z}deg) translateZ(${growData.rotation.translate}px)`,
        ...yPos,
        left: position.x,
        height: growData.height + "px",
        width: growData.width + "px",
        transition: `all ${transitionSpeed}s`,
        "z-index": growData.zIndex,
        tabindex: growData.tabIndex,
        perspective: "600px", // may make this modifiable in future -- 600px good value for now
        opacity,
        ...borders
      }
    }
  }

  public get backgroundClass() {
    return (defaultBg: "transparent" | "black", highlight: boolean) => {
      // could simplify this -- only used by Branch and PetalLeaf
      if (defaultBg != "transparent" || highlight) {
        if (highlight) {
          return `bg-${this.highlightBg}-700 dark:bg-${this.highlightBg}-400`
        } else {
          return `bg-${defaultBg} dark:bg-white`
        }
      }
      return "bg-" + defaultBg
    }
  }
}
</script>
