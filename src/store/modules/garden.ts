import Vue from "vue"
import { Module, VuexModule, Action, Mutation } from "vuex-module-decorators"
import store from "@/store"
import {
  Plant,
  PlantSnippet,
  PlantListResponse,
  PageLinks,
  PlantListPayload,
  GardenState,
  CustomGrowPlant,
  // PageLinkPayload,
} from "@/store/interfaces"
// import { listPlants, getPlant, getLink, searchPlants } from "@/services/plants"
import { listSample, plantSample } from "@/fixtures/SampleResponses"

@Module({
  dynamic: true,
  namespaced: true,
  name: "garden",
  store,
})
export default class GardenModule extends VuexModule implements GardenState {
  plantList: PlantSnippet[] = []
  pageLinks: PageLinks = {}
  activePlant: Plant | null = null
  currentPage = -1
  lastPage = -1
  pageCache: Record<number, PlantListResponse> = {}
  plantCache: Record<number | string, Plant> = {}
  loading = {
    plantList: false,
    plant: false,
  }
  readonly resultsPerPage: number = 20

  @Action
  async getPlantList(payload: PlantListPayload) {
    // let apiFunc: (payload: PlantListPayload) => Promise<PlantListResponse>
    // different API endpoint if user has a search query (?q="onion")

    // API no longer exists :(
    // if (payload.query.length) {
    //   apiFunc = searchPlants
    // } else {
    //   apiFunc = listPlants
    // }

    if (payload.newSearch) {
      this.CLEAR_PAGE_CACHE()
    }

    let pageData!: PlantListResponse
    if (this.pageCache[payload.page]) {
      pageData = this.pageCache[payload.page]
    } else {
      this.SET_LOADING({ which: "plantList", loading: true })
      try {
        // API no longer exists
        // pageData = await apiFunc(payload)
        pageData = listSample
        this.CACHE_PAGE({ page: payload.page, pageData })
      } catch (error) {
        this.API_ERROR(error)
      } finally {
        this.SET_LOADING({ which: "plantList", loading: false })
      }
    }
    if (pageData) this.PLANT_LIST_SUCCESS({ page: payload.page, pageData })
  }

  @Action
  async getOnePlant(id: number) {
    let plant!: Plant

    if (this.plantCache[id]) {
      plant = this.plantCache[id]
    } else {
      this.SET_LOADING({ which: "plant", loading: true })
      try {
        // const plantResponse = await getPlant(id)
        plant = plantSample
        this.CACHE_PLANT(plant)
      } catch (error) {
        this.API_ERROR(error)
      } finally {
        this.SET_LOADING({ which: "plant", loading: false })
      }
    }

    if (plant) this.SET_ACTIVE_PLANT(plant)
  }

  @Action
  clearPlantList() {
    this.CLEAR_PLANT_LIST()
    this.CLEAR_PAGE_CACHE()
  }

  @Action
  newCustomPlant(basePlant: CustomGrowPlant): Promise<Plant> {
    const blankFields = {
      id: 0,
      main_species_id: "",
      scientific_name: "",
      family_common_name: "",
      family: "",
      image_url: "",
    }

    const plant: Plant = {
      ...blankFields,
      common_name: basePlant.name,
      main_species: {
        ...blankFields,
        common_name: basePlant.name,
        specifications: {
          shape_and_orientation: "",
          average_height: { cm: basePlant.height },
        },
        growth: {
          spread: {
            cm: basePlant.spread,
          },
        },
        flower: {
          color: basePlant.flowerColors,
        },
        foliage: {
          color: basePlant.leafColors,
          texture: basePlant.leafTexture,
        },
      },
    }

    return this.addGrowPlant(plant)
  }

  // TODO: see comment in grow.ts line 297
  // @Action
  // newPlantSpecies(payload: {id: number, newName: string}): Promise<Plant> {
  //   // used when renaming an already-grown plant
  //   const { id, newName } = payload
  //   const existingPlant = this.plantCache[id]

  //   const newPlant = {
  //     ...existingPlant,
  //     main_species: {
  //       ...existingPlant.main_species,
  //       scientific_name: existingPlant.scientific_name.length ? existingPlant.scientific_name : existingPlant.common_name,
  //       common_name: newName,
  //     }
  //   }

  //   return this.addGrowPlant(newPlant)
  // }

  @Action
  addGrowPlant(plant: Plant): Promise<Plant> {
    const nextKey =
      Math.max(
        0,
        ...Object.values(this.plantCache).map(plant => {
          return plant.id
        })
      ) + 1
    // is ok if this is duplicate, the id on Plants is not used -- see comment line 152
    plant.id = nextKey
    plant.main_species_id = "grow-" + nextKey
    this.CACHE_PLANT(plant)
    return Promise.resolve(plant)
  }

  // no API :(
  // @Action
  // async getPageByLink(payload: PageLinkPayload) {
  //   const { page, apiLink } = payload
  //   let pageData!: PlantListResponse
  //   this.SET_LOADING({ which: "plantList", loading: true })

  //   if (this.pageCache[page]) {
  //     pageData = this.pageCache[page]
  //   } else {
  //     try {
  //       pageData = await getLink(apiLink)
  //       this.CACHE_PAGE({ page, pageData })
  //     } catch (error) {
  //       this.API_ERROR(error)
  //     }
  //   }
  //   if (pageData) {
  //     this.PLANT_LIST_SUCCESS({ page, pageData })
  //   }
  //   this.SET_LOADING({ which: "plantList", loading: false })
  // }

  @Mutation
  CACHE_PAGE(payload: { page: number; pageData: PlantListResponse }) {
    this.pageCache[payload.page] = payload.pageData
  }

  @Mutation
  CLEAR_PAGE_CACHE() {
    this.pageCache = {}
  }

  @Mutation
  CACHE_PLANT(plant: Plant) {
    // confusing in API: when searching list of plants, plants returned have id property (id1)
    // when searching ONE plant, plant returned has id property (id2), and main_species_id property (id3)
    // id1 != id2, but id1 == id3
    // so saving in plantCache under id3, as that matches up with id1 that is searched when clicking on plant
    this.plantCache[plant.main_species_id] = plant as Plant
  }

  @Mutation
  SET_LOADING(payload: { which: "plantList" | "plant"; loading: boolean }) {
    this.loading[payload.which] = payload.loading
  }

  @Mutation
  PLANT_LIST_SUCCESS(payload: { page: number; pageData: PlantListResponse }) {
    const { page, pageData } = payload
    this.currentPage = page
    this.plantList = pageData.data
    this.pageLinks = pageData.links
    // technically only need to send this if its a new search
    this.lastPage = Math.ceil(pageData.meta.total / this.resultsPerPage)
  }

  @Mutation
  CLEAR_PLANT_LIST() {
    this.currentPage = -1
    this.plantList = []
    this.pageLinks = {}
    this.lastPage = -1
  }

  @Mutation
  SET_ACTIVE_PLANT(plant: Plant) {
    this.activePlant = plant
  }

  @Mutation
  RESET_ACTIVE_PLANT() {
    this.activePlant = null
  }

  @Action
  private API_ERROR(error: string) {
    Vue.toasted.error(error)
  }
}
