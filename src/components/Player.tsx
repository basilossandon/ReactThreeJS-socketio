import React from 'react'
import { Billboard, Text } from '@react-three/drei'
import { BoxGeometry, MeshNormalMaterial } from 'three'

export default function Player({
    name,
    position = { x: 0, y: 0, z: 0 },
    quaternion = { _x: 0, _y: 0, _z: 0 },
    id,
}) {
    return (
        <>
            <Billboard position={[position.x, position.y, position.z]}>
                <Text
                    position={[0, 1.1, 0]}
                    fontSize={0.5}
                    outlineWidth={'5%'}
                    outlineColor="#000000"
                    outlineOpacity={1}
                >
                    {name}
                </Text>
            </Billboard>
            <mesh
                position={[position.x, position.y, position.z]}
                quaternion={[
                    quaternion._x,
                    quaternion._y,
                    quaternion._z,
                    quaternion._w,
                ]}
                geometry={new BoxGeometry()}
                material={new MeshNormalMaterial()}
            ></mesh>
        </>
    )
}
