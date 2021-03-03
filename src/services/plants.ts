import api, { resolve } from "@/services/api"

// TODO: response types
export const listPlants = (page: number, filter: string): any =>
  api.get(`/api/v1/plants?page=${page}${filter}`).then(resolve)

export const searchPlants = (page: number, filter: string): any =>
  api.get(`/api/v1/plants/search?page=${page}${filter}`).then(resolve)

export const getPlant = (id: number): any =>
  api.get(`api/v1/plants/${id}`).then(resolve)

export const getLink = (link: string): any => api.get(link).then(resolve)
