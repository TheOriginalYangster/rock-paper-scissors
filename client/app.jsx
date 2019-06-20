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
                    let wins = win ? this.state.wins + 1 : this.state.wins;
                    if (wins === 7) { //<---------------------------------------
                        setTimeout(this.endGame, 750);
                    };
                    this.setState({gameTimer: t, wins});
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
            if(!mine) won = false;
            else if(mine === "Rock") won = (theirs === "Scissors" || null);
            else if (mine === "Scissors") won = (theirs === "Paper" || null);
            else won = (theirs === "Rock" || null);
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
        return (
            <>
            <div id="game-box">
                <div id="top">
                    {/* Unready */}
                    {(!this.state.ready && !this.state.pregame && !this.state.gameStarted && !this.state.postgame) && 
                    <>
                    <h2>Ready Up to find a game!</h2>
                    <br></br>
                    <button onClick={this.readyUp}>Ready Up!</button>
                    </>}
                    {/* Ready */}
                    {(this.state.ready && !this.state.pregame && !this.state.gameStarted) && <h2>Waiting on Opponent...</h2>}
                    {/* Pregame */}
                    {(this.state.ready && this.state.pregame && !this.state.gameStarted) && <h2>Starting Game!  {this.state.pregameTimer}</h2>}
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
                    <h2>Game Over!</h2>
                    </>}
                        {/* Win & Loss*/}
                        {(this.state.postgame && this.state.won) && <h2>You Won!</h2>}
                        {(this.state.postgame && !this.state.won) && <h2>You Lost!</h2>}
                </div>
                <div id="buttons">
                    {/* During Game */}
                    {(this.state.gameStarted) &&
                    <>
                    <button onClick={this.selectThrow} id="Rock">Rock</button>
                    <button onClick={this.selectThrow} id="Paper">Paper</button>
                    <button onClick={this.selectThrow} id="Scissors">Scissors</button>
                    </>}
                    {/* Post-Game */}
                    {(this.state.postgame) && <>
                    <button onClick={this.restart}>Play Again!</button>
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