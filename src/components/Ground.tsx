import React from 'react'
import { usePlane } from '@react-three/cannon'
import { groundTexture } from '../images/textures'
import { useStore } from '../hooks/useStore'
import { Plane, Sky, Stars } from '@react-three/drei'

export const Ground = () => {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, 0, 0],
    }))
    const [addCube] = useStore((state) => [state.addCube])

    groundTexture.repeat.set(100, 100)

    return (
        <mesh
            onClick={(e) => {
                e.stopPropagation()
                const [x, y, z] = Object.values(e.point).map((val) =>
                    Math.ceil(val)
                )
                addCube(x, y, z)
            }}
            ref={ref}
        >
            <ambientLight intensity={0.3} />
            <planeBufferGeometry attach="geometry" args={[100, 100]} />
            <meshStandardMaterial attach="material" map={groundTexture} />
        </mesh>
    )
}