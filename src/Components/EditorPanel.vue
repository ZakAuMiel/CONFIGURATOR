<script setup lang="ts">
export type Shape = 'box' | 'cylinder' | 'sphere' | 'pyramid'

const props = defineProps<{
  shape: Shape
  color: string
  hasImportedModel?: boolean
  selectedMesh?: {
    name: string
    vertices: number
    material: string
  } | null
}>()

/**
 * We emit "intentions" only:
 * - update:shape / update:color: user changed editor values
 * - import-model: user clicked import (parent decides what to do)
 */
const emit = defineEmits<{
  (e: 'update:shape', value: Shape): void
  (e: 'update:color', value: string): void
  (e: 'import-model'): void
  (e: 'reset-to-primitive'): void
}>()
</script>

<template>
  <div class="rounded-2xl border p-4 flex items-center gap-6">
    <div class="flex items-center gap-3">
      <label class="text-sm font-medium">Shape</label>
      <select
        :value="props.shape"
        class="border rounded-lg px-3 py-2"
        :disabled="props.hasImportedModel"
        @change="emit('update:shape', ($event.target as HTMLSelectElement).value as Shape)"
      >
        <option value="box">Cube</option>
        <option value="cylinder">Cylinder</option>
        <option value="sphere">Sphere</option>
        <option value="pyramid">Pyramid</option>
      </select>
      <span v-if="props.hasImportedModel" class="text-xs text-gray-500">
        (disabled while imported model is active)
      </span>
    </div>

    <div class="flex items-center gap-3">
      <label class="text-sm font-medium">Color</label>
      <input
        type="color"
        :value="props.color"
        class="h-10 w-14"
        :disabled="props.hasImportedModel"
        @input="emit('update:color', ($event.target as HTMLInputElement).value)"
      />
      <span class="text-sm text-gray-500">{{ props.color }}</span>
    </div>

    <div v-if="props.selectedMesh" class="mt-4 border-t pt-3 text-sm">
  <div class="font-semibold">Selected Mesh</div>
  <div>Name: {{ props.selectedMesh.name }}</div>
  <div>Vertices: {{ props.selectedMesh.vertices }}</div>
  <div>Material: {{ props.selectedMesh.material }}</div>
</div>


    <div class="flex-1"></div>

    <button class="border rounded-lg px-4 py-2" @click="emit('import-model')">
      Import 3D model
    </button>

    <button
      class="border rounded-lg px-4 py-2"
      :disabled="!props.hasImportedModel"
      @click="emit('reset-to-primitive')"
    >
      Back to primitives
    </button>
  </div>
</template>
