<template>
  <div
    :id="entityData.id"
    :style="styleObj(entityData)"
    class="absolute"
    :class="{ 'outline-black': isActive }"
    @dblclick="setActive()"
  >
    <branch :branchData="staticBranch" />
    <!-- TODO: Leaf cluster component -->
    <!-- <div
      class="absolute"
      v-for="(leaf, index) in entityData.leaves"
      :key="`leaf-${entityData.id}-${index}`"
      :style="styleObj(leaf)"
    >
      <shape
        v-for="(shape, index) in leaf.shapes"
        :key="`shape-${entityData.id}-${index}`"
        :growData="shape"
      />
    </div> -->
  </div>
</template>

<script lang="ts">
import { Coordinate, GrowBranch, GrowEntity } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop, Watch } from "vue-property-decorator"
import messages from "@/fixtures/Messages"
import Shape from "@/components/Grow/Shape.vue"
import Branch from "@/components/Grow/Branch.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { noPosition, noRotation } from "@/fixtures/Grow/Defaults"

@Component({
  components: {
    Shape,
    Branch
  }
})
export default class Entity extends GrowMixin {
  @Prop() entityData!: GrowEntity

  // temp branch generation code
  public radians(angle: number): number {
    return (angle * Math.PI) / 180
  }

  public getEndPoint(
    height: number,
    radians: number,
    startPoint: Coordinate
  ): Coordinate {
    // find out where the end of the branch is,
    // given its dimensions and angle/tilt

    const x = height * Math.sin(radians) + startPoint.x
    const y = height * Math.cos(radians) + startPoint.y

    return { x, y }
  }

  public get staticBranch(): GrowBranch {
    const hasLeaf = true
    const hasFlower = false

    const startPoint = {
      x: 0,
      y: 0
    }
    const height = 500
    const width = 10
    // angle must be between -90 -> 90
    const angle = 80
    const radians = this.radians(angle)
    const endPoint = this.getEndPoint(height, radians, startPoint)

    const topOffset = width / 2 - (width / 2) * Math.sin(Math.PI / 2 - radians)
    const leftOffset = (width / 2) * Math.cos(Math.PI / 2 - radians)

    const top = angle < 0 ? -width : endPoint.y - height + topOffset
    const left = angle < 0 ? -1 * endPoint.x + leftOffset : -leftOffset

    console.log(topOffset, leftOffset)
    console.log(top, left)
    const branch: GrowBranch = {
      startPoint,
      endPoint,
      hasLeaf,
      hasFlower,
      // temp
      offSet: {
        top: topOffset,
        left: leftOffset
      },
      height,
      width,
      rotation: {
        x: 0,
        y: 0,
        z: angle,
        translate: 0
      },
      // offset the position by the rotation,
      // so that branch is centered in container
      position: {
        top,
        left
      }
    }

    return branch
  }

  public mounted() {
    if (!this.entityData) {
      throw console.error("no entity provided!")
    }
  }

  public get isActive(): boolean {
    return grow.activeEntity?.id == this.entityData.id
  }

  public setActive() {
    if (this.isActive) {
      grow.removeActiveEntity()
    } else {
      grow.setActiveEntity(this.entityData)
    }
  }
}
</script>
