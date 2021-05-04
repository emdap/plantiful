export const gardenMessages = {
  activePlant: {
    info: "Click on a plant name to see more information",
    loading: "Researching plant",
    error:
      "Sorry, this plant has incomplete information, and cannot be displayed. Please select another."
  },
  searchBar: {
    placeholder: "Search for a specific plant, or leave blank to retrieve all",
    loading: "Loading plants",
    empty: "No plants matching your search were found",
    error: "An unexpected error occurred, please try searching again."
  }
}

export const widgetMessages = {
  registerError:
    "Widget missing initWidgetState prop, or prop has no 'name' field! Cannot render.",
  nameError: "Widgets must have a name to be registered."
}

export const growMessages = {
  missingGrowData: "Must supply component with prop growData! Cannot render.",
  missingEntityData:
    "Must supply component with prop entityData! Cannot render."
}
