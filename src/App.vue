<!-- src/App.vue -->
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

// Keep track of the last Blob URL to avoid leaking memory when re-importing.
let lastBlobUrl: string | null = null

/**
 * Import a GLB from the OS, then load it in Babylon.
 *
 * Why Blob URLs?
 * - In dev, the renderer is served from http://localhost (webpack dev server).
 * - Loading file:/// paths is blocked by the browser security model.
 * - We read the file bytes in the main process, send them via IPC, then create a Blob URL here.
 *
 * Note:
 * - TypeScript can complain when passing Uint8Array directly as a BlobPart (SharedArrayBuffer typing).
 * - To keep TS happy and be safe, we convert to a plain ArrayBuffer slice.
 */
async function onImportModel() {
  const file = await window.api.openModelDialog()
  if (!file) return

  const data = file.data instanceof Uint8Array ? file.data : new Uint8Array(file.data)
  const ab = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer

  const glbFile = new File([new Uint8Array(ab)], file.name, { type: 'model/gltf-binary' })

  await viewport.value?.loadModel(glbFile)
  hasImportedModel.value = true
}


function onResetToPrimitive() {
  viewport.value?.resetToPrimitives()
  hasImportedModel.value = false

  // Optional: revoke blob URL on reset
  if (lastBlobUrl) {
    URL.revokeObjectURL(lastBlobUrl)
    lastBlobUrl = null
  }
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
