import React, { useState, useEffect, useRef } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import {
    OrbitControls,
    PointerLockControls,
    Text,
    Stats,
    FirstPersonControls,
} from '@react-three/drei'
import { MeshNormalMaterial, BoxGeometry, Vector3, Quaternion } from 'three'
import { io } from 'socket.io-client'

import './App.css'
import WasdControls from './controllers/WASD'

function ControlsWrapper({ clientName, socket }) {
    const { camera } = useThree()
    // Register the update event and clean up

    function movePlayer() {
        const { position, quaternion } = camera
        const { id } = socket

        socket.emit('move', {
            id,
            quaternion,
            position,
            name: clientName,
        })
    }

    return (
        <>
            {/* <FirstPersonControls
                activeLook
                lookSpeed={1}
                onUpdate={() => movePlayer()}
            /> */}
            <WasdControls onChange={() => movePlayer()} />
            <PointerLockControls onChange={() => movePlayer()} />
        </>
    )
}

function UserWrapper({ name, position, quaternion, id }) {
    if (!position) return
    const { camera } = useThree()
    console.log('@@', camera.position.z)

    return (
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
        >
            {/* Optionally show the ID above the user's mesh */}
            <Text
                rotation={[
                    0,
                    Math.atan2(
                        camera.position.x - position.x,
                        camera.position.z - position.z
                    ),
                    0,
                ]}
                position={[0, 1.0, 0]}
                color="black"
                anchorX="center"
                anchorY="middle"
            >
                {name}
            </Text>
        </mesh>
    )
}

function App() {
    const [socketClient, setSocketClient] = useState(null)
    const [clients, setClients] = useState({})
    const [name, setName] = useState('Username')

    const [clientName, setClientName] = useState('Username')

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
            <>
                <div className="nameInputContainer">
                    <div className="nameLabel">Name</div>

                    <input
                        value={name}
                        // onMouseEnter={() => alert('entro!')}
                        // value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="nameInput"
                    />
                    <div
                        onClick={() => setClientName(name)}
                        className="nameButton"
                    >
                        Set name
                    </div>
                </div>
                <Canvas camera={{ position: [0, 1, -5], near: 0.1, far: 1000 }}>
                    <Stats />
                    <ControlsWrapper
                        clientName={clientName}
                        socket={socketClient}
                    />
                    <gridHelper rotation={[0, 0, 0]} />
                    {/* Filter myself from the client list and create user boxes with IDs */}
                    {Object.keys(clients)
                        .filter((clientKey) => clientKey !== socketClient.id)
                        .map((client) => {
                            const { name, position, quaternion } =
                                clients[client]

                            return (
                                <UserWrapper
                                    key={client}
                                    id={client}
                                    name={name}
                                    position={position}
                                    quaternion={quaternion}
                                />
                            )
                        })}
                </Canvas>
            </>
        )
    )
}

export default App
