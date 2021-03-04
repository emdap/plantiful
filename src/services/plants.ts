import api, { resolve } from "@/services/api"
import { PlantListResponse, PlantResponse } from "@/store/interfaces"

// TODO: response types
export const listPlants = (
  page: number,
  filter: string
): Promise<PlantListResponse> =>
  api.get(`/api/v1/plants?page=${page}${filter}`).then(resolve)

export const searchPlants = (
  page: number,
  filter: string
): Promise<PlantResponse> =>
  api.get(`/api/v1/plants/search?page=${page}${filter}`).then(resolve)

export const getPlant = (id: number): Promise<PlantResponse> =>
  api.get(`api/v1/plants/${id}`).then(resolve)

export const getLink = (
  link: string
): Promise<PlantListResponse | PlantResponse> => api.get(link).then(resolve)
