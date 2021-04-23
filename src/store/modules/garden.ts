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
  PageLinkPayload
} from "@/store/interfaces"
import { listPlants, getPlant, getLink, searchPlants } from "@/services/plants"
import { gardenMessages } from "@/fixtures/Messages"

@Module({
  dynamic: true,
  namespaced: true,
  name: "garden",
  store
})
export default class GardenModule extends VuexModule implements GardenState {
  plantList: PlantSnippet[] = []
  pageLinks: PageLinks = {}
  activePlant: Plant | null = null
  currentPage = -1
  lastPage = -1
  pageCache: Record<number, PlantListResponse> = {}
  plantCache: Record<number, Plant> = {}
  loading = {
    plantList: false,
    plant: false
  }
  readonly resultsPerPage: number = 20

  @Action
  async getPlantList(payload: PlantListPayload) {
    let apiFunc: (payload: PlantListPayload) => Promise<PlantListResponse>
    // different API endpoint if user has a search query (?q="onion")
    if (payload.query.length) {
      apiFunc = searchPlants
    } else {
      apiFunc = listPlants
    }

    if (payload.newSearch) {
      this.CLEAR_PAGE_CACHE()
    }

    let pageData!: PlantListResponse
    if (this.pageCache[payload.page]) {
      pageData = this.pageCache[payload.page]
    } else {
      this.SET_LOADING({ which: "plantList", loading: true })
      try {
        pageData = await apiFunc(payload)
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
        const plantResponse = await getPlant(id)
        plant = plantResponse.data
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
  async getPageByLink(payload: PageLinkPayload) {
    const { page, apiLink } = payload
    let pageData!: PlantListResponse
    this.SET_LOADING({ which: "plantList", loading: true })

    if (this.pageCache[page]) {
      pageData = this.pageCache[page]
    } else {
      try {
        pageData = await getLink(apiLink)
        this.CACHE_PAGE({ page, pageData })
      } catch (error) {
        this.API_ERROR(error)
      }
    }
    if (pageData) {
      this.PLANT_LIST_SUCCESS({ page, pageData })
    }
    this.SET_LOADING({ which: "plantList", loading: false })
  }

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
