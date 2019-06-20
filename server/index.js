const express = require('express');

const app = express();

const http = require('http').createServer(app);
const io = require('socket.io')(http);

const port = process.env.PORT || 3001;

app.use(express.static('public'));

http.listen(port, () => console.log('Listening on port...', port));


//server "state"
let userCount = 0;  
let readyPlayers = [];

io.on('connection', (socket) => {

    userCount ++;
    console.log('Connected users:', userCount);

    socket.on('disconnect', () => {
        userCount = userCount - 1;
        console.log('Connected users:', userCount);
        if(readyPlayers.indexOf(socket.id) !== -1){
            readyPlayers.splice(readyPlayers.indexOf(socket.id), 1);
            console.log('Removed player from ready queue.');
        }
    });
    socket.on('send throw', (RPS) => {
        console.log('A user sent: ', RPS);
        socket.broadcast.emit('opponents throw', RPS);
    });

    socket.on('ready up', () => {
        if(!readyPlayers.includes(socket.id)){
            readyPlayers.push(socket.id);
            console.log(`${readyPlayers.length} user(s) ready to play`);
            if(readyPlayers.length === 2){
                console.log('Starting Game!');
                io.emit('start game');
                readyPlayers = [];
            }
        }
    });


    socket.on('game over', () => {
        socket.broadcast.emit('game over');
    });

})