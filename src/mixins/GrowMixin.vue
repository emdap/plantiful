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

export const grow = getModule(GrowModule)

@Component({})
export default class GrowMixin extends Vue {
  // confusing, this gets registered when Grow.vue creates the widget
  // TODO: make this less confusing
  public growWidget: WidgetState = {
    name: "grow",
    icon: "G",
    order: 1,
    open: false,
    docked: true,
    inMenu: true
  }

  public get entities() {
    return grow.entities
  }

  public growPlant(basePlant: Plant, growBasis: GrowBasis = {}) {
    console.log(this.growWidget.open)
    if (!this.growWidget.open) {
      window.toggleWidget(this.growWidget)
    }
    console.log(this.growWidget.open)

    // TODO: add fixture for leaf shapes depending on plant properties
    const colorList = basePlant.main_species.foliage.color
    const color = colorList ? colorList[0] : "green"
    // TEMP to demo
    const triangle: GrowBorder = {
      top: {
        size: 25,
        show: false
      },
      right: {
        size: 50,
        show: true
      },
      bottom: {
        size: 25,
        show: false
      }
    }
    const shapes: GrowShape[] = [
      {
        position: {
          bottom: 0
        },
        height: 0,
        width: 0,
        border: triangle,
        color
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
