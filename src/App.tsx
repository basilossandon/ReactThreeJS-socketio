import React, { useState, useEffect, useRef, useMemo } from 'react'
import { io } from 'socket.io-client'
import { Canvas, useThree } from '@react-three/fiber'
import {
    PointerLockControls,
    Stats,
    Stars,
    Sky,
    KeyboardControls,
    AccumulativeShadows,
    RandomizedLight,
} from '@react-three/drei'

import './App.css'
import Player from './components/Player'
import WasdControls from './controllers/WASD'
import { Ground } from './components/Ground'
import { Physics } from '@react-three/cannon'
import { Cubes } from './components/Cubes'
import { Camera } from './components/Camera'

import { TextureSelector } from './components/TextureSelector'
import SettingsMenu from './components/SettingsMenu'
import Axe from './components/Axe'

function PointerLock({ clientName, socket }) {
    const { camera } = useThree()
    // Register the update event and clean up
    function sendData() {
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
        // <WasdControls onChange={() => sendData()} />
        <PointerLockControls onChange={() => sendData()} />
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
                <div className="absolute inset-1/2 z-20 text-white">+</div>
                <KeyboardControls
                    map={[
                        { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
                        { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
                        { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
                        { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
                        { name: 'jump', keys: ['Space'] },
                    ]}
                >
                    <Canvas shadows>
                        {/* <Sky } /> */}
                        {/* <ambientLight intensity={0.5} /> */}

                        {/* <Stars
                        radius={100}
                        depth={50}
                        count={5000}
                        // factor={4}
                        factor={1}
                        saturation={0}
                        fade
                        speed={1.5}
                    /> */}
                        <Sky sunPosition={[100, 20, 100]} />

                        <ambientLight intensity={0.5} />
                        <directionalLight
                            position={[0.01, 0.01, 0.01]}
                            shadow-mapSize={[256, 256]}
                            shadow-bias={-0.00001}
                            castShadow
                        >
                            <orthographicCamera
                                attach="shadow-camera"
                                args={[-20, 20, -20, 20]}
                            />
                        </directionalLight>

                        {/* <ControlsWrapper
                        clientName={clientName}
                        socket={socketClient}
                    /> */}
                        <Physics>
                            <Camera />
                            <Ground />
                            <Cubes />
                        </Physics>

                        <Stats />

                        {/* Filter myself from the client list and create user boxes with IDs */}
                        {Object.keys(clients)
                            .filter(
                                (clientKey) => clientKey !== socketClient.id
                            )
                            .map((client) => {
                                const { name, position, quaternion } =
                                    clients[client]

                                return (
                                    <Player
                                        key={client}
                                        id={client}
                                        name={name}
                                        position={position}
                                        quaternion={quaternion}
                                    />
                                )
                            })}
                        <PointerLock
                            clientName={clientName}
                            socket={socketClient}
                        />
                    </Canvas>
                </KeyboardControls>

                <TextureSelector />
                <SettingsMenu
                    name={name}
                    setName={setName}
                    setClientName={setClientName}
                />
            </>
        )
    )
}

export default App
