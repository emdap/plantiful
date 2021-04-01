import { create, ApiResponse, ApiErrorResponse, ApiOkResponse } from "apisauce"
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
    // TODO: type
    const tokenResponse = (await tokenAPI.get("/jwt")) as ApiResponse<any>
    JWT = tokenResponse.data.token
  }
  request.headers.Authorization = `Bearer ${JWT}`
})

export const resolve = <S, E>(response: ApiResponse<S, E>): any => {
  if (response.ok) {
    return response.data
  } else {
    // TODO -- handle 401s here
    throw "error"
  }
}

export default plantAPI
