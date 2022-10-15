import React, { useState, useEffect, useRef, useMemo } from 'react'
import { io } from 'socket.io-client'
import { Canvas, useThree } from '@react-three/fiber'
import { MeshNormalMaterial, BoxGeometry } from 'three'
import { PointerLockControls, Text, Stats } from '@react-three/drei'

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

function TextSprite({
    children,
    position,
    scale,
    color = 'white',
    fontSize = 45,
}) {
    const canvas = useMemo(() => {
        var fontface = 'Arial'
        var fontsize = fontSize
        var borderThickness = 4

        var canvas = document.createElement('canvas')
        var context = canvas.getContext('2d')
        context.textBaseline = 'middle'
        context.font = `bold ${fontSize}px -apple-system, BlinkMacSystemFont, avenir next, avenir, helvetica neue, helvetica, ubuntu, roboto, noto, segoe ui, arial, sans-serif`

        var metrics = context.measureText(children)
        console.log(metrics)
        var textWidth = metrics.width

        context.lineWidth = borderThickness

        context.fillStyle = color
        context.fillText(children, textWidth - textWidth * 0.8, fontsize)
        return canvas
    }, [children])

    return (
        <sprite scale={scale} position={position}>
            <spriteMaterial
                sizeAttenuation={false}
                attach="material"
                transparent
                alphaTest={0.5}
            >
                <canvasTexture attach="map" image={canvas} />
            </spriteMaterial>
        </sprite>
    )
}

function UserWrapper({ name, position, quaternion, id }) {
    if (!position) return
    const { camera } = useThree()

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

            <TextSprite
                scale={[1, 1, 1]}
                opacity={1}
                position={[position.x, position.y, position.z]}
            >
                {name}
            </TextSprite>

            {/* <Text
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
            </Text> */}
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
                <div className="absolute mt-14 ml-2 z-10">
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
                                <button
                                    onClick={() => setClientName(name)}
                                    className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                                >
                                    Submit
                                </button>
                            </form>
                        </div>
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

                    {/* fakeuser */}

                    <UserWrapper
                        key="fake"
                        id="fake"
                        name="fake"
                        position={[3.1840431776959517, 1, 4.933878678280492]}
                        quaternion={[0, 0, 60]}
                    />
                </Canvas>
            </>
        )
    )
}

export default App
