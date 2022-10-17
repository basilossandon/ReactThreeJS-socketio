import React from 'react'
import { useStore } from '../hooks/useStore'
import { Cube } from './Cube'

export const Cubes = ({ cubes = [], socket }) => {
    return (
        <>
            {/* 
    [
        {
            "key": "knjecbs_4n5tgJYvmLs21",
            "pos": [
                -1,
                0,
                -1
            ],
            "texture": "dirt"
        },
        {
            "key": "axeLnsUgGpVHmtuBaKCHK",
            "pos": [
                0,
                0,
                0
            ],
            "texture": "dirt"
        },
    ] 
    */}
            {cubes.map(({ key, pos, texture }) => {
                return (
                    <Cube
                        key={key}
                        cubes={cubes}
                        socket={socket}
                        position={pos}
                        texture={texture}
                    />
                )
            })}
        </>
    )
}
