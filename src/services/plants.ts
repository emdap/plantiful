import api, { resolve } from "@/services/api"

// TODO: response types
export const listPlants = (page = 1): any =>
  api.get(`/api/v1/plants?page=${page}`).then(resolve)

export const getPlant = (id: number): any =>
  api.get(`api/v1/plants/${id}`).then(resolve)
