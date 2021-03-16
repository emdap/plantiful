<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import GrowModule from "@/store/modules/grow"
import { window } from "@/mixins/WindowMixin.vue"
import {
  GrowBasis,
  GrowBorder,
  GrowEntity,
  GrowShape,
  Plant,
  WidgetState
} from "@/store/interfaces"
// temp
import { triangleBorder, triangleBasis } from "@/fixtures/Grow/Defaults"

export const grow = getModule(GrowModule)

@Component({})
export default class GrowMixin extends Vue {
  public get entities() {
    return grow.entities
  }

  public growPlant(basePlant: Plant, growBasis: GrowBasis = triangleBasis) {
    const growWidget = window.getWidget("grow")
    if (!growWidget) {
      // TODO
      throw console.error("no widget??")
    }
    console.log(growWidget.open)
    if (!growWidget.open) {
      window.toggleWidget(growWidget)
    }
    console.log(growWidget.open)

    // TODO: add fixture for leaf shapes depending on plant properties
    const colorList = basePlant.main_species.foliage.color
    const color = colorList ? colorList[0] : "green"
    // TEMP to demo
    const shapes: GrowShape[] = [
      {
        color,
        border: triangleBorder,
        ...growBasis
      }
    ]
    const plantEntityCount = grow.countPlantEntities(basePlant.id)
    const entity: GrowEntity = {
      name: basePlant.main_species.common_name,
      plantId: basePlant.id,
      id: `${basePlant.id}-${plantEntityCount}`,
      shapes,
      ...growBasis
    }
    grow.addEntity(entity)
  }

  public get styleObj() {
    return (growData: GrowShape | GrowBasis) => {
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
      return {
        transform: `rotateX(${growData.rotation.x}deg) rotateY(${growData.rotation.y}deg) rotateZ(${growData.rotation.z}deg)`,
        top: growData.position?.top,
        right: growData.position?.right,
        bottom: growData.position?.bottom,
        left: growData.position?.left,
        height: growData.height,
        width: growData.width,
        transition: `all ${transitionSpeed}s`,
        "z-index": growData.zIndex,
        tabindex: growData.tabIndex,
        opacity,
        ...borders
      }
    }
  }
}
</script>
