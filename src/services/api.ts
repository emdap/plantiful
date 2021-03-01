import { create, ApiResponse } from "apisauce"
import { AxiosRequestConfig } from "axios"

const PLANT_API = process.env.VUE_APP_PLANT_API
const TOKEN_API = process.env.VUE_APP_TOKEN_API
let JWT!: string

const plantAPI = create({
  baseURL: PLANT_API,
  headers: { "content-type": "application/json" }
})

const tokenAPI = create({
  baseURL: TOKEN_API,
  headers: { "content-type": "application/json" }
})

plantAPI.addAsyncRequestTransform(async (request: AxiosRequestConfig) => {
  // initialize token
  if (!JWT) {
    const tokenResponse = (await tokenAPI.get("/jwt")) as ApiResponse<any>
    JWT = tokenResponse.data.token
  }
  request.headers.Authorization = `Bearer ${JWT}`
})

export const resolve = (response: ApiResponse<any>): any => {
  if (response.ok) {
    return response.data
  }
}

export default plantAPI
