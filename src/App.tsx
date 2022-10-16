import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { Canvas, useThree } from '@react-three/fiber'
import {
    Sky,
    Stats,
    Stars,
    KeyboardControls,
    PointerLockControls,
} from '@react-three/drei'

import './App.css'
import Player from './components/Player'
import SettingsMenu from './components/SettingsMenu'
import { Cubes } from './components/Cubes'
import { Ground } from './components/Ground'
import { Physics } from '@react-three/cannon'
import { TextureSelector } from './components/TextureSelector'
import PlayerModel from './components/PlayerModel'

function PointerLockWrapper({ clientName, socketClient }) {
    const { camera } = useThree()
    if (camera && socketClient) {
        const { position, quaternion } = camera
        const { id } = socketClient

        socketClient.emit('move', {
            id,
            quaternion,
            position,
            name: clientName,
        })
    }
    return <PointerLockControls />
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

                        <Stars
                            radius={100}
                            depth={50}
                            count={5000}
                            // factor={4}
                            factor={2}
                            saturation={0}
                            fade
                            speed={1.5}
                        />
                        <Sky sunPosition={[100, 20, 10]} />

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
                            <Player />
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
                                    <PlayerModel
                                        key={client}
                                        id={client}
                                        name={name}
                                        position={position}
                                        quaternion={quaternion}
                                    />
                                )
                            })}
                        <PointerLockWrapper
                            socketClient={socketClient}
                            clientName={clientName}
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
