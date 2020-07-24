import React, { useEffect } from "react";
import cloneDeep from "lodash.clonedeep"; //probably not needed
import { useImmer } from "use-immer";

import {
  cellTypeByPos,
  posEq,
  distance,
  canBuildWall,
} from "../gameLogic/mainLogic";
import Board from "./Board";
import Header from "../shared/Header";
import StatusHeader from "./StatusHeader";
import TimerHeader from "./TimerHeader";

const emptyGrid = (dims) => {
  let grid = [];
  for (let r = 0; r < dims.h; r++) {
    grid[r] = [];
    for (let c = 0; c < dims.w; c++) grid[r][c] = 0;
  }
  return grid;
};

const GamePage = ({
  socket,
  creatorParams,
  joinerParams,
  lobbyReturnFromGame,
}) => {
  const dims = { w: 23, h: 19 }; //traditional board size
  const corners = {
    tl: { r: 0, c: 0 },
    tr: { r: 0, c: dims.w - 1 },
    bl: { r: dims.h - 1, c: 0 },
    br: { r: dims.h - 1, c: dims.w - 1 },
  };
  const initialPlayerPos = [corners.tl, corners.tr];
  const goals = [corners.br, corners.bl]; //where the players have to reach to win
  const isPlayer1 = creatorParams !== null;

  const [S, updateState] = useImmer({
    timeControl: isPlayer1 ? creatorParams.timeControl : null,
    gameId: isPlayer1 ? null : joinerParams.gameId,
    p1Name: isPlayer1 ? creatorParams.p1Name : null,
    p2Name: isPlayer1 ? null : joinerParams.p2Name,
    p1Starts: null,
    lifeCycleStage: -2,
    numMoves: 0,
    playerPos: initialPlayerPos,
    grid: emptyGrid(dims),
    timeLeft1: isPlayer1 ? creatorParams.timeControl.duration * 60 : null,
    timeLeft2: isPlayer1 ? creatorParams.timeControl.duration * 60 : null,
    winner: "", //'' for an ongoing game, '1', '2', or 'draw' for a finished game
    finishReason: "", //'' for an on-going game, 'time' or 'goal' for a finished game
    ghostAction: null,
  });

  const p1ToMove = () => S.numMoves % 2 === (S.p1Starts ? 0 : 1);

  useEffect(() => {
    if (isPlayer1 && S.lifeCycleStage === -2) {
      updateState((draftS) => {
        draftS.lifeCycleStage = -1;
      });
      socket.emit("createGame", S.timeControl, S.p1Name);
    }
    if (!isPlayer1 && S.lifeCycleStage === -2) {
      updateState((draftS) => {
        draftS.lifeCycleStage = -1;
      });
      socket.emit("joinGame", S.gameId, S.p2Name);
    }
  });

  useEffect(() => {
    socket.once("gameCreated", ({ gameId, p1Starts }) => {
      updateState((draftS) => {
        if (draftS.lifeCycleStage === 0) return;
        draftS.gameId = gameId;
        draftS.p1Starts = p1Starts;
        draftS.lifeCycleStage = 0;
      });
    });
    socket.once("gameJoined", ({ p1Starts, p1Name, timeControl }) => {
      updateState((draftS) => {
        console.log(`game joined ${draftS.lifeCycleStage}`);
        if (draftS.lifeCycleStage === 1) return;
        draftS.p1Starts = p1Starts;
        draftS.p1Name = p1Name;
        draftS.timeControl = timeControl;
        draftS.timeLeft1 = timeControl.duration * 60;
        draftS.timeLeft2 = timeControl.duration * 60;
        draftS.lifeCycleStage = 1;
      });
    });
    socket.once("p2Joined", (p2Name) => {
      updateState((draftS) => {
        if (draftS.lifeCycleStage === 1) return;
        draftS.p2Name = p2Name;
        draftS.lifeCycleStage = 1;
      });
    });
    socket.on("move", (actions, numMoves, receivedTime) => {
      updateState((draftS) => {
        console.log(
          `move received ${numMoves} ${receivedTime} ${
            draftS.numMoves === numMoves
          }`
        );
        if (draftS.lifeCycleStage < 1 || draftS.lifeCycleStage > 3) return;
        if (draftS.numMoves !== numMoves) return;
        const pToMove =
          draftS.numMoves % 2 === (draftS.p1Starts ? 0 : 1) ? 1 : 2;
        for (let k = 0; k < actions.length; k++) {
          const aPos = actions[k];
          const aType = cellTypeByPos(aPos);
          if (aType === "Ground") {
            draftS.playerPos[pToMove - 1] = aPos;
            if (posEq(aPos, goals[pToMove - 1])) {
              const otherP = pToMove === 1 ? 2 : 1;
              const pToMoveStarted = pToMove === (draftS.p1Starts ? 1 : 2);
              const remainingDist = distance(
                draftS.grid,
                draftS.playerPos[otherP - 1],
                goals[otherP - 1]
              );
              if (pToMoveStarted && remainingDist <= 2) {
                draftS.winner = "draw";
                draftS.finishReason = "goal";
                draftS.lifeCycleStage = 4;
              } else {
                draftS.winner = pToMove.toString();
                draftS.finishReason = "goal";
                draftS.lifeCycleStage = 4;
              }
            }
          } else if (aType === "Wall") {
            draftS.grid[aPos.r][aPos.c] = pToMove;
          } else console.error("unexpected action type", aType);
        }
        if (isPlayer1) draftS.timeLeft2 = receivedTime;
        else draftS.timeLeft1 = receivedTime;
        draftS.ghostAction = null;
        draftS.numMoves = numMoves + 1;
        if (draftS.lifeCycleStage === 1 && numMoves === 0)
          draftS.lifeCycleStage = 2;
        else if (draftS.lifeCycleStage === 2 && numMoves === 1)
          draftS.lifeCycleStage = 3;
      });
    });
    return () => {
      socket.removeAllListeners();
    };
  }, [socket, updateState, isPlayer1, S.gameId, goals]);

  useEffect(() => {
    const interval = setInterval(() => {
      updateState((draftS) => {
        if (draftS.lifeCycleStage !== 3) return;
        const p1ToM = draftS.numMoves % 2 === (draftS.p1Starts ? 0 : 1);
        if (p1ToM) {
          draftS.timeLeft1 -= 1;
          if (draftS.timeLeft1 === 0) {
            draftS.winner = "2";
            draftS.finishReason = "time";
            draftS.lifeCycleStage = 4;
          }
        } else {
          draftS.timeLeft2 -= 1;
          if (draftS.timeLeft2 === 0) {
            draftS.winner = "1";
            draftS.finishReason = "time";
            draftS.lifeCycleStage = 4;
          }
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [updateState]);

  //one of 'None', 'Ground', 'Wall'
  const ghostType = () =>
    S.ghostAction === null ? "None" : cellTypeByPos(S.ghostAction);

  //when player selects / clicks a cell, it can trigger a different number of actions
  //1 action: build 1 wall or 1 step
  const clickActionCount = (clickPos) => {
    let [pos1, pos2] = cloneDeep(S.playerPos);
    const playerToMove = p1ToMove() ? 1 : 2;

    const clickType = cellTypeByPos(clickPos);
    if (clickType === "Ground") {
      const actorPos = playerToMove === 1 ? pos1 : pos2;
      return distance(S.grid, actorPos, clickPos);
    } else if (clickType === "Wall") {
      const gridCopy = cloneDeep(S.grid); //copy to preserve immutability of state
      if (ghostType() === "Wall") {
        //block ghost wall for the check
        gridCopy[S.ghostAction.r][S.ghostAction.c] = 1;
      } else if (ghostType() === "Ground") {
        //use ghost position for the check
        [pos1, pos2] =
          playerToMove === 1 ? [S.ghostAction, pos2] : [pos1, S.ghostAction];
      }
      return canBuildWall(gridCopy, [pos1, pos2], goals, clickPos) ? 1 : 0;
    } else {
      console.error("unexpected action type", clickType);
    }
  };

  //handles the logic of ghost moves and sending complete moves to the server
  const handleClick = (clickPos) => {
    const thisClientToMove = isPlayer1 === p1ToMove();
    if (!thisClientToMove) return; //can only move if it's your turn
    if (S.lifeCycleStage <= 0) return; //cannot move til player 2 joins
    if (S.lifeCycleStage > 3) return; //cannot move if game finished
    const clickType = cellTypeByPos(clickPos);
    //first move by each player cannot be a wall
    if (S.lifeCycleStage < 3 && clickType === "Wall") return;
    const clickActCount = clickActionCount(clickPos);

    let [actions, newGhostAction] = [null, null];
    if (ghostType() === "None") {
      if (clickType === "Wall") {
        if (clickActCount === 1) newGhostAction = clickPos;
        else return;
      } else if (clickType === "Ground") {
        if (clickActCount === 1) newGhostAction = clickPos;
        else if (clickActCount === 2) actions = [clickPos];
        else return;
      } else {
        console.error("unexpected action type", clickType);
      }
    } else if (ghostType() === "Wall") {
      if (clickType === "Wall") {
        if (posEq(S.ghostAction, clickPos)) newGhostAction = null;
        else if (clickActCount === 1) actions = [clickPos, S.ghostAction];
        else return;
      } else if (clickType === "Ground") {
        if (clickActCount === 1) actions = [clickPos, S.ghostAction];
        else return;
      } else {
        console.error("unexpected action type", clickType);
      }
    } else if (ghostType() === "Ground") {
      if (clickType === "Wall") {
        if (clickActCount === 1) actions = [clickPos, S.ghostAction];
        else return;
      } else if (clickType === "Ground") {
        if (clickActCount === 0) newGhostAction = null;
        else if (clickActCount === 1) newGhostAction = clickPos;
        else if (clickActCount === 2) actions = [clickPos];
        else return;
      } else {
        console.error("unexpected action type", clickType);
      }
    } else {
      console.error("unexpected ghost type", ghostType());
    }

    if (actions) {
      let incrementedTime = isPlayer1 ? S.timeLeft1 : S.timeLeft2;
      if (S.lifeCycleStage === 3) incrementedTime += S.timeControl.increment;
      socket.emit("move", actions, incrementedTime);
      updateState((draftS) => {
        if (draftS.numMoves !== S.numMoves) return;
        const pToMove =
          draftS.numMoves % 2 === (draftS.p1Starts ? 0 : 1) ? 1 : 2;
        for (let k = 0; k < actions.length; k++) {
          const aPos = actions[k];
          const aType = cellTypeByPos(aPos);
          if (aType === "Ground") {
            draftS.playerPos[pToMove - 1] = aPos;
            if (posEq(aPos, goals[pToMove - 1])) {
              //special draw rule
              const otherP = pToMove === 1 ? 2 : 1;
              const pToMoveStarted = pToMove === (draftS.p1Starts ? 1 : 2);
              const remainingDist = distance(
                draftS.grid,
                draftS.playerPos[otherP - 1],
                goals[otherP - 1]
              );
              if (pToMoveStarted && remainingDist <= 2) {
                draftS.winner = "draw";
                draftS.finishReason = "goal";
                draftS.lifeCycleStage = 4;
              } else {
                draftS.winner = pToMove.toString();
                draftS.finishReason = "goal";
                draftS.lifeCycleStage = 4;
              }
            }
          } else if (aType === "Wall") {
            draftS.grid[aPos.r][aPos.c] = pToMove;
          } else console.error("unexpected action type", aType);
        }
        if (isPlayer1) draftS.timeLeft1 = incrementedTime;
        else draftS.timeLeft2 = incrementedTime;
        draftS.ghostAction = null;
        draftS.numMoves = S.numMoves + 1;
        if (draftS.lifeCycleStage === 1 && S.numMoves === 0)
          draftS.lifeCycleStage = 2;
        else if (draftS.lifeCycleStage === 2 && S.numMoves === 1)
          draftS.lifeCycleStage = 3;
      });
    } else {
      updateState((draftS) => {
        draftS.ghostAction = newGhostAction;
      });
    }
  };

  const playerColors = ["red", "indigo"];
  const showGameHelp = () =>
    console.log("todo: show game help in modal window");

  const handleEndGame = () => {
    socket.emit("endGame", S.gameId);
    lobbyReturnFromGame();
  };
  return (
    <div>
      <Header
        gameName={S.gameId}
        showLobby
        endGame={() => handleEndGame()}
        showHelp={showGameHelp}
      />
      <StatusHeader
        playerNames={[S.p1Name, S.p2Name]}
        lifeCycleStage={S.lifeCycleStage}
        winner={S.winner}
        finishReason={S.finishReason}
        numMoves={S.numMoves}
        p1ToMove={p1ToMove()}
      />
      <TimerHeader
        lifeCycleStage={S.lifeCycleStage}
        playerNames={[S.p1Name, S.p2Name]}
        playerColors={playerColors}
        timeLeft1={S.timeLeft1}
        timeLeft2={S.timeLeft2}
        p1ToMove={p1ToMove()}
      />
      <Board
        goals={goals}
        playerPos={S.playerPos}
        grid={S.grid}
        ghostAction={S.ghostAction}
        playerColors={playerColors}
        handleClick={handleClick}
        p1ToMove={p1ToMove()}
      />
    </div>
  );
};

export default GamePage;