import {
  Module,
  VuexModule,
  getModule,
  Action,
  Mutation
} from "vuex-module-decorators"
import store from "@/store"
import {
  Plant,
  PlantSnippet,
  PlantListResponse,
  PageLinks,
  SearchPlantsPayload,
  PageLinkKey
} from "@/store/interfaces"
import { listPlants, getPlant, getLink, searchPlants } from "@/services/plants"

@Module({
  dynamic: true,
  namespaced: true,
  name: "garden",
  store
})
class GardenModule extends VuexModule {
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
  // TODO: submitted issue - Trefle docs say 30 results per page, but really there's only 20..?
  readonly resultsPerPage: number = 20

  @Action
  public async getPlantList(payload: SearchPlantsPayload, newSearch: boolean) {
    let apiFunc: (payload: SearchPlantsPayload) => Promise<PlantListResponse>
    // different API endpoint if user has a search query (?q="onion")
    if (payload.query.length) {
      apiFunc = searchPlants
    } else {
      apiFunc = listPlants
    }

    if (newSearch) this.CLEAR_PAGE_CACHE()

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
  public async getOnePlant(id: number) {
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
  public async getPageByLink(payload: { page: number; apiLink: string }) {
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
  public CACHE_PAGE(payload: { page: number; pageData: PlantListResponse }) {
    this.pageCache[payload.page] = payload.pageData
  }

  @Mutation
  public CLEAR_PAGE_CACHE() {
    this.pageCache = {}
  }

  @Mutation
  public CACHE_PLANT(plant: Plant) {
    this.plantCache[plant.id] = plant as Plant
  }

  @Mutation
  public SET_LOADING(payload: {
    which: "plantList" | "plant"
    loading: boolean
  }) {
    this.loading[payload.which] = payload.loading
  }

  @Mutation
  public PLANT_LIST_SUCCESS(payload: {
    page: number
    pageData: PlantListResponse
  }) {
    const { page, pageData } = payload
    this.currentPage = page
    this.plantList = pageData.data
    this.pageLinks = pageData.links
    // technically only need to send this if its a new search
    this.lastPage = Math.ceil(pageData.meta.total / this.resultsPerPage)
  }

  @Mutation
  public SET_ACTIVE_PLANT(plant: Plant) {
    this.activePlant = plant
  }

  @Mutation
  public RESET_ACTIVE_PLANT() {
    this.activePlant = null
  }

  private API_ERROR(error: Error) {
    // TODO: do something with the error, a pop up or something, + add to state
    console.error(error)
  }
}

export default getModule(GardenModule)