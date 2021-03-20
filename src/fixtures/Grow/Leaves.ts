import { GrowBasis, GrowBorder, GrowShape } from "@/store/interfaces"
import { noRotation, noPosition } from "./Defaults"

function topLeafPanel(width: number, height: number): GrowBorder {
  return {
    left: {
      size: width,
      show: false
    },
    right: {
      size: width,
      show: false
    },
    bottom: {
      size: height,
      show: true
    }
  }
}

function bottomLeafPanel(width: number, height: number): GrowBorder {
  return {
    left: {
      size: width,
      show: false
    },
    right: {
      size: width,
      show: false
    },
    top: {
      size: height,
      show: true
    }
  }
}

// export function defaultLeaf(color: string): GrowShape[] {
//   const topBladeWidth = 10
//   const topBladeHeight = 15
//   const bottomBladeWidth = 10
//   const bottomBladeHeight = 20
//   const leafDepth = 5
//   return [
//     {
//       color,
//       rotation: noRotation,
//       position: noPosition,
//       height: 0,
//       width: 0,
//       border: topLeafPanel(topBladeWidth, topBladeHeight)
//     },
//     {
//       color,
//       rotation: noRotation,
//       position: {
//         top: topBladeHeight - 1
//       },
//       height: 0,
//       width: 0,
//       border: bottomLeafPanel(bottomBladeWidth, bottomBladeHeight)
//     },
//     {
//       color,
//       rotation: {
//         x: 0,
//         y: 0,
//         z: 0,
//         translate: -leafDepth
//       },
//       position: noPosition,
//       height: 0,
//       width: 0,
//       border: topLeafPanel(topBladeWidth, topBladeHeight)
//     },
//     {
//       color,
//       rotation: {
//         x: 0,
//         y: 0,
//         z: 0,
//         translate: -leafDepth
//       },
//       position: {
//         top: topBladeHeight - 1
//       },
//       height: 0,
//       width: 0,
//       border: bottomLeafPanel(bottomBladeWidth, bottomBladeHeight)
//     },
// {
//   color,
//   rotation: {
//     x: 0,
//     y: 0,
//     z: 0,
//     translate: -5
//   },
//   position: {
//     top: 29
//   },
//   height: 10,
//   width: ,
//   border: {
//     left: {
//       size: 25,
//       show: false
//     },
//     right: {
//       size: 25,
//       show: false
//     },
//     top: {
//       size: 50,
//       show: true
//     },
//   }
// },
// {
//   color,
//   rotation: {
//     x: 0,
//     y: 0,
//     z: 0,
//     translate: -5
//   },
//   position: {
//     top: 29
//   },
//   height: 0,
//   width: 0,
//   border: {
//     left: {
//       size: 25,
//       show: false
//     },
//     right: {
//       size: 25,
//       show: false
//     },
//     top: {
//       size: 50,
//       show: true
//     },
//   }
// }
//   ]
// }
