import { Plant } from "@/store/interfaces";

export const TEST_PLANT: Plant = {
  // I modified this
  id: 137442,
  common_name: "Dream plant",
  scientific_name: "Holcus lanatus",
  main_species_id: 143075,
  image_url:
    "https://bs.plantnet.org/image/o/46619775d4319328b2fad6f1ba876ccca2d03534",
  family_common_name: "Grass family",
  family: "Poaceae",
  main_species: {
    id: 143075,
    common_name: "Default Plant",
    scientific_name: "Holcus lanatus",
    family_common_name: "Grass family",
    image_url:
      "https://bs.plantnet.org/image/o/46619775d4319328b2fad6f1ba876ccca2d03534",
    flower: { color: ["orangered"] },
    foliage: { texture: "fine", color: ["teal", "seagreen", "palevioletred"] },
    specifications: {
      average_height: { cm: 250 },
      shape_and_orientation: "Erect"
    },
    growth: { spread: { cm: 70 } },
    family: "Poaceae"
  }
}