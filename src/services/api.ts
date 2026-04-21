import { ApiResponse, create } from "apisauce"

// const PLANT_API = process.env.VUE_APP_PLANT_API
// const TOKEN_API = process.env.VUE_APP_TOKEN_API
// let JWT!: JWTResponse

export const API_VERSION = "/api/v1"

const plantAPI = create({
  baseURL: `${process.env.VUE_APP_HOTPLANTS_URL}/trefle${API_VERSION}`,
  headers: { "content-type": "application/json" },
})

// const tokenAPI = create({
//   baseURL: TOKEN_API,
//   headers: { "content-type": "application/json" },
// })

// function expirationPassed(): boolean {
//   return JWT && new Date() > new Date(JWT.expiration)
// }

// plantAPI.addAsyncRequestTransform(async (request: AxiosRequestConfig) => {
//   // initialize token
//   if (!JWT || expirationPassed()) {
//     const tokenResponse = (await tokenAPI.get(
//       "/jwt"
//     )) as ApiResponse<JWTResponse>
//     if (tokenResponse.ok && tokenResponse.data) {
//       JWT = tokenResponse.data
//     } else {
//       throw tokenResponse.originalError
//     }
//   }
//   request.headers.Authorization = `Bearer ${JWT.token}`
// })

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
export const resolve = <S, E>(response: ApiResponse<S, E>): any => {
  if (response.ok) {
    return response.data
  } else {
    throw response.originalError
  }
}

export default plantAPI
