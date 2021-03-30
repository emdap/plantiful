<template>
  <div
    :id="entityData.id"
    :style="styleObj(entityData)"
    class="absolute"
    :class="{ 'outline-black': isActive }"
    @dblclick="setActive()"
  >
    <branch
      v-for="(branch, index) in entityData.branches"
      :key="makeKey('branch', entityData.id, index)"
      :branchData="branch"
    />
    <leaf-cluster
      v-for="(leafCluster, index) in entityData.leafClusters"
      :key="makeKey('leaf-cluster', entityData.id, index)"
      :entityId="entityData.id"
      :leafClusterData="leafCluster"
    />
  </div>
</template>

<script lang="ts">
import { Coordinate, GrowBranch, GrowEntity } from "@/store/interfaces"
import Component from "vue-class-component"
import { Prop, Watch } from "vue-property-decorator"
import messages from "@/fixtures/Messages"
import Shape from "@/components/Grow/Shape.vue"
import Branch from "@/components/Grow/Branch.vue"
import LeafCluster from "@/components/Grow/LeafCluster.vue"
import GrowMixin, { grow } from "@/mixins/GrowMixin.vue"
import { NO_POSITION, NO_ROTATION } from "@/fixtures/Grow/Defaults"

@Component({
  components: {
    Shape,
    Branch,
    LeafCluster
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
    const width = 20
    // angle must be between -90 -> 90
    const angle = 80
    const radians = this.radians(angle)
    const endPoint = this.getEndPoint(height, radians, startPoint)

    // CSS still positions from where the edges of branch would be if it was NOT rotated
    // rotates from center point of bottom/middle
    // calculate x/y offsets by solving for triangles created, relative to starting position at 0 rotation
    const compAngleRadians = this.radians(90 - angle)
    const topOffset = (width / 2) * (1 - Math.cos(radians))
    const leftOffset = Math.abs((width / 2) * Math.cos(compAngleRadians))

    const top = endPoint.y - height + topOffset / 2
    let left = -leftOffset
    if (angle < 0) {
      left -= endPoint.x
    }

    // TODO: there is still some variance between where the branch is positioned by CSS and what the offsets are,
    // and where it seems it should be positioned based on geometry.
    // review geometry and how CSS behaves.
    // Within reasonable bounds for height/branch width, it displays good enough for now.

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
        y: top,
        x: left
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
