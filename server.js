import fs from 'fs'
import express from 'express'
import Router from 'express-promise-router'
import { Server } from 'socket.io'

// Create router
const router = Router()

// Main route serves the index HTML
router.get('/', async (req, res, next) => {
    let html = fs.readFileSync('index.html', 'utf-8')
    res.send(html)
})

// Everything else that's not index 404s
router.use('*', (req, res) => {
    res.status(404).send({ message: 'Not Found' })
})

// Create express app and listen on port 4444
const app = express()
app.use(express.static('dist'))
app.use(router)
const server = app.listen(process.env.PORT || 4444, () => {
    console.log(`Listening on port http://localhost:4444...`)
})

const ioServer = new Server(server)

let clients = {}
let cubes = []

// Socket app msgs
ioServer.on('connection', (client) => {
    console.log(
        `User ${client.id} connected, there are currently ${ioServer.engine.clientsCount} users connected`
    )

    //Add a new client indexed by his id
    clients[client.id] = {
        position: [0, 0, 0],
        quaternion: [0, 0, 0],
        name: 'Username',
    }

    ioServer.sockets.emit('move', clients)

    client.on('addCube', (payload) => {
        const { key, pos, texture } = payload
        cubes.push({
            key,
            pos,
            texture,
        })
        ioServer.sockets.emit('cubes', cubes)
    })

    client.on('removeCube', (payload) => {
        const { key } = payload
        console.log(cubes)
        cubes = cubes.filter((cube) => cube.key !== key)
        console.log(cubes)
        ioServer.sockets.emit('cubes', cubes)
    })

    client.on('move', (payload) => {
        const { id, name, quaternion, position } = payload
        clients[id].position = position
        clients[id].quaternion = quaternion
        clients[id].name = name
        ioServer.sockets.emit('move', clients)
    })

    client.on('disconnect', () => {
        console.log(
            `User ${client.id} disconnected, there are currently ${ioServer.engine.clientsCount} users connected`
        )

        //Delete this client from the object
        delete clients[client.id]

        ioServer.sockets.emit('move', clients)
    })
})
