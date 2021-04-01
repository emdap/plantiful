<template>
  <div
    class="text-sm font-semibold text-green-700 bg-opacity-70 bg-white w-full p-5"
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
    {{ loadingText }}
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
import { Prop } from "vue-property-decorator"

@Component({})
export default class App extends Vue {
  @Prop({ default: "Loading" }) loadingText!: string
}
</script>

<style src="../assets/styles/loadingSpinner.css"></style>
