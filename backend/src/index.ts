
import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});


const port = process.env.PORT || 3000

app.get("/", (req, res) => {
    res.send("Hello World")
})

io.on('connection', (socket) => {
    console.log('a user connected')
    socket.emit('message', 'Socket io is working')
})

server.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`)
})