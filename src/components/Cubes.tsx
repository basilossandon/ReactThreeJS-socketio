import React from 'react'
import { useStore } from '../hooks/useStore'
import { Cube } from './Cube'

export const Cubes = () => {
    const [cubes] = useStore((state) => [state.cubes])
    return (
        <>
            <Cube position={[0, 0.5, -10]} />

            {cubes.map(({ key, pos, texture }) => {
                return <Cube key={key} position={pos} texture={texture} />
            })}
        </>
    )
}
