<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import { Watch } from "vue-property-decorator"
import GrowModule from "@/store/modules/grow"
import { container } from "@/mixins/ContainerMixin.vue"
import {
  GrowBasis,
  GrowEntity,
  GrowLeaf,
  GrowPosition,
  GrowShape,
  Plant,
  Rotation
} from "@/store/interfaces"
import { createLeaves } from "@/utilities/CreateLeaves"
// temp
import { entityInit } from "@/fixtures/Grow/Defaults"

export const grow = getModule(GrowModule)

@Component({})
export default class GrowMixin extends Vue {
  private ctrlDown = false
  private shiftDown = false
  private startY: number | null = null
  private startX: number | null = null
  public trackMouse = false

  public mounted() {
    if (!grow.hasKeyListeners) {
      window.addEventListener("keydown", this.keyDown)
      window.addEventListener("keyup", this.keyUp)
      document.addEventListener("mousedown", this.mouseDown)
      document.addEventListener("mouseup", this.mouseUp)
      grow.addedListeners(true)
    }
  }

  public get entities(): GrowEntity[] {
    return grow.entities
  }

  public get activeEntity(): GrowEntity | null {
    return grow.activeEntity
  }

  public growPlant(basePlant: Plant) {
    const growWidget = container.getWidget("grow")
    if (!growWidget) {
      // TODO: proper error
      throw console.error("no widget??")
    }
    if (!growWidget.open) {
      container.toggleWidget(growWidget)
    }

    // TEMP to demo
    // future - get leaf fixture, branch fixture, growTree function to get final entity
    // TODO: add fixture for leaf shapes depending on plant properties
    const colorList = basePlant.main_species.foliage.color
    const color = colorList ? colorList[0] : "green"

    const leaves: GrowLeaf[] = createLeaves(color, -90)
    const plantEntityCount = grow.countPlantEntities(basePlant.id)
    const entity: GrowEntity = {
      name: basePlant.main_species.common_name,
      plantId: basePlant.id,
      id: `${basePlant.id}-${plantEntityCount}`,
      // trackMouse: false,
      // startX: null,
      // startY: null,
      leaves,
      ...entityInit // default rotation/position/size,
    }
    grow.addEntity(entity)
    grow.setActiveEntity(entity)
  }

  // public generateBranch(hasLeaf: boolean, hasFlower: boolean, startCoord)

  public get styleObj() {
    // convert entity attributes to CSS style properties
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
        transform: `rotateX(${growData.rotation.x}deg) rotateY(${growData.rotation.y}deg) rotateZ(${growData.rotation.z}deg) translateZ(${growData.rotation.translate}px)`,
        top: growData.position?.top + "px",
        left: growData.position?.left + "px",
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

  @Watch("trackMouse")
  public mouseUpdatesEntity(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.updateEntity)
    } else {
      this.startX = this.startY = null
      document.removeEventListener("mousemove", this.updateEntity)
    }
  }

  public updateEntity(e: MouseEvent) {
    e.preventDefault()
    if (!grow.activeEntity) {
      return
    }

    if (this.startX == null || this.startY == null) {
      this.startX = e.pageX
      this.startY = e.pageY
    }

    // update rotation
    if (this.ctrlDown || this.shiftDown) {
      const newRotations: Rotation = {
        x: grow.activeEntity.rotation.x,
        y: grow.activeEntity.rotation.y,
        z: grow.activeEntity.rotation.z,
        translate: grow.activeEntity.rotation.translate
      }

      if (this.ctrlDown && this.shiftDown) {
        newRotations.translate += e.pageX - this.startX
      } else if (this.ctrlDown) {
        newRotations.z += e.pageX - this.startX
      } else if (this.shiftDown) {
        // rotating along x/y axis more intuitively tracks the movement of the cursor along opposite axis
        newRotations.x += e.pageY - this.startY
        newRotations.y += e.pageX - this.startX
      }
      grow.setRotation(newRotations)
    } else {
      // update position
      const newPosition: GrowPosition = {
        top: 0,
        left: 0
      }
      let currentTop = 0,
        currentLeft = 0
      const activeElem = document.getElementById(grow.activeEntity.id)
      if (grow.activeEntity.position.top) {
        currentTop = grow.activeEntity.position.top
      } else {
        currentTop = activeElem ? activeElem.offsetTop : 0
      }
      if (grow.activeEntity.position.left) {
        currentLeft = grow.activeEntity.position.left
      } else {
        currentLeft = activeElem ? activeElem.offsetLeft : 0
      }
      newPosition.top = currentTop + e.pageY - this.startY
      newPosition.left = currentLeft + e.pageX - this.startX
      grow.setPosition(newPosition)
    }
    this.startY = e.pageY
    this.startX = e.pageX
  }

  public mouseDown(e: MouseEvent) {
    if (grow.activeEntity) {
      e.preventDefault()
      this.trackMouse = true
    }
  }

  public mouseUp(e: MouseEvent) {
    if (this.trackMouse) {
      e.preventDefault()
      this.trackMouse = false
    }
  }

  public keyDown(e: KeyboardEvent) {
    if (!this.activeEntity) {
      return
    } else if (e.key == "Escape") {
      grow.removeActiveEntity()
      return
    }
    if (!this.ctrlDown && e.ctrlKey) {
      this.ctrlDown = true
    } else if (!this.shiftDown && e.shiftKey) {
      this.shiftDown = true
    }
    if (this.trackMouse) {
      e.preventDefault()
    }
  }

  public keyUp(e: KeyboardEvent) {
    if (!this.activeEntity) {
      return
    }
    if (this.ctrlDown && e.key == "Control") {
      this.ctrlDown = false
    } else if (this.shiftDown && e.key == "Shift") {
      this.shiftDown = false
    }
    if (this.trackMouse) {
      e.preventDefault()
    }
  }
}
</script>
