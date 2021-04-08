<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
import { Watch } from "vue-property-decorator"
import GrowModule from "@/store/modules/grow"
import { container } from "@/mixins/ContainerMixin.vue"
import {
  GrowBasis,
  GrowPlant,
  Position,
  GrowShape,
  Plant,
  Rotation,
  GrowData,
  GrowType,
  GrowDataKey
} from "@/store/interfaces"
import { createPlant } from "@/services/growPlants"

export const grow = getModule(GrowModule)

@Component({})
export default class GrowMixin extends Vue {
  private ctrlDown = false
  private shiftDown = false
  private startY: number | null = null
  private startX: number | null = null
  public trackMouse = false

  public highlightBg = "pink-700"
  public highlightDuration = 1000

  public mounted() {
    if (!grow.hasKeyListeners) {
      window.addEventListener("keydown", this.keyDown)
      window.addEventListener("keyup", this.keyUp)
      document.addEventListener("mousedown", this.mouseDown)
      document.addEventListener("mouseup", this.mouseUp)
      grow.addedListeners(true)
    }
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

  public growPlant(basePlant: Plant) {
    const growWidget = container.getWidget("grow")
    if (!growWidget) {
      // TODO: proper error
      throw console.error("no widget??")
    }
    if (!growWidget.open) {
      container.toggleWidget(growWidget)
    }

    const growWidgetEl = document.getElementById("grow-widget") as HTMLElement

    // TEMP to demo - TODO: make recursive function to create structures based on plant characteristics
    // TODO: add fixture for leaf shapes depending on plant properties

    const { branches, clustersWithLeaves, plant } = createPlant(basePlant, true)
    const branchIds = []
    const leafClusterIds = []
    for (const branch of branches) {
      grow.addBranch(branch)
      branchIds.push(branch.id)
    }
    for (const overallCluster of clustersWithLeaves) {
      // leafCluster starts with empty list for leaf ids
      const { leafCluster, leaves } = overallCluster
      for (const leaf of leaves) {
        grow.addLeaf(leaf)
        // leaf now as id assigned
        leafCluster.leaves.push(leaf.id)
      }
      grow.addLeafCluster(leafCluster)
      leafClusterIds.push(leafCluster.id)
    }
    // widget element might not be positioned/styled yet, use defaults if so
    const growWidgetElWidth =
      growWidgetEl.getBoundingClientRect().width == 0
        ? (growWidget.display.minWidth as number)
        : growWidgetEl.getBoundingClientRect().width
    const growWidgetElHeight =
      growWidgetEl.getBoundingClientRect().height == 0
        ? (growWidget.display.minHeight as number)
        : growWidgetEl.getBoundingClientRect().height

    plant.branches = branchIds
    plant.leafClusters = leafClusterIds
    plant.position = {
      x: growWidgetElWidth / 2,
      y: growWidgetElHeight / 2 + plant.height / 2
    }

    grow.addPlant(plant)
    grow.setActivePlant(plant.id)
    return plant
  }

  public get styleObj() {
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

      const yPos = {
        top: "",
        bottom: ""
      }
      if (posBottom) {
        yPos.bottom = growData.position.y + "px"
      } else {
        yPos.top = growData.position.y + "px"
      }
      return {
        transform: `rotateX(${growData.rotation.x}deg) rotateY(${growData.rotation.y}deg) rotateZ(${growData.rotation.z}deg) translateZ(${growData.rotation.translate}px)`,
        ...yPos,
        left: growData.position.x + "px",
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
    return (defaultBg: string, highlight: boolean) => {
      return "bg-" + (highlight ? this.highlightBg : defaultBg)
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
    if (!grow.activeEntity || grow.activeEntityType != "plants") {
      console.log("mouse controls for plants only (TODO)")
      return
    }

    const entity = grow.activeEntity

    if (this.startX == null || this.startY == null) {
      this.startX = e.pageX
      this.startY = e.pageY
    }

    // update rotation
    if (this.ctrlDown || this.shiftDown) {
      const newRotations: Rotation = {
        x: entity.rotation.x,
        y: entity.rotation.y,
        z: entity.rotation.z,
        translate: entity.rotation.translate
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
      grow.setRotation({
        id: entity.id,
        dataKey: "plants",
        newRotations
      })
    } else {
      // update position
      const currentTop = entity.position.y
      const currentLeft = entity.position.x
      const newPositions: Position = {
        y: currentTop + e.pageY - this.startY,
        x: currentLeft + e.pageX - this.startX
      }

      grow.setPosition({ id: entity.id, dataKey: "plants", newPositions })
    }
    this.startY = e.pageY
    this.startX = e.pageX
  }

  public mouseDown(e: MouseEvent) {
    if (grow.activeEntity && grow.growWindowActive) {
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
      grow.removeActivePlant()
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
