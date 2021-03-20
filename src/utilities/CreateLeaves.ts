import {
  GrowBorder,
  LeafTexture,
  LeafOptions,
  TopGrowBorder,
  GrowShape,
  Rotation,
  GrowPosition,
  GrowLeaf
} from "@/store/interfaces"
import {
  noRotation,
  noPosition,
  DEFAULT_OPTIONS,
  DEFAULT_TEXTURE
} from "@/fixtures/Grow/Defaults"

function topLeafBorder(width: number, height: number): TopGrowBorder {
  return {
    left: {
      size: width / 2,
      show: false
    },
    right: {
      size: width / 2,
      show: false
    },
    bottom: {
      size: height,
      show: true
    }
  }
}

function bottomLeafBorder(width: number, height: number): GrowBorder {
  return {
    left: {
      size: width / 2,
      show: false
    },
    right: {
      size: width / 2,
      show: false
    },
    top: {
      size: height,
      show: true
    }
  }
}

function getWidth(height: number, sides: number): number {
  console.log(Math.round(2 * height * Math.tan((Math.PI * 1) / (2 * sides))))
  return Math.round(2 * height * Math.tan((Math.PI * 1) / (2 * sides)))
}

function leafTemplate(
  color: string,
  topBorder: TopGrowBorder,
  bottomBorder: GrowBorder
): GrowShape[] {
  return [
    {
      color,
      rotation: noRotation(),
      position: {
        top: -1 * topBorder.bottom.size + 1
      },
      height: 0,
      width: 0,
      border: topBorder
    },
    {
      color,
      rotation: noRotation(),
      position: noPosition(),
      height: 0,
      width: 0,
      border: bottomBorder
    }
  ]
}

export function createLeaves(
  color: string,
  tilt: number,
  options: { texture: LeafTexture; custom?: LeafOptions } = {
    texture: DEFAULT_TEXTURE
  }
): GrowLeaf[] {
  const { topHeight, bottomHeight, spacing, sides, area } = options.custom
    ? options.custom
    : DEFAULT_OPTIONS[options.texture]
  console.log(topHeight, options)
  const adjustedSides = sides < 3 ? 3 : sides
  // console.log(sides, adjustedSides)

  const width = getWidth(bottomHeight, adjustedSides) - spacing

  const topBorder = topLeafBorder(width, topHeight)
  const bottomBorder = bottomLeafBorder(width, bottomHeight)

  const angleInc = area / (adjustedSides - 1)
  const leaves = [] as GrowLeaf[]
  for (let i = 0; i < adjustedSides; i++) {
    const shapes = leafTemplate(color, topBorder, bottomBorder)

    const shiftedI = i - (adjustedSides - 1) / 2
    const angle = angleInc * shiftedI + tilt
    // const position: GrowPosition = {
    //   // top: topHeight / 2 * Math.abs(shiftedI) - topHeight / 2,
    //   top: 0,
    //   left: 0
    // }
    const rotation: Rotation = {
      x: 0,
      y: 0,
      z: angle,
      translate: 0
    }
    const leaf: GrowLeaf = {
      position: noPosition(),
      rotation,
      height: topHeight + bottomHeight,
      width: width,
      shapes
    }
    // const top = topHeight / 2 * Math.abs(shiftedI) - topHeight / 2
    // const bottomTop = topHeight / 2
    // const left = -1 * shiftedI * width
    // console.log('top', position.top)
    // console.log('left', position.left)
    // console.log('top', topTop, 'bottomTop', bottomTop, 'border', topBorder.bottom.size)
    // console.log('angle', angle)
    leaves.push(leaf)
  }

  return leaves
}
