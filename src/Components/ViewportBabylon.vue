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

let primitiveMesh: Mesh | null = null
let primitiveMaterial: StandardMaterial | null = null

// Root mesh grouping imported model meshes (so we can dispose cleanly)
let importedRoot: Mesh | null = null

function applyColor(hex: string) {
  if (!primitiveMaterial) return
  primitiveMaterial.diffuseColor = Color3.FromHexString(hex)
}

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
      primitiveMesh = MeshBuilder.CreateCylinder(
        'primitive',
        { height: 1.3, diameterBottom: 1, diameterTop: 0 },
        scene,
      )
      break
  }

  if (primitiveMesh) primitiveMesh.material = primitiveMaterial
}

/**
 * Load a model from a URL (typically a Blob URL created in the renderer).
 * This avoids loading file:/// paths, which are blocked when the renderer is served from http://localhost.
 */
async function loadModel(file: File) {
  if (!scene) return

  // Remove primitive
  primitiveMesh?.dispose()
  primitiveMesh = null

  // Remove previous imported model
  if (importedRoot) {
    importedRoot.dispose(false, true)
    importedRoot = null
  }

  const result = await SceneLoader.ImportMeshAsync('', '', file, scene)

  importedRoot = new Mesh('__importedRoot__', scene)
  result.meshes.forEach((m) => {
    if (m === importedRoot) return
    m.parent = importedRoot!
  })
}


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

  const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 3, Vector3.Zero(), scene)
  camera.attachControl(canvas.value, true)

  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  primitiveMaterial = new StandardMaterial('primitiveMat', scene)

  applyColor(props.color)
  applyShape(props.shape)

  engine.runRenderLoop(() => scene?.render())
  window.addEventListener('resize', () => engine?.resize())
})

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
