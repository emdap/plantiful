import {
  BranchOptions,
  ControlList,
  GrowBranch,
  GrowPlant,
  LeafOptions,
  LeafTextureValues,
  PlantOptions,
  Rotation,
  GrowLeafCluster,
  LeafClusterOptions,
  FlowerOptions,
  PetalOptions,
  GrowFlower,
} from "@/store/interfaces"
import { Position } from "vue-router/types/router"

const plantOptionsControls: ControlList<PlantOptions> = [
  {
    property: "height",
    text: "Height",
    dataType: "number",
    verify: {
      upperBound: 800,
      lowerBound: 1,
    },
  },
  {
    property: "spread",
    text: "Spread",
    dataType: "number",
    verify: {
      upperBound: 900,
      lowerBound: 1,
    },
  },
  {
    property: "leafTexture",
    text: "Leaf Texture",
    dataType: "dropdown",
    options: LeafTextureValues,
  },
  {
    property: "leafColors",
    text: "Leaf Colors",
    dataType: "color-list",
  },
  {
    property: "flowerColors",
    text: "Flower Colors",
    dataType: "color-list",
  },
  // comment in below once growPlant actually uses them!
  // {
  //   property: "orientation",
  //   text: "Orientation",
  //   dataType: "dropdown",
  //   options: PlantOrientationValues ?
  // },
  // {
  //   property: "leafDensity",
  //   text: "Leaf Density",
  //   dataType: "dropdown",
  //   options: ?
  // },
]

const plantControls: ControlList<GrowPlant, Rotation & Position> = [
  {
    property: "zIndex",
    text: "Stack Order",
    dataType: "number",
  },
  {
    property: "position",
    text: "Position",
    children: [
      {
        property: "x",
        text: "Left distance",
        dataType: "number",
      },
      {
        property: "y",
        text: "Top distance",
        dataType: "number",
      },
    ],
  },
  {
    property: "rotation",
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number",
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number",
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number",
      },
      {
        property: "translate",
        text: "Z translate (depth)",
        dataType: "number",
      },
    ],
  },
]

const branchControls: ControlList<GrowBranch> = [
  // {
  //   property: "branchHeight",
  //   text: "Height",
  //   dataType: "number"
  // },
  {
    property: "zIndex",
    text: "Stack Order",
    dataType: "number",
  },
]

const branchOptionsControls: ControlList<BranchOptions> = [
  {
    property: "branchHeight",
    text: "Height",
    dataType: "number",
    verify: {
      upperBound: 900,
      lowerBound: 0,
    },
  },
  {
    property: "branchWidth",
    text: "Width",
    dataType: "number",
    verify: {
      upperBound: 20,
      lowerBound: 1,
    },
  },
  {
    property: "angle",
    text: "Angle",
    dataType: "number",
    verify: {
      upperBound: 90,
      lowerBound: -90,
    },
  },
]

const leafClusterControls: ControlList<GrowLeafCluster, Rotation> = [
  {
    property: "zIndex",
    text: "Stack Order",
    dataType: "number",
  },
  {
    property: "rotation",
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number",
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number",
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number",
      },
    ],
  },
]

const leafClusterOptionsControls: ControlList<LeafClusterOptions> = [
  {
    property: "colors",
    text: "Leaf Colors",
    dataType: "color-list",
  },
  {
    property: "texture",
    text: "Leaf Texture",
    dataType: "dropdown",
    options: LeafTextureValues,
  },
  {
    property: "spacing",
    text: "Gap between leaves",
    dataType: "number",
  },
  {
    property: "sides",
    text: "Leaves in cluster",
    dataType: "number",
  },
  {
    property: "area",
    text: "Cluster area",
    dataType: "number",
    verify: {
      upperBound: 360,
      lowerBound: 0,
    },
  },
]

const flowerOptionsControls: ControlList<FlowerOptions> = [
  {
    property: "colors",
    text: "Flower Colors",
    dataType: "color-list",
  },
  {
    property: "spacing",
    text: "Gap between petals",
    dataType: "number",
  },
  {
    property: "sides",
    text: "Petals in flower",
    dataType: "number",
  },
  {
    property: "area",
    text: "Flower area",
    dataType: "number",
    verify: {
      upperBound: 360,
      lowerBound: 0,
    },
  },
]

const flowerControls: ControlList<GrowFlower, Rotation> = [
  {
    property: "zIndex",
    text: "Stack Order",
    dataType: "number",
  },
  {
    property: "color",
    text: "Flower center color",
    dataType: "color",
  },
  {
    property: "rotation",
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number",
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number",
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number",
      },
    ],
  },
]

// const allLeafOptionsControls: ControlList<LeafOptions> = [
//   {
//     property: "topHeight",
//     text: "Top height of leaf",
//     dataType: "number"
//   },
//   {
//     property: "bottomHeight",
//     text: "Bottom height of leaf",
//     dataType: "number"
//   }
// ]

const leafOptionsControls: ControlList<LeafOptions> = [
  {
    property: "color",
    text: "Color",
    dataType: "color",
  },
  {
    property: "topHeight",
    text: "Top height of leaf",
    dataType: "number",
  },
  {
    property: "bottomHeight",
    text: "Bottom height of leaf",
    dataType: "number",
  },
]

const petalOptionsControls: ControlList<PetalOptions> = [
  {
    property: "color",
    text: "Color",
    dataType: "color",
  },
  // disabled until can fix this from messing up cluster position
  // {
  //   property: "height",
  //   text: "Height of petal",
  //   dataType: "number"
  // },
]

const specialPlantControls = [
  {
    text: "Convert all leaves to flowers",
    code: "convert-leaves",
  },
  {
    text: "Convert all flowers to leaves",
    code: "convert-flowers",
  },
]

export default {
  plantOptionsControls,
  plantControls,
  branchControls,
  branchOptionsControls,
  leafClusterControls,
  leafClusterOptionsControls,
  // allLeafOptionsControls,
  leafOptionsControls,
  flowerControls,
  flowerOptionsControls,
  petalOptionsControls,
  specialPlantControls,
}
