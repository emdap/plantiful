<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { getModule } from "vuex-module-decorators"
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
  GrowDataKey,
} from "@/store/interfaces"
import { Prop, Watch } from "vue-property-decorator"

export const grow = getModule(GrowModule)

@Component({})
export default class GrowMixin extends Vue {
  @Prop({ default: true }) allowSelection!: boolean
  @Prop({ default: false }) plantHighlight!: boolean

  public messages = growMessages

  public entityType = "" as GrowDataKey
  public entityId = -1

  public highlight = false
  public highlightBg = { color: "yellow", level: 200, darkLevel: 400 }
  public active = false
  public activeBg = { color: "pink", level: 700, darkLevel: 400 }
  public bgDuration = 1000
  public defaultBg = null as string | null

  public touchStartSeconds = 0

  public get el() {
    // necessary for touch events
    return this.$el as HTMLElement
  }

  public mounted() {
    this.el.addEventListener("touchstart", this.timeTouch)
    this.el.addEventListener("touchend", this.timeTouch)
  }

  public destroyed() {
    this.el.removeEventListener("touchstart", this.timeTouch)
    this.el.removeEventListener("touchend", this.timeTouch)
  }

  public timeTouch(e: TouchEvent) {
    if (
      e.type == "touchstart" &&
      this.entityType.length &&
      this.entityId != -1
    ) {
      if (
        this.touchStartSeconds &&
        this.currentSeconds() - this.touchStartSeconds < 1
      ) {
        this.activateFromTouch(e)
        this.touchStartSeconds = 0
      } else {
        this.touchStartSeconds = this.currentSeconds()
      }
    }
  }

  public activateFromTouch(e: TouchEvent) {
    e.preventDefault()
    if (this.allowSelection) {
      e.stopPropagation()
      grow.setActiveEntity({
        dataKey: this.entityType,
        id: this.entityId,
      })
    }
  }

  public currentSeconds() {
    const date = new Date()
    return date.getSeconds() + 60 * (date.getMinutes() * 60 + date.getHours())
  }

  // TODO: reorg file a bit, added a lot to the end

  // widgets
  public toggleSearchPlants(forceShow?: boolean) {
    grid.toggleWidgetName({ name: "search", forceShow })
  }

  public get growWidget() {
    return grid.getWidget("grow")
  }

  // state
  public get overBranchLimit(): boolean {
    return (
      Object.keys(grow.plants).length > 1 &&
      Object.keys(grow.branches).length > grow.maxBranches
    )
  }

  public setHighlightEntity(id: number) {
    return grow.setHighlightEntity(id)
  }

  public get growPlantsDict(): GrowData<GrowPlant> {
    return grow.plants
  }

  public get activeGrowPlant(): GrowPlant | null {
    return grow.activeGrowPlant
  }

  public get activeEntity(): GrowType | null {
    return grow.activeEntity
  }

  public get activeEntityType(): GrowDataKey | null {
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

  public deleteOldestPlant() {
    grow.deleteOldestPlant()
  }

  public activateEntity(
    plantActive: boolean,
    dataKey: GrowDataKey,
    id: number,
    e?: MouseEvent
  ) {
    if (plantActive) {
      e?.stopPropagation()
      grow.setActiveEntity({ id, dataKey })
    }
  }

  public growDataKeyText(dataKey: GrowDataKey) {
    switch (dataKey) {
      case "leafClusters":
        return "Leaf Cluster"
      case "leaves":
        return "Leaf"
      case "branches":
        return "Branch"
      default:
        return `${dataKey[0].toUpperCase()}${dataKey.substring(
          1,
          dataKey.length - 1
        )}`
    }
  }

  public async growPlant(basePlant: Plant, varyColors = true) {
    const plant = await grow.growPlant({
      basePlant,
      varyColors,
    })

    grow.addPlant(plant)
    grow.setActivePlant(plant.id)

    if (!this.growWidget?.open) {
      grid.toggleWidgetName({ name: "grow", forceShow: true })
    }

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
        y: growData.position ? growData.position.y + "px" : "50%",
      }

      const yPos = {
        top: "",
        bottom: "",
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
        ...borders,
      }
    }
  }

  public get backgroundClass() {
    // could simplify this -- only used by Branch and PetalLeaf
    let bg = ""
    if (this.highlight || this.active) {
      const { color, level, darkLevel } = this.highlight
        ? this.highlightBg
        : this.activeBg
      bg = `bg-${color}-${level} dark:bg-${color}-${darkLevel}`
    } else if (this.defaultBg) {
      bg = "bg-" + this.defaultBg + " dark:bg-white"
    }
    return bg
  }

  public pulse() {
    this.active = true
    setTimeout(() => {
      this.active = false
    }, this.bgDuration)
  }

  public get selfActive() {
    return (
      grow.activeEntityType == this.entityType &&
      grow.activeEntity?.id == this.entityId
    )
  }

  public get selfHighlight() {
    return (
      grow.highlightEntityType == this.entityType &&
      grow.highlightEntity == this.entityId
    )
  }

  @Watch("allowSelection")
  public selectionPulse(active: boolean) {
    if (active) {
      this.pulse()
    }
  }

  @Watch("selfActive")
  public selfPulse(active: boolean) {
    if (active) {
      this.pulse()
    }
  }

  @Watch("plantHighlight")
  public highlightFromPlant(highlight: boolean) {
    this.highlight = highlight
  }

  @Watch("selfHighlight")
  public showHighlight(highlight: boolean) {
    this.highlight = highlight
  }
}
</script>
