import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { getThemeFromLocalTime, useWorldStore } from './game/store'
import type { WorldTheme } from './game/types'

const palette = {
  day: {
    sky: '#dcefff',
    fog: '#dcefff',
    grass: '#b9e5bf',
    path: '#ffe7c0',
    building: '#fff7ef',
    roof: '#e9a6b4',
    trim: '#8b728c',
    leaf: '#a9d9b0',
    leafAccent: '#f2b9c4',
  },
  night: {
    sky: '#262747',
    fog: '#303151',
    grass: '#5c8a78',
    path: '#a795a3',
    building: '#ded6e4',
    roof: '#945f82',
    trim: '#504b72',
    leaf: '#6aa18a',
    leafAccent: '#ad7599',
  },
} as const

function Tree({ position, scale = 1, accent = false }: { position: [number, number, number]; scale?: number; accent?: boolean }) {
  const colors = palette.day
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.18, 0.28, 1.6, 7]} />
        <meshStandardMaterial color="#97715f" roughness={1} />
      </mesh>
      <mesh castShadow position={[0, 2.05, 0]}>
        <dodecahedronGeometry args={[0.92, 1]} />
        <meshStandardMaterial color={accent ? colors.leafAccent : colors.leaf} roughness={0.95} flatShading />
      </mesh>
      <mesh castShadow position={[0.34, 2.32, 0.18]} scale={0.72}>
        <dodecahedronGeometry args={[0.82, 1]} />
        <meshStandardMaterial color={accent ? '#f7d2b9' : '#c8edc6'} roughness={1} flatShading />
      </mesh>
    </group>
  )
}

function Bench({ position, rotation = 0 }: { position: [number, number, number]; rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh castShadow position={[0, 0.66, 0]}>
        <boxGeometry args={[1.75, 0.14, 0.42]} />
        <meshStandardMaterial color="#ca8e72" />
      </mesh>
      <mesh castShadow position={[0, 1.05, 0.18]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[1.75, 0.14, 0.35]} />
        <meshStandardMaterial color="#e5ad87" />
      </mesh>
      {[-0.63, 0.63].map((x) => (
        <mesh castShadow key={x} position={[x, 0.3, 0]}>
          <boxGeometry args={[0.13, 0.6, 0.13]} />
          <meshStandardMaterial color="#886a68" />
        </mesh>
      ))}
    </group>
  )
}

function MainBuilding({ theme }: { theme: WorldTheme }) {
  const colors = palette[theme]
  return (
    <group position={[0, 0, -4.1]}>
      <mesh castShadow receiveShadow position={[0, 2.1, 0]}>
        <boxGeometry args={[8.5, 4.2, 2.2]} />
        <meshStandardMaterial color={colors.building} roughness={0.88} />
      </mesh>
      <mesh castShadow position={[0, 4.42, 0]} rotation={[0, Math.PI / 4, 0]} scale={[5.1, 0.82, 1.75]}>
        <coneGeometry args={[1, 1, 4]} />
        <meshStandardMaterial color={colors.roof} roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, 0.65, 1.15]}>
        <boxGeometry args={[1.25, 1.3, 0.12]} />
        <meshStandardMaterial color={colors.trim} />
      </mesh>
      {[-3, -1.5, 1.5, 3].map((x) => (
        <group key={x} position={[x, 2.35, 1.14]}>
          <mesh>
            <boxGeometry args={[0.88, 1.08, 0.12]} />
            <meshStandardMaterial color={theme === 'day' ? '#a9d8e9' : '#f5db8d'} emissive={theme === 'night' ? '#8f6629' : '#000000'} emissiveIntensity={0.35} />
          </mesh>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[0.08, 1.15, 0.05]} />
            <meshStandardMaterial color={colors.trim} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Campus({ theme }: { theme: WorldTheme }) {
  const colors = palette[theme]
  return (
    <>
      <color attach="background" args={[colors.sky]} />
      <hemisphereLight intensity={theme === 'day' ? 1.35 : 0.55} color={theme === 'day' ? '#fff4df' : '#8797dd'} groundColor={colors.grass} />
      <directionalLight castShadow position={[8, 12, 6]} intensity={theme === 'day' ? 2.1 : 0.55} color={theme === 'day' ? '#fff1d4' : '#b9c4ff'} shadow-mapSize={[1024, 1024]} />
      {theme === 'night' && <StarField />}

      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[22, 64]} />
        <meshStandardMaterial color={colors.grass} roughness={1} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.014, 2]}>
        <planeGeometry args={[4, 15]} />
        <meshStandardMaterial color={colors.path} roughness={1} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, -1.75]}>
        <planeGeometry args={[13, 2.5]} />
        <meshStandardMaterial color={colors.path} roughness={1} />
      </mesh>

      <MainBuilding theme={theme} />
      <Bench position={[-4.15, 0, 1.2]} rotation={0.3} />
      <Bench position={[4.15, 0, 1.2]} rotation={-0.3} />
      <Bench position={[-5.4, 0, -1.45]} rotation={Math.PI / 2} />
      <Tree position={[-6.4, 0, 4.4]} scale={1.2} accent />
      <Tree position={[-4.8, 0, -3.6]} scale={0.94} />
      <Tree position={[5.8, 0, 4.4]} scale={1.35} accent />
      <Tree position={[4.75, 0, -3.25]} scale={0.9} />
      <Tree position={[7.2, 0, -1.3]} scale={1.05} />
      <Tree position={[-7.4, 0, -1.5]} scale={0.88} accent />
      <CloudCluster position={[-7, 7, -8]} scale={1.15} />
      <CloudCluster position={[6, 6.5, -7]} scale={0.85} />
    </>
  )
}

function CloudCluster({ position, scale }: { position: [number, number, number]; scale: number }) {
  return (
    <group position={position} scale={scale}>
      {[
        [-1, 0, 0, 0.78],
        [-0.3, 0.25, 0, 1],
        [0.55, 0.04, 0.05, 0.86],
        [1.18, -0.18, 0.08, 0.58],
      ].map(([x, y, z, size], index) => (
        <mesh key={index} position={[x, y, z]}>
          <sphereGeometry args={[size, 12, 12]} />
          <meshStandardMaterial color="#fff8fb" roughness={1} />
        </mesh>
      ))}
    </group>
  )
}

function StarField() {
  const points = Array.from({ length: 80 }, (_, index) => {
    const x = ((index * 37) % 23) - 11.5
    const y = 4.6 + ((index * 13) % 14) * 0.55
    const z = -13 + ((index * 19) % 8)
    return [x, y, z] as [number, number, number]
  })
  return (
    <group>
      {points.map((position, index) => (
        <mesh key={index} position={position}>
          <sphereGeometry args={[0.027 + (index % 3) * 0.01, 6, 6]} />
          <meshBasicMaterial color="#fff7ce" />
        </mesh>
      ))}
    </group>
  )
}

function ThemeSync() {
  const setTheme = useWorldStore((state) => state.setTheme)

  useEffect(() => {
    const updateTheme = () => setTheme(getThemeFromLocalTime())
    updateTheme()
    const timer = window.setInterval(updateTheme, 60_000)
    return () => window.clearInterval(timer)
  }, [setTheme])

  return null
}

export default function CampusScene() {
  const theme = useWorldStore((state) => state.theme)
  const colors = palette[theme]

  return (
    <Canvas className="scene-canvas" shadows dpr={[1, 2]} camera={{ position: [11, 8, 13], fov: 42 }} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
      <ThemeSync />
      <Campus theme={theme} />
      <OrbitControls makeDefault enableDamping dampingFactor={0.06} minDistance={7} maxDistance={26} maxPolarAngle={Math.PI / 2.15} target={[0, 1.2, 0]} />
      <ambientLight color={colors.sky} intensity={0.12} />
    </Canvas>
  )
}
