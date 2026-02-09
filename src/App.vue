<script setup lang="ts">
import { ref } from 'vue'
import ViewportBabylon, { type Shape } from './Components/ViewportBabylon.vue'
import EditorPanel from './Components/EditorPanel.vue'

/**
 * Single source of truth:
 * App owns the editor state, and passes it down to children via props.
 */
const shape = ref<Shape>('box')
const color = ref('#4f46e5')

const viewport = ref<InstanceType<typeof ViewportBabylon> | null>(null)
const hasImportedModel = ref(false)

async function onImportModel() {
  const path = await window.api.openModelDialog()
  if (!path) return

  await viewport.value?.loadModel(path)
  hasImportedModel.value = true
}

function onResetToPrimitive() {
  viewport.value?.resetToPrimitives()
  hasImportedModel.value = false
}
</script>

<template>
  <div class="min-h-screen p-8 space-y-6">
    <div class="h-[70vh] rounded-2xl overflow-hidden bg-slate-900">
      <ViewportBabylon ref="viewport" :shape="shape" :color="color" />
    </div>

    <EditorPanel
      :shape="shape"
      :color="color"
      :has-imported-model="hasImportedModel"
      @update:shape="shape = $event"
      @update:color="color = $event"
      @import-model="onImportModel"
      @reset-to-primitive="onResetToPrimitive"
    />
  </div>
</template>
