<template>
  <div id="page-nav">
    <button
      v-for="(page, index) in pageButtons"
      :key="`page-button-${index}`"
      :disabled="disablePageButton(page.nav)"
      @click="iteratePage(page.nav)"
      :class="
        plantListLoading
          ? 'text-gray-300 dark:text-gray-600'
          : 'text-green-800 dark:text-yellow-600'
      "
      class="transition-text text-sm font-medium focus:outline-none  tracking-normal hover:tracking-wide hover:text-purple-700 dark:hover:text-yellow-500 dark:btn-dark-transparent"
    >
      {{ page.text }}
    </button>
    <!-- TODO: display page numbers inbetween text nav, like 'prev page' 1 2 3 4 'next page' etc -->
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
      // TODO: handle error
      console.error("no link for", link)
    }
  }
}
</script>
