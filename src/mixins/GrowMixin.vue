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
  Coordinate,
  GrowShape,
  Plant,
  Rotation,
  GrowLeafCluster,
  BranchOptions
} from "@/store/interfaces"
import { createLeaves, createBranch } from "@/utilities/CreatePlantStructures"
// temp
import { ENTITY_INIT } from "@/fixtures/Grow/Defaults"

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

  public makeGrowId(growType: string, id: string, index: number) {
    return `${growType}-${id}-${index + 1}`
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

    const plantEntityCount = grow.countPlantEntities(basePlant.id)
    const entityId = `${basePlant.id}-${plantEntityCount}`

    // TEMP to demo - TODO: make recursive function to create structures based on plant characteristics
    // TODO: add fixture for leaf shapes depending on plant properties
    const startPoint = {
      x: 0,
      y: 0
    }
    const branchOptions: BranchOptions = {
      height: 50,
      width: 5,
      angle: 60,
      hasLeaf: false,
      hasFlower: false
    }
    const branchOptions2: BranchOptions = {
      height: 50,
      width: 5,
      angle: -70,
      hasLeaf: false,
      hasFlower: false
    }
    const mainBranch = createBranch(
      startPoint,
      this.makeGrowId("branch", entityId, 1),
      0,
      branchOptions
    )
    const branch = createBranch(
      mainBranch.endPoint,
      this.makeGrowId("branch", entityId, 1),
      mainBranch.height,
      branchOptions
    )

    const mainBranch2 = createBranch(
      startPoint,
      this.makeGrowId("branch", entityId, 1),
      0
    )
    const branch2 = createBranch(
      mainBranch2.endPoint,
      this.makeGrowId("branch", entityId, 1),
      71,
      branchOptions
    )
    const branch3 = createBranch(
      branch2.endPoint,
      this.makeGrowId("branch", entityId, 1),
      18,
      branchOptions
    )
    const branch4 = createBranch(
      branch3.endPoint,
      this.makeGrowId("branch", entityId, 1),
      18,
      branchOptions2
    )
    const branch5 = createBranch(
      branch3.endPoint,
      this.makeGrowId("branch", entityId, 1),
      18
    )

    const colorList = basePlant.main_species.foliage.color
    const color = colorList ? colorList[0] : "green"

    const leaves: GrowLeaf[] = createLeaves(color, 10)
    const leaves2: GrowLeaf[] = createLeaves("red", 5, { texture: "coarse" })
    const leaves3: GrowLeaf[] = createLeaves("lime", -20)
    const leafHeight = leaves[0].height
    const leafCluster: GrowLeafCluster = {
      rotation: branch4.rotation,
      position: branch4.endPoint,
      offSet: branch4.offSet,
      height: leafHeight,
      width: leafHeight,
      id: this.makeGrowId("leaf-cluster", entityId, 1),
      leaves
    }
    const leafCluster2: GrowLeafCluster = {
      rotation: branch5.rotation,
      position: branch5.endPoint,
      offSet: branch5.offSet,
      height: leafHeight,
      width: leafHeight,
      id: this.makeGrowId("leaf-cluster", entityId, 1),
      leaves: leaves2
    }
    const leafCluster3: GrowLeafCluster = {
      rotation: branch.rotation,
      position: branch.endPoint,
      offSet: branch.offSet,
      height: leafHeight,
      width: leafHeight,
      id: this.makeGrowId("leaf-cluster", entityId, 1),
      leaves: leaves3
    }
    const entity: GrowEntity = {
      name: basePlant.main_species.common_name,
      plantId: basePlant.id,
      id: entityId,
      leafClusters: [leafCluster, leafCluster2, leafCluster3],
      branches: [
        mainBranch,
        branch,
        mainBranch2,
        branch2,
        branch3,
        branch4,
        branch5
      ],
      ...ENTITY_INIT() // default rotation/position/size,
    }
    grow.addEntity(entity)
    grow.setActiveEntity(entity)
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
      const newPosition: Coordinate = {
        y: 0,
        x: 0
      }
      let currentTop = 0,
        currentLeft = 0
      const activeElem = document.getElementById(grow.activeEntity.id)
      if (grow.activeEntity.position.y) {
        currentTop = grow.activeEntity.position.y
      } else {
        currentTop = activeElem ? activeElem.offsetTop : 0
      }
      if (grow.activeEntity.position.x) {
        currentLeft = grow.activeEntity.position.x
      } else {
        currentLeft = activeElem ? activeElem.offsetLeft : 0
      }
      newPosition.y = currentTop + e.pageY - this.startY
      newPosition.x = currentLeft + e.pageX - this.startX
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
