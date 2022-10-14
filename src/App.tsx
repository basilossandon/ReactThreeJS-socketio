import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
    OrbitControls,
    PointerLockControls,
    Text,
    Stats,
} from '@react-three/drei'
import { MeshNormalMaterial, BoxGeometry } from 'three'
import { io } from 'socket.io-client'

import './App.css'

const ControlsWrapper = ({ socket }) => {
    const { camera } = useThree()
    // Register the update event and clean up

    function movePlayer() {
        const { position, quaternion } = camera
        console.log('@@ ', position)
        const { id } = socket

        socket.emit('move', {
            id,
            quaternion,
            position,
        })
    }

    return <PointerLockControls onChange={() => movePlayer()} />
}

const UserWrapper = ({ position, quaternion, id }) => {
    return (
        <mesh
            position={position}
            quaternion={quaternion}
            geometry={new BoxGeometry()}
            material={new MeshNormalMaterial()}
        >
            {/* Optionally show the ID above the user's mesh */}
            <Text
                position={[0, 1.0, 0]}
                color="black"
                anchorX="center"
                anchorY="middle"
            >
                {id}
            </Text>
        </mesh>
    )
}

function App() {
    const [socketClient, setSocketClient] = useState(null)
    const [clients, setClients] = useState({})

    useEffect(() => {
        // On mount initialize the socket connection
        setSocketClient(io())

        // Dispose gracefuly
        return () => {
            if (socketClient) socketClient.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socketClient) {
            socketClient.on('move', (clients) => {
                setClients(clients)
            })
        }
    }, [socketClient])

    return (
        socketClient && (
            <Canvas camera={{ position: [0, 1, -5], near: 0.1, far: 1000 }}>
                <Stats />
                <ControlsWrapper socket={socketClient} />
                <gridHelper rotation={[0, 0, 0]} />

                {/* Filter myself from the client list and create user boxes with IDs */}
                {Object.keys(clients)
                    .filter((clientKey) => clientKey !== socketClient.id)
                    .map((client) => {
                        const { position, quaternion } = clients[client]
                        console.log('@@ Rendering', position)
                        return (
                            <UserWrapper
                                key={client}
                                id={client}
                                position={position}
                                quaternion={quaternion}
                            />
                        )
                    })}
            </Canvas>
        )
    )
}

export default App
