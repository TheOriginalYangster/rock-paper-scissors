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
            this.setState({pregame: false, ready: false, gameStarted: false, won: false});
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
            if(t < 2){
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
                    this.setState({gameTimer: t, wins});
                    playRound();
                }, 1000);
            }else if (t === 3){
                setTimeout(() => {
                    t = 0;
                    r ++;
                    //check game over
                    this.setState({gameTimer: t, round: r});
                    if(r < 4) playRound();
                    else if(r === 4) endGame();
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

        const endGame = () => {
            this.setState({postgame: true, gameStarted: false, pregame: false, ready: false});
            this.state.conn.wonGame();
            console.log('check line 119 for "won game"');
        }


        playRound();
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