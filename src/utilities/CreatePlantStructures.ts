import {
  LeafTexture,
  LeafOptions,
  Rotation,
  GrowLeaf,
  GrowBranch,
  BranchOptions,
  Coordinate
} from "@/store/interfaces"
import {
  DEFAULT_LEAF_OPTIONS,
  DEFAULT_LEAF_TEXTURE,
  BRANCH_INIT
} from "@/fixtures/Grow/Defaults"
import util from "./StructureHelpers"

export function createLeaves(
  color: string,
  tilt: number,
  options: { texture: LeafTexture; custom?: LeafOptions } = {
    texture: DEFAULT_LEAF_TEXTURE
  }
): GrowLeaf[] {
  const { topHeight, bottomHeight, spacing, sides, area } = options.custom
    ? options.custom
    : DEFAULT_LEAF_OPTIONS[options.texture]
  const adjustedSides = sides < 3 ? 3 : sides

  const width = util.getLeafWidth(bottomHeight, adjustedSides) - spacing

  const topBorder = util.topLeafBorder(width, topHeight)
  const bottomBorder = util.bottomLeafBorder(width, bottomHeight)

  const angleInc = area / (adjustedSides - 1)
  const leaves = [] as GrowLeaf[]
  for (let i = 0; i < adjustedSides; i++) {
    const shapes = util.leafTemplate(color, topBorder, bottomBorder)

    const shiftedI = i - (adjustedSides - 1) / 2
    const angle = angleInc * shiftedI + tilt

    const rotation: Rotation = {
      x: 0,
      y: 0,
      z: angle,
      translate: 0
    }
    const height = topHeight + bottomHeight
    const leaf: GrowLeaf = {
      id: 0,
      position: {
        x: height / 2 - width / 2,
        y: -height / 2
      },
      rotation,
      height,
      width,
      shapes,
      transitionSpeed: 0.75
    }

    leaves.push(leaf)
  }

  return leaves
}

export function createBranch(
  startPoint: Coordinate,
  options: BranchOptions | null = null
): GrowBranch {
  const { height, width, angle, hasLeaf, hasFlower } = options
    ? options
    : BRANCH_INIT()

  const angleRadians = util.radians(angle)
  const compAngleRadians = util.radians(90 - angle)
  const endPoint = util.getBranchEndPoint(height, angleRadians, startPoint)

  // CSS still positions from where the edges of branch would be if it was NOT rotated
  // rotates from center point of bottom/middle, rotation circle has radius of width / 2
  // calculate x/y offsets by solving for triangles created, relative to starting position at 0 rotation
  const topOffset = (width / 2) * (1 - Math.cos(angleRadians))
  const leftOffset = Math.abs((width / 2) * Math.cos(compAngleRadians))

  const top = Math.abs(endPoint.y) - startPoint.y - height + topOffset / 2

  // want to compensate for negative angle rotation by pushing branch to right
  let left = -leftOffset
  if (angle < 0) {
    left -= endPoint.x - startPoint.x
  }

  // TODO: there is still some variance between where the branch is positioned by CSS and what the offsets are,
  // and where it seems it should be positioned based on geometry.
  // review geometry and how CSS behaves.
  // Within reasonable bounds for height/branch width, it displays good enough for now.

  // x endPoint can be negative/before start point if branch is rotated negatively
  const bigX = Math.max(endPoint.x, startPoint.x)
  const smallX = Math.min(endPoint.x, startPoint.x)
  const containerWidth = bigX - smallX + leftOffset / 2
  const containerHeight = endPoint.y - startPoint.y + topOffset
  const containerPosition: Coordinate = {
    y: startPoint.y,
    x: smallX
  }

  const branch: GrowBranch = {
    startPoint,
    endPoint,
    hasLeaf,
    hasFlower,
    offSet: {
      top: topOffset,
      left: leftOffset
    },
    height: containerHeight,
    width: containerWidth,
    rotation: {
      x: 0,
      y: 0,
      z: angle,
      translate: 0
    },
    position: containerPosition,
    branchHeight: height,
    branchWidth: width,
    branchPosition: {
      x: left,
      y: top
    },
    transitionSpeed: 0.75,
    id: 0
  }

  return branch
}
