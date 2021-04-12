import {
  BranchOptions,
  Control,
  ControlList,
  GrowBorder,
  GrowBranch,
  GrowLeaf,
  GrowLeafCluster,
  GrowPlant,
  GrowShape,
  LeafClusterOptions,
  LeafOptions,
  LeafTextureValues,
  NestedControl,
  PlantOptions,
  Rotation
} from "@/store/interfaces"
import { Position } from "vue-router/types/router"

const plantOptionsControls: ControlList<PlantOptions> = [
  {
    property: "height",
    text: "Height",
    dataType: "number"
  },
  {
    property: "spread",
    text: "Spread",
    dataType: "number"
  },
  {
    property: "flowerColors",
    text: "Flower Colors",
    dataType: "color-list"
  },
  {
    property: "leafColors",
    text: "Leaf Colors",
    dataType: "color-list"
  },
  {
    property: "leafTexture",
    text: "Leaf Texture",
    dataType: "dropdown",
    options: LeafTextureValues
  }
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
    property: "rotation",
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number"
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number"
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number"
      },
      {
        property: "translate",
        text: "Z translate (depth)",
        dataType: "number"
      }
    ]
  },
  {
    property: "position",
    text: "Position",
    children: [
      {
        property: "x",
        text: "Left distance",
        dataType: "number"
      },
      {
        property: "y",
        text: "Top distance",
        dataType: "number"
      }
    ]
  },
  {
    property: "zIndex",
    text: "Z-Index",
    dataType: "number"
  }
]

const branchControls: ControlList<GrowBranch> = [
  // {
  //   property: "branchHeight",
  //   text: "Height",
  //   dataType: "number"
  // },
  {
    property: "zIndex",
    text: "Z-Index",
    dataType: "number"
  }
]

const branchOptionsControls: ControlList<BranchOptions> = [
  {
    property: "branchHeight",
    text: "Height",
    dataType: "number"
  },
  {
    property: "branchWidth",
    text: "Width",
    dataType: "number"
  },
  {
    property: "angle",
    text: "Angle",
    dataType: "number"
  }
]

const leafClusterControls: ControlList<GrowLeafCluster, Rotation> = [
  {
    property: "rotation",
    text: "Rotation",
    children: [
      {
        property: "x",
        text: "X axis",
        dataType: "number"
      },
      {
        property: "y",
        text: "Y axis",
        dataType: "number"
      },
      {
        property: "z",
        text: "Z axis (tilt)",
        dataType: "number"
      }
    ]
  },
  {
    property: "zIndex",
    text: "Z-Index",
    dataType: "number"
  }
]

const leafClusterOptionsControls: ControlList<LeafClusterOptions> = [
  {
    property: "colors",
    text: "Leaf Colors",
    dataType: "color-list"
  },
  {
    property: "texture",
    text: "Leaf Texture",
    dataType: "dropdown",
    options: LeafTextureValues
  },
  {
    property: "spacing",
    text: "Gap between leaves",
    dataType: "number"
  },
  {
    property: "sides",
    text: "Leaves in cluster",
    dataType: "number"
  },
  {
    property: "area",
    text: "Cluster area",
    dataType: "number"
  }
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
    dataType: "color"
  },
  {
    property: "topHeight",
    text: "Top height of leaf",
    dataType: "number"
  },
  {
    property: "bottomHeight",
    text: "Bottom height of leaf",
    dataType: "number"
  }
]

export default {
  plantOptionsControls,
  plantControls,
  branchControls,
  branchOptionsControls,
  leafClusterControls,
  leafClusterOptionsControls,
  // allLeafOptionsControls,
  leafOptionsControls
}
