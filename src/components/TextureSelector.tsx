import React from 'react'
import { useEffect, useState } from 'react'
import { useStore } from '../hooks/useStore'
import { useKeyboard } from '../hooks/useKeyboard'
import { dirtImg, grassImg, glassImg, logImg, woodImg } from '../images/images'

const images = {
    dirt: dirtImg,
    grass: grassImg,
    glass: glassImg,
    wood: woodImg,
    log: logImg,
}

export const TextureSelector = () => {
    const [visible, setVisible] = useState(true)
    const [activeTexture, setTexture] = useStore((state) => [
        state.texture,
        state.setTexture,
    ])
    const { dirt, grass, glass, wood, log } = useKeyboard()

    useEffect(() => {
        const textures = {
            dirt,
            grass,
            glass,
            wood,
            log,
        }
        const pressedTexture = Object.entries(textures).find(([k, v]) => v)
        if (pressedTexture) {
            setTexture(pressedTexture[0])
        }
    }, [setTexture, dirt, grass, glass, wood, log])

    useEffect(() => {
        const visibilityTimeout = setTimeout(() => {
            setVisible(false)
        }, 20000)
        setVisible(true)
        return () => {
            clearTimeout(visibilityTimeout)
        }
    }, [activeTexture])
    const styles = {
        transform: `translate(-50%, -50%)`,
    }
    return (
        visible && (
            <div className="absolute flex  justify-center align-center  w-full">
                <div style={styles} className="flex  ">
                    {Object.entries(images).map(([k, src]) => {
                        return (
                            <img
                                key={k}
                                src={src}
                                alt={k}
                                className={`mb-32 w-12 ${
                                    k === activeTexture
                                        ? 'border-solid border-2 border-white-600'
                                        : ''
                                }`}
                            />
                        )
                    })}
                </div>
            </div>
        )
    )
}
