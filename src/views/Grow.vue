<template>
  <div id="grow" class="h-full w-full overflow-hidden">
    <div v-if="!hasGrowPlants" class="font-semibold mt-10">
      {{ messages.openSearch }}
      <button
        class="btn-light dark:btn-dark my-4 mx-auto block"
        @click="toggleSearchPlants(true)"
      >
        Start Searching
      </button>
    </div>
    <div
      v-else
      id="plant-wrapper"
      class="h-full w-full relative overflow-hidden"
      @dblclick.self="removeActive()"
    >
      <plant
        v-for="plant in growPlantsDict"
        :key="plant.id"
        :growData="plant"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import Plant from "@/components/Grow/Plant.vue"
import Controls from "@/views/Controls.vue"
import { Prop, Watch } from "vue-property-decorator"
import { Position, Rotation } from "@/store/interfaces"

@Component({
  components: {
    Plant,
    Controls,
  },
})
export default class Grow extends GrowMixin {
  @Prop({ default: false }) zoneReady!: boolean

  public ctrlDown = false
  public shiftDown = false
  public trackMouse = false
  public startPos: Position | null = null

  public touchStartTime = 0

  public mounted() {
    window.addEventListener("keydown", this.keyDown)
    window.addEventListener("keyup", this.keyUp)
    document.addEventListener("mouseup", this.mouseUp)
    this.el.addEventListener("mousedown", this.mouseDown)
    this.el.addEventListener("touchstart", this.trackTouch)
    this.el.addEventListener("touchend", this.trackTouch)
  }

  public beforeDestroy() {
    grow.removeActivePlant()
    window.removeEventListener("keydown", this.keyDown)
    window.removeEventListener("keyup", this.keyUp)
    document.removeEventListener("mouseup", this.mouseUp)
    // thinking this is unnecessary since it's being destroyed?
    this.el.removeEventListener("mousedown", this.mouseDown)
    this.el.removeEventListener("touchstart", this.trackTouch)
    this.el.removeEventListener("touchend", this.trackTouch)
  }

  public trackTouch(e: TouchEvent) {
    if (e.type == "touchstart") {
      e.preventDefault()
      this.mouseDown()
    } else {
      this.mouseUp()
    }
  }

  // overriding mixin function
  public timeTouch(e: TouchEvent) {
    if (e.type == "touchstart") {
      this.touchStartSeconds = this.currentSeconds()
      const { pageX, pageY } = e.touches[0] || e.changedTouches[0]
      this.touchPos = {
        x: pageX,
        y: pageY,
      }
    } else {
      if (this.currentSeconds() - this.touchStartSeconds > 0) {
        const { pageX, pageY } = e.touches[0] || e.changedTouches[0]
        if (pageX == this.touchPos?.x && pageY == this.touchPos?.y) {
          e.preventDefault()
          this.removeActive()
        }
        this.touchStartSeconds = 0
      }
    }
  }

  public removeActive() {
    grow.removeActivePlant()
  }

  public mouseDown() {
    if (grow.activeEntity) {
      this.trackMouse = true
    }
  }

  public mouseUp() {
    if (this.trackMouse) {
      this.trackMouse = false
    }
  }

  public keyDown(e: KeyboardEvent) {
    if (!this.activeEntity) {
      return
    }
    if (!this.ctrlDown && e.ctrlKey) {
      this.ctrlDown = true
    } else if (!this.shiftDown && e.shiftKey) {
      this.shiftDown = true
    } else if (e.key == "+" || e.key == "-") {
      this.zoomPlant(e.key == "+")
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

  @Watch("trackMouse")
  public mouseUpdatesEntity(track: boolean) {
    if (track) {
      document.addEventListener("mousemove", this.updateEntity)
      document.addEventListener("touchmove", this.updateEntity)
    } else {
      this.startPos = null
      document.removeEventListener("mousemove", this.updateEntity)
      document.removeEventListener("touchmove", this.updateEntity)
    }
  }

  public zoomPlant(increase: boolean) {
    if (grow.activeGrowPlant) {
      const newZoom = increase
        ? Math.min(200, grow.activeGrowPlant.zoom + 1)
        : Math.max(1, grow.activeGrowPlant.zoom - 1)
      grow.setPlantZoom({ id: grow.activeGrowPlant.id, newZoom })
    }
  }

  public updateEntity(e: MouseEvent | TouchEvent) {
    if (!grow.activeEntity || !grow.activeGrowPlant) {
      // if (!grow.activeEntity || grow.activeEntityType != "plants") {
      // this.$toasted.info("Sorry, mouse controls only work for plants (so far!)")
      document.removeEventListener("mousemove", this.updateEntity)
      document.removeEventListener("touchmove", this.updateEntity)
      return
    }

    // just have mouse controls always move the plant for now, update when other movements supported
    const entity = grow.activeGrowPlant

    const { pageX, pageY } =
      e instanceof MouseEvent ? e : e.touches[0] || e.changedTouches[0]

    if (this.startPos == null) {
      this.startPos = {
        x: pageX,
        y: pageY,
      }
    }
    // update rotation
    if (this.ctrlDown || this.shiftDown) {
      const newRotations: Rotation = {
        x: entity.rotation.x,
        y: entity.rotation.y,
        z: entity.rotation.z,
        translate: entity.rotation.translate,
      }

      if (this.ctrlDown && this.shiftDown) {
        newRotations.translate += pageX - this.startPos.x
      } else if (this.ctrlDown) {
        newRotations.z += pageX - this.startPos.x
      } else if (this.shiftDown) {
        // rotating along x/y axis more intuitively tracks the movement of the cursor along opposite axis
        newRotations.x += pageY - this.startPos.y
        newRotations.y += pageX - this.startPos.x
      }
      grow.setRotation({
        id: entity.id,
        dataKey: "plants",
        newRotations,
      })
    } else {
      // update position
      const currentTop = (entity.position as Position).y
      const currentLeft = (entity.position as Position).x
      const newPositions: Position = {
        y: currentTop + pageY - this.startPos.y,
        x: currentLeft + pageX - this.startPos.x,
      }
      grow.setPosition({ id: entity.id, dataKey: "plants", newPositions })
    }
    this.startPos = {
      x: pageX,
      y: pageY,
    }
  }
}
</script>
