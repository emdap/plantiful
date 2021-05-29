<template>
  <div
    class="h-screen w-screen absolute top-0 left-0 z-50 bg-gray-50 dark:bg-gray-800 bg-opacity-70"
  >
    <div
      class="mx-auto mt-10 bg-white dark:bg-gray-500 rounded-md border-1 dark:border-gray-800 h-1/2 w-1/2 overflow-auto scrollbar-light dark:scrollbar-dark shadow-lg"
    >
      <div class="h-full flex flex-col pt-8">
        <h1 class="sticky top-0 text-center px-6 bg-white dark:bg-gray-500">
          <!-- {{ header }} -->
          Delete oldest plant
        </h1>
        <p class="p-8 border-b-1 dark:border-gray-800 flex-grow">
          <!-- {{ body }} -->
          There are too many plants already present to grow a new plant.
          Continuing to grow a new plant will delete the oldest plant first.
        </p>
        <footer
          class="sticky bottom-0 flex justify-end p-4 bg-white dark:bg-gray-500"
        >
          <!-- <button v-for="(button, index) in buttons" :key="index" class="btn-light dark:btn-dark" @click="$emit(button.emit)">
            {{ button.text }}
          </button> -->
          <button
            class="btn-light dark:btn-dark mr-3 px-4"
            @click="$emit('continue')"
          >
            Ok
          </button>
          <button class="btn-cancel" @click="$emit('close')">
            Cancel
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import Component from "vue-class-component"
// import { Prop } from "vue-property-decorator"

// export type ModalButton = {
//   text: string
//   emit: string
// }

@Component({})
export default class Modal extends Vue {
  // don't need this yet, only using in one place
  // @Prop({required: true}) header!: string
  // @Prop({required: true}) body!: string
  // @Prop({default: []}) buttons!: ModalButton[]
}
</script>
