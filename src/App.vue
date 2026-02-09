<script setup lang="ts">
import { ref } from 'vue'
import ViewportBabylon, { type Shape } from './Components/ViewportBabylon.vue'
import EditorPanel from './Components/EditorPanel.vue'

const shape = ref<Shape>('box')
const color = ref('#4f46e5')

function onImportModel() {
  // pour l’instant placeholder
  console.log('import model clicked')
  // prochaine étape: IPC open dialog + path -> Babylon loader
}
</script>

<template>
  <div class="min-h-screen p-8 space-y-6">
    <div class="h-[70vh] rounded-2xl overflow-hidden bg-slate-900">
      <ViewportBabylon :shape="shape" :color="color" />
    </div>

    <EditorPanel
      :shape="shape"
      :color="color"
      @update:shape="shape = $event"
      @update:color="color = $event"
      @import-model="onImportModel"
    />
  </div>
</template>
