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
            pregameTimer: 0,
            round: 0,
            gameTimer: 0,
            conn: socket()
        }
        
        this.selectThrow = this.selectThrow.bind(this);
        this.readyUp = this.readyUp.bind(this);
        this.playGame = this.playGame.bind(this);
        this.endGame = this.endGame.bind(this);
        this.restart = this.restart.bind(this);

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
        this.setState({ready: true});
        this.state.conn.readyUp();
    }

    pregameTimer(){
        let t = 3;
        this.setState({pregameTimer: t});

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
                    if (wins === 7) { //<---------------------------------------
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
                    if(r < 20) playRound();
                    else if(r === 20 && this.state.gameStarted) this.endGame(true);
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
        if(this.state.wins === 7){//<-----------------------------------------------------------
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
        let yourImage = this.state.selected ? `${this.state.selected}.png` : 'asdf.png'

        return (
            <>
            <div id="game-box">
                <div id="top">
                    {/* Unready */}
                    {(!this.state.ready && !this.state.pregame && !this.state.gameStarted && !this.state.postgame) && 
                    <>
                    <h1>Rock Paper Scissors</h1>
                    <img src="home.png" id="home-image"></img>
                    <h3>Play an opponent to a best of seven series.</h3>
                    <h3>Ready up to find a game!</h3>
                    <br></br>
                    <button onClick={this.readyUp} className="button">Ready Up!</button>
                    </>}
                    {/* Ready */}
                    {(this.state.ready && !this.state.pregame && !this.state.gameStarted) && <>
                    <h1>Rock Paper Scissors</h1>
                    <h3>Waiting on Opponent.</h3>
                    <img src="spinner.gif"></img>
                    </>}
                    {/* Pregame */}
                    {(this.state.ready && this.state.pregame && !this.state.gameStarted) && <>
                    <h1>Rock Paper Scissors</h1>
                    <h3>Starting game in...</h3>
                    <h1>{count}</h1>
                    </>}
                    {/* Pre-Shoot */}
                    {(this.state.gameStarted && this.state.gameTimer !==3) && <>
                    <br></br>
                    <span>{3 - this.state.gameTimer}</span>
                    </>}
                    {/* Shoot! */}
                    {(this.state.gameStarted && this.state.gameTimer === 3) && 
                    <>
                    <img src={`${this.state.opponentChoice}.png`}></img>
                    <br></br>
                    <img src={`${this.state.selected}.png`}></img>
                    <br></br>
                    </>}
                    {/* Post-Game */}
                    {(this.state.postgame) && <>
                    <h1>Game Over</h1>
                    </>}
                        {/* Win & Loss*/}
                        {(this.state.postgame && this.state.won) && <h2>You Won!</h2>}
                        {(this.state.postgame && !this.state.won) && <h2>You Lost</h2>}
                </div>
            
                <div id="buttons">
                    {/* During Game */}
                    {(this.state.gameStarted) &&
                    <>
                    <h3>{this.state.wins + ' - ' + this.state.losses}</h3>
                    <button onClick={this.selectThrow} className="button" id="Rock">Rock</button>
                    <button onClick={this.selectThrow} className="button" id="Paper">Paper</button>
                    <button onClick={this.selectThrow} className="button" id="Scissors">Scissors</button>
                    </>}
                    {/* Post-Game */}
                    {(this.state.postgame) && <>
                    <h3>{this.state.wins + ' - ' + this.state.losses}</h3>
                    <button onClick={this.restart} className="button">Play Again!</button>
                    </>}

                </div>
            </div>
            </>
        )
    }
};



ReactDOM.render(
    <App />,
    document.getElementById("app")
);