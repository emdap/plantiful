import { BRANCH_INIT, NO_POSITION } from "@/fixtures/Grow/Defaults"
import {
  LeafTexture,
  LeafOptions,
  Rotation,
  GrowLeaf,
  GrowBranch,
  BranchOptions,
  Coordinate,
  GrowLeafCluster,
  Plant,
  PlantOptions,
  GrowBasis
} from "@/store/interfaces"
import util from "../utilities/growUtil"

export function createLeaves(
  order: number,
  colors: string[],
  options: LeafOptions
): GrowLeaf[] {
  const { topHeight, bottomHeight, spacing, sides, area } = options
  const adjustedSides = sides < 3 ? 3 : sides

  const width = util.getLeafWidth(bottomHeight, adjustedSides) - spacing

  const topBorder = util.topLeafBorder(width, topHeight)
  const bottomBorder = util.bottomLeafBorder(width, bottomHeight)

  const angleInc = area / (adjustedSides - 1)
  const leaves = [] as GrowLeaf[]
  for (let i = 0; i < adjustedSides; i++) {
    const colorIndex = Math.floor(Math.random() * colors.length)
    const color = colors[colorIndex]
    const shapes = util.leafTemplate(color, topBorder, bottomBorder)

    const shiftedI = i - (adjustedSides - 1) / 2
    const angle = angleInc * shiftedI

    const rotation: Rotation = {
      x: 0,
      y: 0,
      z: angle,
      translate: 0
    }
    const height = topHeight + bottomHeight
    const leaf: GrowLeaf = {
      id: 0,
      order,
      position: {
        x: height / 2 - width / 2,
        y: -height / 2
      },
      rotation,
      height,
      width,
      shapes,
      transitionSpeed: 0.5
    }

    leaves.push(leaf)
  }

  return leaves
}

export function createBranch(
  order: number,
  startPoint: Coordinate,
  options?: BranchOptions
): GrowBranch {
  const { height, width, angle, hasLeaf, hasFlower } = util.getBranchOptions(
    options
  )
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
    order,
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
    transitionSpeed: 0.5,
    id: 0
  }

  return branch
}

export function createLeafCluster(
  order: number,
  baseBranch: GrowBranch,
  colors: string[],
  leafOptions?: { texture?: LeafTexture; custom?: LeafOptions }
): {
  leafCluster: GrowLeafCluster
  leaves: GrowLeaf[]
} {
  const options = util.getLeafOptions(leafOptions)

  const leaves = createLeaves(order, colors, options)
  const leafHeight = options.topHeight + options.bottomHeight
  const leafCluster: GrowLeafCluster = {
    id: 0,
    order,
    rotation: baseBranch.rotation,
    position: baseBranch.endPoint,
    offSet: baseBranch.offSet,
    height: leafHeight,
    width: leafHeight,
    leaves: []
  }

  return {
    leafCluster,
    leaves
  }
}

function nextAngle(
  prevBranch: GrowBranch | null,
  curAngle: number,
  direction: "right" | "left"
): number {
  let prevAngle = 0
  if (prevBranch) {
    prevAngle = prevBranch.rotation.z
  }
  let newAngle = 0
  if (direction == "left") {
    if (prevAngle > 0) {
      newAngle = Math.max(prevAngle - 60, -30)
    } else {
      newAngle = Math.max(prevAngle - 30, -75)
    }
  } else {
    if (prevAngle < -15) {
      newAngle = Math.min(prevAngle + 60, 15)
    } else {
      newAngle = Math.min(prevAngle + 30, 75)
    }
  }
  console.log(direction, "prev", prevAngle, "new", newAngle)
  return newAngle
}

function growBranch(
  heightLeft: number,
  order: number,
  branchOptions: BranchOptions,
  branchSide: "base" | "left" | "right",
  branches: GrowBranch[]
): GrowBranch[] {
  branchOptions = util.getBranchOptions(branchOptions)
  const { angle, height } = branchOptions

  const prevBranch = branches.length ? branches[branches.length - 1] : null

  let newAngle!: number,
    newStart!: Coordinate,
    newOrder!: number,
    reCalcHeightLeft!: boolean,
    nextSide!: "right" | "left"
  if (heightLeft > 0) {
    switch (branchSide) {
      case "base":
        newAngle = angle
        newStart = NO_POSITION()
        newOrder = order + 1
        reCalcHeightLeft = true
        nextSide = "left"
        break
      case "right":
        // newAngle = angle + 60 > 90 ? 90 : angle + 60
        newAngle = nextAngle(prevBranch, angle, "right")
        newStart = prevBranch ? prevBranch.startPoint : NO_POSITION()
        newOrder = order + 1
        reCalcHeightLeft = true
        nextSide = "left"
        break
      case "left":
        newAngle = nextAngle(prevBranch, angle, "left")
        newStart = prevBranch ? prevBranch.endPoint : NO_POSITION()
        newOrder = order
        reCalcHeightLeft = false
        nextSide = "right"
        break
    }

    const newOptions = { ...branchOptions, angle: newAngle }
    const branch = createBranch(newOrder, newStart, newOptions)
    let newHeightLeft!: number
    if (reCalcHeightLeft) {
      if (prevBranch) {
        newHeightLeft = heightLeft - Math.max(branch.height, prevBranch.height)
      } else {
        newHeightLeft = heightLeft - branch.height
      }
    } else {
      newHeightLeft = heightLeft
    }
    if (newHeightLeft <= 0) {
      branch.hasLeaf = true
    }
    branches.push(branch)
    // console.log("side", branchSide, "angle", newAngle, "height", branch.height, newHeightLeft, branch.hasLeaf)
    return growBranch(newHeightLeft, newOrder, newOptions, nextSide, branches)
  }
  return branches
}

export function createPlant(plant?: Plant) {
  const plantOptions = util.getPlantOptions(plant)
  // add 1 branch for every 50cm of spread
  const baseBranches = Math.ceil(plantOptions.spread / 50)
  const branchList = [] as GrowBranch[]
  const branchOptions: BranchOptions = BRANCH_INIT()
  // angle range is -angleMax -> +angleMax
  const angleMax = 60 // can manipulate this to create tighter/wider plants based on plant.orientation
  const angleInc = Math.ceil((angleMax * 2) / baseBranches)
  for (let w = 0; w <= baseBranches; w++) {
    // init branches at different angles
    branchOptions.angle = -angleMax + w * angleInc
    // const initDirection = branchOptions.angle < 0 ? "left" : "right"
    growBranch(plantOptions.height, 1, branchOptions, "base", branchList)
    // branchList.push(...growBranch(plantOptions.height, 1, branchOptions, initDirection))
    // }
  }
  console.log(
    branchList.map(b => {
      return b.rotation.z
    })
  )
  return branchList
}
