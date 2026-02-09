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
} from '@babylonjs/core'

export type Shape = 'box' | 'cylinder' | 'sphere' | 'pyramid'

const props = defineProps<{
  shape: Shape
  color: string
}>()

const canvas = ref<HTMLCanvasElement | null>(null)

let engine: Engine | null = null
let scene: Scene | null = null
let mesh: Mesh | null = null
let mat: StandardMaterial | null = null

function setColor(hex: string) {
  if (!mat) return
  mat.diffuseColor = Color3.FromHexString(hex)
}

function setShape(shape: Shape) {
  if (!scene || !mat) return

  mesh?.dispose()
  mesh = null

  switch (shape) {
    case 'box':
      mesh = MeshBuilder.CreateBox('shape', { size: 1 }, scene)
      break
    case 'cylinder':
      mesh = MeshBuilder.CreateCylinder('shape', { height: 1.2, diameter: 1 }, scene)
      break
    case 'sphere':
      mesh = MeshBuilder.CreateSphere('shape', { diameter: 1.1, segments: 24 }, scene)
      break
    case 'pyramid':
      mesh = MeshBuilder.CreateCylinder('shape', { height: 1.3, diameterBottom: 1, diameterTop: 0 }, scene)
      break
  }

  mesh.material = mat
}

onMounted(() => {
  if (!canvas.value) return

  engine = new Engine(canvas.value, true, { preserveDrawingBuffer: true, stencil: true })
  scene = new Scene(engine)

  const camera = new ArcRotateCamera('camera', Math.PI / 2, Math.PI / 3, 3, Vector3.Zero(), scene)
  camera.attachControl(canvas.value, true)

  new HemisphericLight('light', new Vector3(0, 1, 0), scene)

  mat = new StandardMaterial('mat', scene)

  // init from props
  setColor(props.color)
  setShape(props.shape)

  engine.runRenderLoop(() => scene?.render())
  window.addEventListener('resize', () => engine?.resize())
})

watch(() => props.color, (v) => setColor(v))
watch(() => props.shape, (v) => setShape(v))

onBeforeUnmount(() => {
  scene?.dispose()
  engine?.dispose()
})
</script>

<template>
  <canvas ref="canvas" class="w-full h-full block rounded-2xl" />
</template>
