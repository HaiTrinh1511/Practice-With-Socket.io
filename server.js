const express = require('express')
const morgan = require('morgan')
const handlebars = require('express-handlebars')
const path = require('path')


const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { v4: uuidv4 } = require('uuid')

// HTTP Logger & Template Engine
app.use(morgan('dev'))
app.engine('hbs', handlebars({
    extname: '.hbs',
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static('public'))

// Necessary for POST & PUT method
app.use(express.json())
app.use(express.urlencoded({ extended: false }))


// Route
app.get('/', (req, res) => {
    res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})


io.on('connection', socket => {
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId)
        // socket.to(roomId).broadcast.emit('user-connected', userId)
        socket.broadcast.to(roomId).emit('user-connected', userId)
        socket.on('disconnect', () => {
            socket.broadcast.to(roomId).emit('user-disconnected', userId)
        })
    })
})

server.listen(3000)