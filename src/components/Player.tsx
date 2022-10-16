import React from 'react'
import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useSphere } from '@react-three/cannon'
import { useThree, useFrame } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import Axe from './Axe'

const SPEED = 5
const direction = new THREE.Vector3()
const frontVector = new THREE.Vector3()
const sideVector = new THREE.Vector3()
const rotation = new THREE.Vector3()
const speed = new THREE.Vector3()

export default function Player(props) {
    const axe = useRef()
    const [ref, api] = useSphere(() => ({
        mass: 1,
        type: 'Dynamic',
        position: [0, 3, 0],
        ...props,
    }))
    const [, get] = useKeyboardControls()
    const { camera } = useThree()
    const velocity = useRef([0, 0, 0])

    useEffect(() => api.velocity.subscribe((v) => (velocity.current = v)), [])

    useFrame((state) => {
        const { forward, backward, left, right, jump } = get()
        ref.current.getWorldPosition(camera.position)
        frontVector.set(0, 0, Number(backward) - Number(forward))
        sideVector.set(Number(left) - Number(right), 0, 0)
        direction
            .subVectors(frontVector, sideVector)
            .normalize()
            .multiplyScalar(SPEED)
            .applyEuler(camera.rotation)
        speed.fromArray(velocity.current)
        axe.current.children[0].rotation.x = THREE.MathUtils.lerp(
            axe.current.children[0].rotation.x,
            Math.sin((speed.length() > 1) * state.clock.elapsedTime * 10) / 6,
            0.1
        )
        axe.current.rotation.copy(camera.rotation)
        axe.current.position
            .copy(camera.position)
            .add(camera.getWorldDirection(rotation).multiplyScalar(1))
        api.velocity.set(direction.x, velocity.current[1], direction.z)
        if (jump && Math.abs(velocity.current[1].toFixed(2)) < 0.05)
            api.velocity.set(velocity.current[0], 10, velocity.current[2])
    })

    return (
        <>
            <mesh ref={ref} />
            <group
                ref={axe}
                onPointerMissed={(e) =>
                    (axe.current.children[0].rotation.x = -0.5)
                }
            >
                <Axe position={[0.3, -0.35, 0.5]} />
            </group>
        </>
    )
}
