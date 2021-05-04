<template>
  <div v-if="showWarning" class="w-1/2 mx-auto border-1 p-3">
    <h1>Important</h1>
    <p>{{ mainMessage }}</p>
    <p class="mt-1">
      {{ widget == "active-plant" ? activePlantMessage : searchMessage }}
    </p>
    <button
      class="block mx-auto mt-2 px-5 btn-light dark:btn-dark"
      @click="showWarning = false"
    >
      Got it!
    </button>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { Prop } from "vue-property-decorator"

@Component({})
export default class TrefleWarning extends Vue {
  @Prop({ required: true }) widget!: "active-plant" | "search"
  public showWarning = true

  public mainMessage =
    "Unfortunately, the Trefle API has been discontinued. The only data returned here is from sample data grabbed from the Trefle docs. If/when it comes back or is re-hosted, this will be updated."

  public activePlantMessage =
    "The data in this box will remain the same no matter what plant is selected. In the past, this window updated by querying Trefle with the selected plant's id."
  public searchMessage =
    "The search bar no longer impacts the results, clicking on a plant will always bring up the same plant, and most of the images are dead links."
}
</script>
