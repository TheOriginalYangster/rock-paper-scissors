const express = require('express');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3001;

app.use(express.static('public'));

http.listen(port, () => console.log('Listening on port...', port));


//server "state"
let userCount = 0;
let readyCount = 0;
let readyPlayers = [];

io.on('connection', (socket) => {

    userCount ++;
    console.log('Connected users:', userCount);

    socket.on('disconnect', () => {
        userCount = userCount - 1;
        console.log('Connected users:', userCount);
        if(readyPlayers.indexOf(socket.id) !== -1){
            readyPlayers.splice(readyPlayers.indexOf(socket.id), 1);
            readyCount --;
            console.log('Removed player from ready queue.');
        }
    });
    socket.on('send throw', (RPS) => {
        console.log('A user sent: ', RPS);
        socket.broadcast.emit('opponents throw', RPS);
    });

    socket.on('ready up', () => {
        if(!readyPlayers.includes(socket.id)){
            readyCount ++;
            readyPlayers.push(socket.id);
            console.log(`${readyCount} user(s) ready to play`);
            if(readyCount === 2){
                console.log('Starting Game!');
                io.emit('start game');
            }
        }
    });

    socket.on('game over', () => {
        readyPlayers.splice(readyPlayers.indexOf(socket.id), 1);
        readyCount --;
        socket.broadcast.emit('game over')
    });

})