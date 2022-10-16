// import React from 'react'
// import * as THREE from 'three'
// import { useTexture } from '@react-three/drei'
// import { usePlane } from '@react-three/cannon'
// import grass from '../images/grass.jpg'

// export const Ground = (props) => {
//     const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
//     const texture = useTexture(grass)
//     texture.wrapS = texture.wrapT = THREE.RepeatWrapping
//     return (
//         <mesh ref={ref} receiveShadow>
//             <planeGeometry args={[100, 100]} />
//             <meshStandardMaterial map={texture} map-repeat={[240, 240]} />
//             {/* <planeBufferGeometry attach="geometry" args={[240, 240]} />
//             <meshStandardMaterial attach="material" map={texture} /> */}
//         </mesh>
//     )
// }

import React from 'react'
import { usePlane } from '@react-three/cannon'
import { groundTexture } from '../images/textures'
import { useStore } from '../hooks/useStore'

export const Ground = () => {
    const [ref] = usePlane(() => ({
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, -0.5, 0],
    }))
    const [addCube] = useStore((state) => [state.addCube])

    groundTexture.repeat.set(100, 100)

    return (
        <mesh
            receiveShadow
            onClick={(e) => {
                e.stopPropagation()
                const [x, y, z] = Object.values(e.point).map((val) =>
                    Math.ceil(val)
                )
                addCube(x, y, z)
            }}
            ref={ref}
        >
            <planeBufferGeometry attach="geometry" args={[100, 100]} />
            <meshStandardMaterial attach="material" map={groundTexture} />
        </mesh>
    )
}
