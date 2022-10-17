import React, { useState, useEffect } from 'react'
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
import { useStore } from './hooks/useStore'

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
    const [socketClient] = useStore((state) => [state.socketClient])
    const [name, setName] = useState('Username')
    const [cubes, setCubes] = useState([])
    const [clients, setClients] = useState({})
    const [clientName, setClientName] = useState('Username')

    useEffect(() => {
        return () => {
            if (socketClient) socketClient.disconnect()
        }
    }, [])

    useEffect(() => {
        if (socketClient) {
            socketClient.on('move', (clients) => {
                setClients(clients)
            })

            socketClient.on('cubes', (cubes) => {
                setCubes(cubes)
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
                        { name: 'run', keys: ['ShiftLeft'] },
                    ]}
                >
                    <Canvas shadows>
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
                            position={[-10, 10, 5]}
                            shadow-mapSize={[256, 256]}
                            shadow-bias={-0.0001}
                            castShadow
                        >
                            <orthographicCamera
                                attach="shadow-camera"
                                args={[-10, 10, -10, 10]}
                            />
                        </directionalLight>

                        <Physics>
                            <Player />
                            <Ground socket={socketClient} />
                            <Cubes socket={socketClient} cubes={cubes} />
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
