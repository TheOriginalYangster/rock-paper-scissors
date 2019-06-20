const io = require('socket.io-client');


export default function () {
  const socket = io.connect();
  
  
  /* LISTENERS */
  const startGame = (cb) => {
    socket.on('start game', () => cb());
  };

  const lostGame = (cb) => {
    socket.on('game over', () => cb());
  }

  const opponentsThrow = (cb) => {
    socket.on('opponents throw', RPS => cb(RPS));
  };
  
  /* EMITTERS */
  const sendThrow = (RPS) => {
    socket.emit('send throw', RPS);
  };

  const readyUp = () => {
    socket.emit('ready up');
  };

  const wonGame = () => {
    socket.emit('game over');
  }

  

  return {
    startGame,
    lostGame,
    opponentsThrow,
    sendThrow,
    readyUp,
    wonGame
  }
};