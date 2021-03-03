export interface FilterParams {
  filter?: Filter
  filter_not?: Filter
}

export interface Filter {
  [key: string]: string[]
}

export type FilterType = "filter" | "filter_not"

export type PageLinkKey = "first" | "prev" | "next" | "last"

export type PageLinks = {
  [key in PageLinkKey]: string
}
