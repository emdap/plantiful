export const gardenMessages = {
  activePlant: {
    info: "Search & select a plant to see more information",
    loading: "Researching plant",
    error:
      "Sorry, this plant has incomplete information, and cannot be displayed. Please select another.",
  },
  searchBar: {
    placeholder: "Search for a specific plant, or leave blank to retrieve all",
    loading: "Loading plants",
    empty: "No plants matching your search were found",
    error: "An unexpected error occurred, please try searching again.",
  },
  pageNav: {
    error: "invalid, please try again",
  },
  apiError: "API Error:",
  noImage: "No image available",
}

export const gridMessages = {
  registerError:
    "Widget missing initWidgetState prop, or prop has no 'name' field! Cannot render.",
  nameError: "Widgets must have a name to be registered.",
  iconTitles: {
    dock: "Dock widget",
    unDock: "Un-dock widget",
    swap: "Swap zone",
    move: "Move widget",
    close: "Close widget",
    resize: "Adjust size",
  },
  dividerTitle: "Drag to adjust overall width",
  generalError: "Something unexpected happened, try reloading the page",
}

export const growMessages = {
  noActiveEntity: "No active entity, please select a plant first",
  generalError: "Something unexpected happened, try reloading the page",
  openSearch: "Open up Plant Search to find & grow plants",
}

export const selectMessages = {
  noParentSelected: {
    leaves: "Select a Leaf Cluster first",
    petals: "Select a Flower first",
  },
  noPlantSelected: "Select a Plant to start",
  noPlants: "Create a plant first",
  default: "Select a ",
  noDelete: "No plant to delete",
}

export const controlMessages = {
  colorError:
    "Not a valid color name. Please try again, or use the color picker",
  upperBoundError: "Cannot exceed upper bound of ",
  lowerBoundError: "Cannot exceed lower bound of ",
  placeholder: "Loading ...",
}
