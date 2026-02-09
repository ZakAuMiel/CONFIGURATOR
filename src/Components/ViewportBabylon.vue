<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import {
  Engine,
  Scene,
  ArcRotateCamera,
  Vector3,
  HemisphericLight,
  Mesh,
  MeshBuilder,
  StandardMaterial,
  Color3,
  SceneLoader,
} from '@babylonjs/core'
import '@babylonjs/loaders'

export type Shape = 'box' | 'cylinder' | 'sphere' | 'pyramid'

const props = defineProps<{
  shape: Shape
  color: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)

let engine: Engine | null = null
let scene: Scene | null = null

// Primitive mesh created by editor (box/cylinder/...)
let primitiveMesh: Mesh | null = null

// Material used by primitives (color changes)
let primitiveMaterial: StandardMaterial | null = null

// Root mesh grouping imported model meshes (so we can dispose cleanly)
let importedRoot: Mesh | null = null

/**
 * Convert an OS path to (rootUrl, filename) for Babylon loaders.
 * Babylon expects rootUrl + fileName separately (especially in desktop contexts).
 */
function splitPath(fullPath: string) {
  const idx = Math.max(fullPath.lastIndexOf('/'), fullPath.lastIndexOf('\\'))
  return {
    root: fullPath.substring(0, idx + 1),
    file: fullPath.substring(idx + 1),
  }
}

/** Apply editor color to the primitive material */
function applyColor(hex: string) {
  if (!primitiveMaterial) return
  primitiveMaterial.diffuseColor = Color3.FromHexString(hex)
}

/**
 * Build or rebuild the primitive shape.
 * If an imported model is active, primitives are not shown.
 */
function applyShape(shape: Shape) {
  if (!scene || !primitiveMaterial) return
  if (importedRoot) return // imported model active: ignore primitive updates

  primitiveMesh?.dispose()
  primitiveMesh = null

  switch (shape) {
    case 'box':
      primitiveMesh = MeshBuilder.CreateBox('primitive', { size: 1 }, scene)
      break
    case 'cylinder':
      primitiveMesh = MeshBuilder.CreateCylinder('primitive', { height: 1.2, diameter: 1 }, scene)
      break
    case 'sphere':
      primitiveMesh = MeshBuilder.CreateSphere('primitive', { diameter: 1.1, segments: 24 }, scene)
      break
    case 'pyramid':
      // simple pyramid: cylinder with top diameter 0
      primitiveMesh = MeshBuilder.CreateCylinder('primitive', { height: 1.3, diameterBottom: 1, diameterTop: 0 }, scene)
      break
  }

  if (primitiveMesh) primitiveMesh.material = primitiveMaterial
}

/**
 * Load a glb/gltf model from a local file path (provided by Electron main process).
 * - Disposes previous imported model only (keeps camera/lights/materials).
 * - Disables primitives while a model is active.
 */
async function loadModel(fullPath: string) {
  if (!scene) return

  // Remove the primitive if any
  primitiveMesh?.dispose()
  primitiveMesh = null

  // Remove previous imported model
  if (importedRoot) {
    importedRoot.dispose(false, true)
    importedRoot = null
  }

  const { root, file } = splitPath(fullPath)

  // Import meshes and group them under a root so we can dispose later
  const result = await SceneLoader.ImportMeshAsync('', root, file, scene)
  importedRoot = new Mesh('__importedRoot__', scene)
  result.meshes.forEach((m) => {
    // Skip the dummy root Babylon sometimes returns
    if (m === importedRoot) return
    m.parent = importedRoot!
  })
}

/**
 * Go back to primitives mode:
 * - Dispose imported model (if any)
 * - Recreate primitives based on current props
 */
function resetToPrimitives() {
  if (!scene) return

  if (importedRoot) {
    importedRoot.dispose(false, true)
    importedRoot = null
  }

  applyColor(props.color)
  applyShape(props.shape)
}

defineExpose({ loadModel, resetToPrimitives })

onMounted(() => {
  if (!canvas.value) return

  engine = new Engine(canvas.value, true, { preserveDrawingBuffer: true, stencil: true })
  scene = new Scene(engine)

  // Camera: simple editor-like orbit camera
  const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 3, Vector3.Zero(), scene)
  camera.attachControl(canvas.value, true)

  // Lighting: basic hemisphere light for quick readability
  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  // Primitive material used for editor primitives
  primitiveMaterial = new StandardMaterial('primitiveMat', scene)

  // Init from props
  applyColor(props.color)
  applyShape(props.shape)

  engine.runRenderLoop(() => scene?.render())
  window.addEventListener('resize', () => engine?.resize())
})

// When props change, update primitives (unless imported model is active)
watch(() => props.color, (v) => applyColor(v))
watch(() => props.shape, (v) => applyShape(v))

onBeforeUnmount(() => {
  scene?.dispose()
  engine?.dispose()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full block rounded-2xl" />
</template>
