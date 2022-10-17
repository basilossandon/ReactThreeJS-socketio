import React from 'react'
import { nanoid } from 'nanoid'

import { useBox } from '@react-three/cannon'
import { useState } from 'react'
import { useStore } from '../hooks/useStore'
import * as textures from '../images/textures'

export const Cube = ({ cubes, position, texture, socket }) => {
    const [isHovered, setIsHovered] = useState(false)
    const [ref] = useBox(() => ({
        type: 'Static',
        position,
    }))

    const [selectedTexture] = useStore((state) => [state.texture])

    function addCube(position) {
        socket.emit('addCube', {
            key: nanoid(),
            pos: position,
            texture: selectedTexture,
        })
    }

    function removeCube(position) {
        let selectedCube = cubes.filter((cube) => {
            const [X, Y, Z] = cube.pos
            return X !== position[0] || Y !== position[1] || Z !== position[2]
        })

        socket.emit('removeCube', {
            key: selectedCube.key,
        })
    }

    const activeTexture = textures[texture + 'Texture']

    return (
        <mesh
            castShadow
            receiveShadow
            onPointerMove={(e) => {
                e.stopPropagation()
                setIsHovered(true)
            }}
            onPointerOut={(e) => {
                e.stopPropagation()
                setIsHovered(false)
            }}
            onClick={(e) => {
                e.stopPropagation()
                const clickedFace = Math.floor(e.faceIndex / 2)
                const { x, y, z } = ref.current.position
                if (e.altKey) {
                    removeCube([x, y, z])
                    return
                } else if (clickedFace === 0) {
                    addCube([x + 1, y, z])
                    return
                } else if (clickedFace === 1) {
                    addCube([x - 1, y, z])
                    return
                } else if (clickedFace === 2) {
                    addCube([x, y + 1, z])
                    return
                } else if (clickedFace === 3) {
                    addCube([x, y - 1, z])
                    return
                } else if (clickedFace === 4) {
                    addCube([x, y, z + 1])
                    return
                } else if (clickedFace === 5) {
                    addCube([x, y, z - 1])
                    return
                }
            }}
            ref={ref}
        >
            <boxBufferGeometry attach="geometry" />
            <meshStandardMaterial
                color={isHovered ? 'grey' : 'white'}
                map={activeTexture}
                transparent={true}
                opacity={texture === 'glass' ? 0.6 : 1}
                attach="material"
            />
        </mesh>
    )
}
