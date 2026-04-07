import api, { resolve } from "@/services/api"
import {
  PlantListPayload,
  PlantListResponse,
  PlantResponse,
} from "@/store/interfaces"

export const listPlants = (
  payload: PlantListPayload
): Promise<PlantListResponse> =>
  api.get(`/plants?page=${payload.page}${payload.filter}`).then(resolve)

export const searchPlants = (
  payload: PlantListPayload
): Promise<PlantListResponse> =>
  api
    .get(
      `/plants/search?q=${payload.query}&page=${payload.page}${payload.filter}`
    )
    .then(resolve)

export const getPlant = (id: number): Promise<PlantResponse> =>
  api.get(`/plants/${id}`).then(resolve)

export const getLink = <T>(link: string): Promise<T> =>
  api.get(link).then(resolve)
