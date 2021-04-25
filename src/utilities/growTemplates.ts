import { GrowBorder, TopGrowBorder, GrowShape } from "@/store/interfaces"
import { NO_ROTATION, NO_POSITION } from "@/fixtures/Defaults"

function topLeafBorder(width: number, height: number): TopGrowBorder {
  return {
    left: {
      size: width / 2,
      show: false,
    },
    right: {
      size: width / 2,
      show: false,
    },
    bottom: {
      size: height,
      show: true,
    },
  }
}

function bottomLeafBorder(width: number, height: number): GrowBorder {
  return {
    left: {
      size: width / 2,
      show: false,
    },
    right: {
      size: width / 2,
      show: false,
    },
    top: {
      size: height,
      show: true,
    },
  }
}

function topFlowerBorder(): GrowBorder {
  return {
    left: {
      size: 5,
      show: true,
    },
    right: {
      size: 5,
      show: true,
    },
    top: {
      size: 5,
      show: true,
    },
    bottom: {
      size: 5,
      show: true,
    },
  }
}

function leafTemplate(
  color: string,
  topBorder: TopGrowBorder,
  bottomBorder: GrowBorder
): GrowShape[] {
  return [
    {
      color,
      rotation: NO_ROTATION(),
      position: NO_POSITION(),
      height: 0,
      width: 0,
      border: topBorder,
      transitionSpeed: 0.5,
      zIndex: 10,
    },
    {
      color,
      rotation: NO_ROTATION(),
      position: {
        y: topBorder.bottom.size - 1,
        x: 0,
      },
      height: 0,
      width: 0,
      border: bottomBorder,
      transitionSpeed: 0.5,
      zIndex: 10,
    },
  ]
}

function flowerTemplate(color: string, border: GrowBorder): GrowShape[] {
  // only one shape, but want to be able to iterate/render same as leaves
  return [
    {
      color,
      rotation: NO_ROTATION(),
      position: NO_POSITION(),
      height: 0,
      width: 0,
      border,
      transitionSpeed: 0.5,
      zIndex: 10,
    },
    {
      color,
      rotation: NO_ROTATION(),
      position: {
        y: -5,
        x: 0,
      },
      height: 0,
      width: 0,
      border: topFlowerBorder(),
      transitionSpeed: 0.5,
      zIndex: 10,
    },
  ]
}

export default {
  topLeafBorder,
  bottomLeafBorder,
  leafTemplate,
  flowerTemplate,
}
