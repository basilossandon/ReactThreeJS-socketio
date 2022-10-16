import React, { useState, useEffect, useRef, useMemo } from 'react'
import { io } from 'socket.io-client'
import { Canvas, useThree } from '@react-three/fiber'
import { PointerLockControls, Stats, Stars, Sky } from '@react-three/drei'

import './App.css'
import Player from './components/Player'
import WasdControls from './controllers/WASD'
import { Ground } from './components/Ground'
import { Physics } from '@react-three/cannon'

function ControlsWrapper({ clientName, socket }) {
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
        <>
            {/* <FirstPersonControls
                activeLook
                lookSpeed={1}
                onUpdate={() => sendData()}
            /> */}
            <WasdControls onChange={() => sendData()} />
            <PointerLockControls onChange={() => sendData()} />
        </>
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
                <div
                    className="absolute mt-14 ml-2 z-10"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white shadow-md sm:rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h3 className="text-lg font-medium leading-6 text-gray-900">
                                Update your name
                            </h3>

                            <form className="mt-5 sm:flex sm:items-center">
                                <div className="w-full sm:max-w-xs mr-2">
                                    <label htmlFor="email" className="sr-only">
                                        Email
                                    </label>
                                    <input
                                        value={name}
                                        // onMouseEnter={() => alert('entro!')}
                                        // value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        type="text"
                                        id="first_name"
                                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="John"
                                        required
                                    />
                                </div>
                                <div
                                    onClick={(e) => {
                                        setClientName(name)
                                    }}
                                    className="cursor-pointer text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    Submit
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
                <Canvas camera={{ position: [0, 1, 5], near: 0.1 }}>
                    {/* <Sky } /> */}
                    {/* <ambientLight intensity={0.5} /> */}

                    <Stars
                        radius={100}
                        depth={50}
                        count={5000}
                        factor={4}
                        saturation={0}
                        fade
                        speed={1.5}
                    />
                    <Sky
                        distance={3000}
                        turbidity={4}
                        rayleigh={2}
                        mieCoefficient={0.1}
                        mieDirectionalG={0.8}
                        inclination={0.488}
                        azimuth={0.25}
                    />

                    <Physics>
                        <Ground />
                    </Physics>

                    <Stats />

                    <ControlsWrapper
                        clientName={clientName}
                        socket={socketClient}
                    />

                    {/* Filter myself from the client list and create user boxes with IDs */}
                    {Object.keys(clients)
                        .filter((clientKey) => clientKey !== socketClient.id)
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
                </Canvas>
            </>
        )
    )
}

export default App
