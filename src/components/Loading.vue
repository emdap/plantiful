<template>
  <div
    class="text-sm text-center font-semibold text-green-700 dark:text-yellow-600 bg-opacity-70 p-5"
  >
    <div class="lds-spinner">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
    <span v-if="loadingText.length" class="bg-white dark:bg-transparent ml-2">{{
      loadingText
    }}</span>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { Prop } from "vue-property-decorator"

@Component({})
export default class App extends Vue {
  @Prop({ default: "" }) loadingText!: string
}
</script>

<style src="../assets/styles/loadingSpinner.css"></style>
