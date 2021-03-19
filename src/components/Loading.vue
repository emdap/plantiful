<template>
  <div>
    <!-- TODO: Add a pretty loader and get rid of ... -->
    {{ loadingText }} ...
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

<style scoped></style>
