<template>
  <div
    :style="styleObj(entityData)"
    class="absolute"
    @mousedown="trackRotation = true"
  >
    <shape
      v-for="(shape, index) in entityData.shapes"
      :key="`shape-${entityData.id}-${index}`"
      :growData="shape"
    />
  </div>
</template>

<script lang="ts">
import { GrowEntity } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop, Watch } from "vue-property-decorator"
import messages from "@/fixtures/Messages"
import Shape from "@/components/Grow/Shape.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"

@Component({
  components: {
    Shape
  }
})
export default class Entity extends GrowMixin {
  @Prop() entityData!: GrowEntity

  public startX: number | null = null
  public startY: number | null = null
  public trackRotation = false
  public ctrlDown = false

  public mounted() {
    if (!this.entityData) {
      throw console.error(messages.grow.missingEntityData)
    }
    this.initListeners()
  }

  public initListeners() {
    window.addEventListener("keydown", this.keyDown)
    window.addEventListener("keyup", this.keyUp)
    document.addEventListener("mouseup", (e: MouseEvent) => {
      console.log("trackRotation mouseup", this.trackRotation)
      if (this.trackRotation) {
        e.preventDefault()
        this.trackRotation = false
      }
    })
  }

  @Watch("trackRotation")
  public mouseUpdatesRotation(track: boolean) {
    console.log(track)
    if (track) {
      document.addEventListener("mousemove", this.updateRotation)
    } else {
      this.startX = this.startY = null
      document.removeEventListener("mousemove", this.updateRotation)
    }
  }

  public updateRotation(e: MouseEvent) {
    e.preventDefault()
    console.log("update rotation")
    if (this.startX == null || this.startY == null) {
      this.startX = e.pageX
      this.startY = e.pageY
      return
    }

    if (this.ctrlDown) {
      this.entityData.rotation.z =
        this.entityData.rotation.z + e.pageX - this.startX
    } else {
      // rotating along x/y axis more intuitively tracks the movement of the cursor along opposite axis
      this.entityData.rotation.x =
        this.entityData.rotation.x + e.pageY - this.startY
      this.entityData.rotation.y =
        this.entityData.rotation.y + e.pageX - this.startX
    }
    this.startX = e.pageX
    this.startY = e.pageY
  }

  public keyDown(e: KeyboardEvent) {
    console.log("ctrl", e.ctrlKey)
    if (e.ctrlKey) {
      this.ctrlDown = true
    }
  }

  public keyUp(e: KeyboardEvent) {
    console.log("ctrl", e.ctrlKey)
    if (e.ctrlKey) {
      this.ctrlDown = false
    }
  }
}
</script>
