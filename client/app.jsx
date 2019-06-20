import React from 'react';
import ReactDOM from 'react-dom';
import socket from './socket';



class App extends React.Component {
    constructor(){
        super();
        this.state = {
            opponentChoice: null,
            selected: null,
            ready: false,
            pregame: false,
            gameStarted: false,
            postgame: false,
            wins: 0,
            losses: 0,
            won: false,
            waitTimer: 0,
            pregameTimer: 0,
            round: 0,
            gameTimer: 0,
            conn: socket()
        }
        this.gameLength = 3;  // <------------------[GAME LENGTH]

        this.selectThrow = this.selectThrow.bind(this);
        this.readyUp = this.readyUp.bind(this);
        this.playGame = this.playGame.bind(this);
        this.endGame = this.endGame.bind(this);
        this.restart = this.restart.bind(this);
        this.wait = this.wait.bind(this);

        //  incoming emissions handlers ///
        this.state.conn.opponentsThrow((RPS) => {
            this.setState({opponentChoice: RPS});
        });

        this.state.conn.startGame(() => {
            this.setState({pregame: true});
            this.pregameTimer();
        });
        this.state.conn.lostGame(() => {
            this.endGame();
        });
    }

    selectThrow(e){
        this.setState({selected: e.target.id});
        this.state.conn.sendThrow(e.target.id);
    }

    readyUp(e){
        this.setState({ready: true}, this.wait);
        this.state.conn.readyUp();
        
    }

    wait(){
        if(this.state.ready){
            setTimeout(() => {
                this.setState({waitTimer: this.state.waitTimer + 1});
                this.wait();
            }, 1000);
        };
    }

    pregameTimer(){
        let t = 3;
        this.setState({pregameTimer: t, ready: false, waitTimer: 0});

        const countItDown = () => {
            setTimeout(() => {
                t --;
                this.setState({pregameTimer: t});
                if(t > 0){
                    countItDown();
                } else if(t === 0){
                    setTimeout(() => {
                        this.setState({pregame: false, gameStarted: true});
                        this.playGame();
                    }, 1000);
                    
                }
            }, 1000);
        }
        countItDown();
    };

    playGame(){
        let r = 0;
        let t = 0;
        const playRound = () => {
            if(!this.state.gameStarted){
                return;
            }
            else if(t < 2){
                setTimeout(() => {
                    t++;
                    this.setState({gameTimer: t});
                    playRound();
                }, 1000);
            }else if(t === 2){
                setTimeout(() => {
                    t++;
                    let win = checkWin();
                    let wins = (win === true) ? this.state.wins + 1 : this.state.wins;
                    let losses = (win === false) ? this.state.losses + 1  : this.state.losses;
                    if (wins === this.gameLength) { //<---------------------------------------
                        setTimeout(this.endGame, 750);
                    };
                    this.setState({gameTimer: t, wins, losses});
                    playRound();
                }, 1000);
            }else if (t === 3){
                setTimeout(() => {
                    t = 0;
                    r ++;
                    //check game over
                    this.setState({gameTimer: t, round: r});
                    if(r < 100) playRound();
                    else if(r === 100 && this.state.gameStarted) this.endGame(true);
                }, 1000);
            }
        }

        const checkWin = () => {
            let mine = this.state.selected;
            let theirs = this.state.opponentChoice;
            let won;
            if (mine === theirs) return 42;
            else if(!mine) won = false;
            else if(!theirs) won = true;
            else if(mine === "Rock") won = (theirs === "Scissors") ? true : false;
            else if (mine === "Scissors") won = (theirs === "Paper") ? true : false;
            else won = (theirs === "Rock") ? true : false;
            return won;
        }

        playRound();
    };

    endGame(tie){
        let w = false;
        if(this.state.wins === this.gameLength){//<-----------------------------------------------------------
            this.state.conn.wonGame();
            w = true;
        }
        this.setState({postgame: true, gameStarted: false, pregame: false, ready: false, won: w});
    };

    restart(){
        this.setState({ opponentChoice: null, selected: null, ready: false, pregame: false, gameStarted: false, postgame: false, wins: 0, losses: 0, pregameTimer: 0, round: 0, gameTimer: 0 });
    }

    render(){

        let count = this.state.pregameTimer === 0 ? 'Go!' : this.state.pregameTimer;
        const waits = ['Waiting for opponent.', 'Waiting for opponent..', 'Waiting for opponent...'];
        let yourImage = this.state.selected ? `${this.state.selected}.png` : 'Shrug.png';
        let theirImage = this.state.opponentChoice ? `${this.state.opponentChoice}.png` : 'Shrug.png';
        let endGame = this.state.won ? 'You Won!' : 'You Lost';
        return (
            <>
            <div id="game-box">
                <div id="top">
                    {/* Unready */}
                    {(!this.state.ready && !this.state.pregame && !this.state.gameStarted && !this.state.postgame) && 
                    <>
                    <h1>Rock Paper Scissors</h1>
                    <img src="home.png" id="home-image"></img>
                    <br></br>
                    <h3>Play an opponent to a best of seven series.</h3>
                    <h3>Ready up to find a game!</h3>
                    <br></br>
                    <button onClick={this.readyUp} className="button">Ready Up!</button>
                    </>}
                    {/* Ready */}
                    {(this.state.ready && !this.state.pregame && !this.state.gameStarted) && <>
                    <h1>Rock Paper Scissors</h1>
                    <h3>{waits[this.state.waitTimer % 3]}</h3>
                    <img src="spinner.gif"></img>
                    </>}
                    {/* Pregame */}
                    {(this.state.pregame && !this.state.gameStarted) && <>
                    <h1>Rock Paper Scissors</h1>
                    <h3>Starting game in...</h3>
                    <h1>{count}</h1>
                    </>}
                    {/* Pre-Shoot */}
                    {(this.state.gameStarted && this.state.gameTimer !==3) && <>
                    <br></br>
                    <h1 id="counter">{3 - this.state.gameTimer}</h1>
                    </>}
                    {/* Shoot! */}
                    {(this.state.gameStarted && this.state.gameTimer === 3) && 
                    <>
                    <img src={theirImage} className="game-image"></img>
                    <br></br>
                    <img src={yourImage} className="game-image"></img>
                    <br></br>
                    </>}
                    {/* Post-Game */}
                    {(this.state.postgame) && 
                    <>
                    <h1>Game Over</h1>
                    <h2>{endGame}</h2>
                    <br></br>
                    <h1>{this.state.wins + ' - ' + this.state.losses}</h1>
                    <button onClick={this.restart} className="button">Play Again!</button>
                    </>}
                </div>
            
            {/* Buttons */}
                {/* During Game */}
                {(this.state.gameStarted) &&
                <>
                <div id="buttons">
                <h1>{this.state.wins + ' - ' + this.state.losses}</h1>
                <button onClick={this.selectThrow} className="button" id="Rock">Rock</button>
                <button onClick={this.selectThrow} className="button" id="Paper">Paper</button>
                <button onClick={this.selectThrow} className="button" id="Scissors">Scissors</button>
                </div>
                </>}
                {/* Post-Game */}

            </div>
            </>
        )
    }
};



ReactDOM.render(
    <App />,
    document.getElementById("app")
);