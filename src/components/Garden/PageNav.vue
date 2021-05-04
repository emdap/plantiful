<template>
  <div id="page-nav">
    <div
      :class="
        plantListLoading
          ? 'text-gray-300 dark:text-gray-600'
          : 'text-green-800 dark:text-yellow-600'
      "
    >
      Page {{ currentPage }} of {{ lastPage }}
    </div>
    <button
      v-for="(page, index) in pageButtons"
      :key="`page-button-${index}`"
      @click="iteratePage(page.nav)"
      :class="[
        plantListLoading || disablePageButton(page.nav)
          ? 'text-gray-300 dark:text-gray-600 cursor-wait'
          : 'text-green-800 dark:text-yellow-600 hover:tracking-wide hover:text-purple-700 dark:hover:text-yellow-500',
        disablePageButton(page.nav) ? 'cursor-not-allowed' : '',
      ]"
      class="transition-text text-sm font-medium focus:outline-none tracking-normal dark:btn-dark-transparent"
    >
      {{ page.text }}
    </button>
  </div>
</template>

<script lang="ts">
import Component from "vue-class-component"
import pageButtons from "@/fixtures/PageButtons"
import GardenMixin, { garden } from "@/mixins/GardenMixin.vue"
import { PageLinkKey } from "@/store/interfaces"

@Component({})
export default class PageNav extends GardenMixin {
  public get pageButtons() {
    return pageButtons
  }

  public disablePageButton(nav: PageLinkKey): boolean {
    if ((nav == "prev" || nav == "first") && this.currentPage == 1) {
      return true
    }
    if ((nav == "next" || nav == "last") && this.lastPage == this.currentPage) {
      return true
    }
    return false
  }

  public iteratePage(link: PageLinkKey) {
    // Trefle provides direct links to specific pages, use that when possible instead of re-constructing query
    let page = this.currentPage
    switch (link) {
      case "prev":
        page--
        break
      case "next":
        page++
        break
      case "first":
        page = 1
        break
      case "last":
        page = this.lastPage
        break
    }
    const apiLink = this.pageLinks[link]
    if (apiLink) {
      garden.getPageByLink({ page, apiLink })
    } else {
      this.$toasted.error(`'${link}' ${this.gardenMessages.pageNav.error}`)
    }
  }
}
</script>
