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
      @mouseleave="trackMouse = false"
    >
      <plant v-for="plant in growPlants" :key="plant.id" :growData="plant" />
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

  public get el() {
    return this.$el as HTMLElement
  }

  public mounted() {
    window.addEventListener("keydown", this.keyDown)
    window.addEventListener("keyup", this.keyUp)
    this.el.addEventListener("mousedown", this.mouseDown)
    this.el.addEventListener("mouseup", this.mouseUp)
  }

  public beforeDestroy() {
    window.removeEventListener("keydown", this.keyDown)
    window.removeEventListener("keyup", this.keyUp)
    // thinking this is unnecessary since it's being destroyed?
    this.el.removeEventListener("mousedown", this.mouseDown)
    this.el.removeEventListener("mouseup", this.mouseUp)
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
    } else {
      this.startPos = null
      document.removeEventListener("mousemove", this.updateEntity)
    }
  }

  public updateEntity(e: MouseEvent) {
    e.preventDefault()
    if (!grow.activeEntity || grow.activeEntityType != "plants") {
      this.$toasted.info("Sorry, mouse controls only work for plants (so far!)")
      document.removeEventListener("mousemove", this.updateEntity)
      return
    }

    const entity = grow.activeEntity

    if (this.startPos == null) {
      this.startPos = {
        x: e.pageX,
        y: e.pageY,
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
        newRotations.translate += e.pageX - this.startPos.x
      } else if (this.ctrlDown) {
        newRotations.z += e.pageX - this.startPos.x
      } else if (this.shiftDown) {
        // rotating along x/y axis more intuitively tracks the movement of the cursor along opposite axis
        newRotations.x += e.pageY - this.startPos.y
        newRotations.y += e.pageX - this.startPos.x
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
        y: currentTop + e.pageY - this.startPos.y,
        x: currentLeft + e.pageX - this.startPos.x,
      }

      grow.setPosition({ id: entity.id, dataKey: "plants", newPositions })
    }
    this.startPos = {
      x: e.pageX,
      y: e.pageY,
    }
  }
}
</script>
