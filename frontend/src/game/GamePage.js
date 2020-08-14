import React, { useEffect } from "react";
import { Button, Row, Col } from "react-materialize";
import cloneDeep from "lodash.clonedeep";
import { useImmer } from "use-immer";
import UIfx from "uifx";
import moveSoundAudio from "./../static/moveSound.mp3";
import showToastNotification from "../shared/showToastNotification";
import { useCookies } from "react-cookie";

import globalSettings from "../shared/globalSettings";
import {
  cellTypeByPos,
  posEq,
  emptyGrid,
  distance,
  isDistanceAtMost,
  canBuildWall,
} from "../gameLogic/mainLogic";
import Board from "./Board";
import Header from "../shared/Header";
import Dialog from "../shared/Dialog";
import StatusHeader from "./StatusHeader";
import TimerHeader from "./TimerHeader";
import GameHelp from "./GameHelp";
import ControlPanel from "./ControlPanel";

//===================================================
//settings that never change, so they don't need to be inside the component
//===================================================
const moveSound = new UIfx(moveSoundAudio);
const playMoveSound = () => {
  moveSound.play();
};
const goals = globalSettings.goals;
const boardDims = globalSettings.boardDims;
const initialPlayerPos = globalSettings.initialPlayerPos;
const pingInterval = 5000;

//===================================================
//pure utility functions
//===================================================
const turnCount = (state) => state.moveHistory.length - 1;

const creatorToMove = (state) =>
  turnCount(state) % 2 === (state.creatorStarts ? 0 : 1);

const indexToMove = (state) => (creatorToMove(state) ? 0 : 1);

//one of 'None', 'Ground', 'Wall'
const ghostType = (pos) => (pos === null ? "None" : cellTypeByPos(pos));

//when the player selects a cell, it can trigger a different
//number of actions (1 action: build 1 wall or move 1 step)
//this function counts the number of actions for a selected position
const countActions = (
  grid,
  selectedPos,
  posActor,
  posOther,
  goalActor,
  goalOther,
  extraWalls
) => {
  const gridCopy = cloneDeep(grid);
  for (let k = 0; k < extraWalls.length; k++) {
    const W = extraWalls[k];
    gridCopy[W.r][W.c] = 1;
  }
  if (cellTypeByPos(selectedPos) === "Ground") {
    return distance(gridCopy, posActor, selectedPos);
  }
  return canBuildWall(
    gridCopy,
    [posActor, posOther],
    [goalActor, goalOther],
    selectedPos
  )
    ? 1
    : 0;
};

//===================================================
//functions that modify a copy of the state
//===================================================
//the state itself should be immutable, but we can make changes
//to the copy 'draftState'

const createInitialState = (cookies) => {
  const draftState = {
    //===================================================
    //state about the session (sequence of games played by rematching)
    //===================================================
    //game code used by the joiner to join the game
    joinCode: null,
    //json object with duration in minutes and increment in seconds
    timeControl: null,
    names: [null, null],
    //the icon used for the player. The default icon is special in that it is
    //different for the creator and joiner
    tokens: ["default", "default"],

    //how many games each player has won in this session
    gameWins: [0, 0],
    opponentLeft: false,

    //===================================================
    //shared state of the current game
    //===================================================
    creatorStarts: null, //who starts is decided by the server
    winner: "", //'' if game is ongoing, else 'creator', 'joiner', or 'draw'
    //'' if game is ongoing, 'goal' or agreement' if drawn,
    //'time', 'goal', 'resign', or 'disconnect' if someone won
    finishReason: "",

    //life cycle of the game
    //-2. Before sending 'createGame'/'joinGame' (for creator/joiner) to the server
    //-1. Before receiving 'gameCreated'/'gameJoined' (for creator/joiner) from the server
    //0. game created on server, but joiner not joined yet (only creator goes into this stage).
    //1. joiner joined, but no moves made yet. Clocks not ticking.
    //2. One player moved. Clocks still not ticking.
    //3. Both players made at least 1 move and game has not ended. Clocks are ticking.
    //4. Game ended because a win/draw condition is reached.
    lifeCycleStage: -2,

    moveHistory: [
      {
        index: 0,
        actions: [],
        //grid contains the locations of all the built walls, labeled by who built them
        //0: empty wall, 1: player built by creator, 2: player built by joiner
        grid: emptyGrid(boardDims),
        playerPos: initialPlayerPos,
        timeLeft: [null, null],
        distances: [
          distance(emptyGrid(boardDims), initialPlayerPos[0], goals[0]),
          distance(emptyGrid(boardDims), initialPlayerPos[1], goals[1]),
        ],
        wallCounts: [0, 0],
      },
    ],

    //===================================================
    //state unique to this client
    //===================================================
    moveToSend: null, //moves to be sent to the other client are stored here temporarily

    //the ghost action is a single action done and shown only to this client
    //when it is this client's turn to move. it can be combined with another
    //action to make a full move, or undone in order to choose a different action
    ghostAction: null,

    //premove actions are one or two actions done by this client when it is not
    //this client's turn to move. once the opponent moves, the game behaves as if
    //the client inputted the premove actions during their turn
    premoveActions: [],

    isVolumeOn: false,
    showBackButtonWarning: false,
    isKeyPressed: false,
    //index of the move that the client is looking at, which may not be the last one
    viewIndex: 0,
    zoomLevel: 5, //number from 0 to 10

    //the client pings the server periodically to make sure the server is alive
    //'waitingForPing' is increased every 'pingInterval' seconds.
    //It is reset to 0 at every server message. A ping message is sent if waitingForPing
    //reaches 2 (meaning, it has gone at least 'pingInterval' seconds without hearing
    //from server). A warning is displayed to the user if it reaches 3 saying the server
    //is probably unreachable.
    waitingForPing: 0,

    //various dialogs where the player needs to make a decision
    showDrawDialog: false,
    showTakebackDialog: false,
    showRematchDialog: false,
  };
  applyCookieSettings(draftState, cookies);
  return draftState;
};

const applyCookieSettings = (draftState, cookies) => {
  if (!cookies) return;
  if (cookies.isVolumeOn && cookies.isVolumeOn === "true")
    draftState.isVolumeOn = true;
  if (cookies.zoomLevel) {
    const zoomVal = parseInt(cookies.zoomLevel);
    if (zoomVal >= 0 && zoomVal <= 10) draftState.zoomLevel = zoomVal;
  }
};

const applyAddCreator = (draftState, timeControl, name, token) => {
  draftState.lifeCycleStage = -1;
  draftState.timeControl = timeControl;
  draftState.names[0] = name;
  draftState.tokens[0] = token;
  const totalTimeInSeconds = timeControl.duration * 60;
  draftState.moveHistory[0].timeLeft = [totalTimeInSeconds, totalTimeInSeconds];
};

const applyAddJoiner = (draftState, joinCode, name, token) => {
  draftState.lifeCycleStage = -1;
  draftState.joinCode = joinCode;
  draftState.names[1] = name;
  draftState.tokens[1] = token;
};

//data sent by the server to the creator
const applyCreatedOnServer = (draftState, joinCode, creatorStarts) => {
  //if life cycle stage is already 0, it means we already processed the response
  if (draftState.lifeCycleStage === 0) return;
  draftState.joinCode = joinCode;
  draftState.creatorStarts = creatorStarts;
  draftState.lifeCycleStage = 0;
};

//data sent by the server to the joiner
const applyJoinedOnServer = (
  draftState,
  creatorName,
  creatorToken,
  timeControl,
  creatorStarts
) => {
  //if life cycle stage is already 1, it means we already joined
  if (draftState.lifeCycleStage === 1) return;
  draftState.creatorStarts = creatorStarts;
  draftState.names[0] = creatorName;
  draftState.tokens[0] = creatorToken;
  draftState.timeControl = timeControl;
  const startSeconds = timeControl.duration * 60;
  draftState.moveHistory[0].timeLeft = [startSeconds, startSeconds];
  draftState.lifeCycleStage = 1;
};

const applyJoinerJoined = (draftState, joinerName, joinerToken) => {
  //if life cycle stage is already 1, it means the joiner already joined
  if (draftState.lifeCycleStage === 1) return;
  draftState.names[1] = joinerName;
  draftState.tokens[1] = joinerToken;
  draftState.lifeCycleStage = 1;
};

const applyReceivedGame = (draftState, serverGame) => {
  applyAddCreator(
    draftState,
    serverGame.timeControl,
    serverGame.playerNames[0],
    serverGame.playerTokens[0]
  );
  applyCreatedOnServer(
    draftState,
    serverGame.joinCode,
    serverGame.creatorStarts
  );
  applyJoinerJoined(
    draftState,
    serverGame.playerNames[1],
    serverGame.playerTokens[1]
  );
  for (let k = 0; k < serverGame.moveHistory.length; k++) {
    const actions = serverGame.moveHistory[k].actions;
    const tLeft = serverGame.moveHistory[k].remainingTime;
    applyMove(draftState, actions, tLeft, k + 1);
  }
  draftState.gameWins = serverGame.gameWins;
  draftState.winner = serverGame.winner;
  draftState.finishReason = serverGame.finishReason;
  draftState.lifeCycleStage = 4;
};

//applies the move number 'moveIndex', consisting of the action(s) in 'actions',
//'timeLeftAfterMove' is the time left by the player who made the move
const applyMove = (draftState, actions, timeLeftAfterMove, moveIndex) => {
  //only in life cycle stages 1,2,3 players can make move
  if (draftState.lifeCycleStage < 1 || draftState.lifeCycleStage > 3) return;
  //make the move only if it is the next one (safety measure against desync issues)
  const tc = turnCount(draftState);
  if (tc !== moveIndex - 1) return;

  const idxToMove = indexToMove(draftState);
  const otherIdx = idxToMove === 0 ? 1 : 0;
  const newPlayerPos = cloneDeep(draftState.moveHistory[tc].playerPos);
  const newGrid = cloneDeep(draftState.moveHistory[tc].grid);
  const newTimeLeft = cloneDeep(draftState.moveHistory[tc].timeLeft);
  const wallCounts = cloneDeep(draftState.moveHistory[tc].wallCounts);
  newTimeLeft[idxToMove] = timeLeftAfterMove;
  for (let k = 0; k < actions.length; k++) {
    const aPos = actions[k];
    const aType = cellTypeByPos(aPos);
    if (aType === "Ground") {
      newPlayerPos[idxToMove] = aPos;
      if (posEq(aPos, goals[idxToMove])) {
        const pToMoveStarted = tc % 2 === 0;
        const otherIsWithinOneMove = isDistanceAtMost(
          newGrid,
          newPlayerPos[otherIdx],
          goals[otherIdx],
          2
        );
        if (pToMoveStarted && otherIsWithinOneMove) {
          draftState.winner = "draw";
          draftState.gameWins[0] += 0.5;
          draftState.gameWins[1] += 0.5;
        } else {
          draftState.winner = idxToMove === 0 ? "creator" : "joiner";
          draftState.gameWins[idxToMove] += 1;
        }
        draftState.finishReason = "goal";
        draftState.lifeCycleStage = 4;
      }
    } else if (aType === "Wall") {
      newGrid[aPos.r][aPos.c] = idxToMove + 1;
      wallCounts[idxToMove] += 1;
    } else console.error("unexpected action type", aType);
  }
  draftState.moveHistory.push({
    index: tc + 1,
    actions: actions,
    grid: newGrid,
    playerPos: newPlayerPos,
    timeLeft: newTimeLeft,
    distances: [
      distance(newGrid, newPlayerPos[0], goals[0]),
      distance(newGrid, newPlayerPos[1], goals[1]),
    ],
    wallCounts: wallCounts,
  });

  if (draftState.lifeCycleStage === 1 && tc === 0)
    draftState.lifeCycleStage = 2;
  else if (draftState.lifeCycleStage === 2 && tc === 1)
    draftState.lifeCycleStage = 3;

  //ghost actions are cleared when a move actually happens
  draftState.ghostAction = null;

  //if the player is looking at a previous move, when a move happens
  //they are automatically switched to viewing the new move
  draftState.viewIndex = tc + 1;

  //apply premoves, if any
  if (draftState.premoveActions.length > 0) {
    const acts = draftState.premoveActions;
    draftState.premoveActions = [];
    for (let k = 0; k < acts.length; k++)
      applySelectedCell(draftState, acts[k], true, false);
  }
};

//manage the state change on click or keyboard press. this may
//change the ghost action (which is only shown to this client), or
//make a full move, in which case it is also sent to the other client
const applySelectedCell = (draftState, pos, clientToMove, shouldPlaySound) => {
  if (!clientToMove) {
    applySelectedCellPremove(draftState, pos);
    return;
  }
  if (draftState.lifeCycleStage < 1) return; //cannot move til player 2 joins
  if (draftState.lifeCycleStage > 3) return; //cannot move if game finished
  //can only move if looking at current position
  if (draftState.viewIndex !== turnCount(draftState)) return;
  //out of bounds position, can happen when using the keyboard keys
  if (pos.r < 0 || pos.r >= boardDims.h || pos.c < 0 || pos.c >= boardDims.w)
    return;

  const selectedType = cellTypeByPos(pos);
  //there's a rule that the first move by each player must be a move
  if (draftState.lifeCycleStage < 3 && selectedType === "Wall") return;

  const idx = indexToMove(draftState);
  const otherIdx = idx === 0 ? 1 : 0;
  const gType = ghostType(draftState.ghostAction);
  const extraWalls = gType === "Wall" ? [draftState.ghostAction] : [];
  const tc = turnCount(draftState);
  let curPos = draftState.moveHistory[tc].playerPos[idx];
  if (selectedType === "Wall" && gType === "Ground")
    curPos = draftState.ghostAction;
  const actCount = countActions(
    draftState.moveHistory[tc].grid,
    pos,
    curPos,
    draftState.moveHistory[tc].playerPos[otherIdx],
    goals[idx],
    goals[otherIdx],
    extraWalls
  );
  if (actCount > 2) return; //clicked a ground cell at distance >2

  //variables to store the outcome of the click, if any.
  //in the case analysis below, if we detect that the click does
  //not trigger any change, we simply return
  //see docs/moveLogic.md for the description of the case analysis
  let [fullMoveActions, newGhostAction] = [null, null];
  if (gType === "None") {
    if (selectedType === "Wall") {
      if (actCount === 1) newGhostAction = pos;
      else return;
    } else if (selectedType === "Ground") {
      if (actCount === 1) newGhostAction = pos;
      else if (actCount === 2) fullMoveActions = [pos];
      else return;
    }
  } else if (gType === "Wall") {
    if (selectedType === "Wall") {
      if (posEq(draftState.ghostAction, pos)) newGhostAction = null;
      else if (actCount === 1) fullMoveActions = [pos, draftState.ghostAction];
      else return;
    } else if (selectedType === "Ground") {
      if (actCount === 0) newGhostAction = null;
      else if (actCount === 1) fullMoveActions = [pos, draftState.ghostAction];
      else return;
    }
  } else if (gType === "Ground") {
    if (selectedType === "Wall") {
      if (actCount === 1) fullMoveActions = [pos, draftState.ghostAction];
      else return;
    } else if (selectedType === "Ground") {
      if (actCount === 0) newGhostAction = null;
      else if (actCount === 1) {
        if (posEq(pos, draftState.ghostAction)) newGhostAction = null;
        else newGhostAction = pos;
      } else if (actCount === 2) fullMoveActions = [pos];
      else return;
    }
  } else {
    console.error("unexpected ghost type", gType);
  }

  if (fullMoveActions) {
    const idx = indexToMove(draftState);
    const tc = turnCount(draftState);
    let tLeft = draftState.moveHistory[tc].timeLeft[idx];
    //we don't add the increment until the clocks start running (stage 3)
    if (draftState.lifeCycleStage === 3)
      tLeft += draftState.timeControl.increment;
    draftState.moveToSend = { actions: fullMoveActions, remainingTime: tLeft };
    if (shouldPlaySound && draftState.isVolumeOn) playMoveSound();
    applyMove(draftState, fullMoveActions, tLeft, turnCount(draftState) + 1);
  } else {
    draftState.ghostAction = newGhostAction;
  }
};

//manage the state change on click or keyboard press.
//dual function of applySelectedCell for when it's not your turn
const applySelectedCellPremove = (draftState, pos) => {
  if (draftState.lifeCycleStage > 3) return; //cannot premove if game finished
  //can only premove if looking at current position
  if (draftState.viewIndex !== turnCount(draftState)) return;
  //out of bounds position, can happen when using the keyboard keys
  if (pos.r < 0 || pos.r >= boardDims.h || pos.c < 0 || pos.c >= boardDims.w)
    return;
  const selectedType = cellTypeByPos(pos);
  //there's a rule that the first move by each player must be a move
  if (draftState.lifeCycleStage < 2 && selectedType === "Wall") return;

  const idx = indexToMove(draftState) === 0 ? 1 : 0;
  const otherIdx = idx === 0 ? 1 : 0;
  const tc = turnCount(draftState);
  const premoveWalls = [];
  let premoveGround = null;
  for (let k = 0; k < draftState.premoveActions.length; k++) {
    const act = draftState.premoveActions[k];
    if (cellTypeByPos(act) === "Wall") premoveWalls.push(act);
    else premoveGround = act;
  }
  let curPos = draftState.moveHistory[tc].playerPos[idx];
  if (selectedType === "Wall" && premoveGround) curPos = premoveGround;
  const actCount = countActions(
    draftState.moveHistory[tc].grid,
    pos,
    curPos,
    draftState.moveHistory[tc].playerPos[otherIdx],
    goals[idx],
    goals[otherIdx],
    premoveWalls
  );
  let premoveGroundDist = null;
  if (premoveGround)
    premoveGroundDist = countActions(
      draftState.moveHistory[tc].grid,
      premoveGround,
      draftState.moveHistory[tc].playerPos[idx],
      draftState.moveHistory[tc].playerPos[otherIdx],
      goals[idx],
      goals[otherIdx],
      premoveWalls
    );

  if (actCount > 2) return;

  //see docs/moveLogic.md for the description of the case analysis below
  let premoveState;
  if (draftState.premoveActions.length === 0) premoveState = "Empty";
  else if (!premoveGround && premoveWalls.length === 1) premoveState = "Wall";
  else if (!premoveGround && premoveWalls.length === 2)
    premoveState = "WallWall";
  else if (premoveGround && premoveWalls.length === 1)
    premoveState = "GroundWall";
  else if (premoveGround && premoveGroundDist === 1)
    premoveState = "GroundDist1";
  else if (premoveGround && premoveGroundDist === 2)
    premoveState = "GroundDist2";
  else {
    console.error(
      "Unknown premove state",
      premoveGround,
      premoveWalls,
      actCount,
      premoveGroundDist
    );
    return;
  }

  let newPremoveActions = null;
  if (posEq(pos, curPos)) {
    if (draftState.premoveActions.length === 0) return;
    else {
      //selecting the current position undoes any premoves
      draftState.premoveActions = [];
      return;
    }
  }

  let [W, W2] = [null, null];
  if (premoveWalls.length === 1) [W, W2] = [premoveWalls[0], null];
  else if (premoveWalls.length === 2)
    [W, W2] = [premoveWalls[0], premoveWalls[1]];
  if (premoveState === "Empty") {
    if (selectedType === "Wall") {
      if (actCount === 1) newPremoveActions = [pos];
      else return;
    } else if (selectedType === "Ground") {
      if (actCount === 1 || actCount === 2) newPremoveActions = [pos];
      else console.error("unreachable case");
    }
  } else if (premoveState === "Wall") {
    if (selectedType === "Wall") {
      if (posEq(W, pos)) newPremoveActions = [];
      else if (actCount === 1) newPremoveActions = [W, pos];
      else return;
    } else if (selectedType === "Ground") {
      if (actCount === 1) newPremoveActions = [W, pos];
      else return;
    }
  } else if (premoveState === "WallWall") {
    if (selectedType === "Wall") {
      if (posEq(W, pos)) newPremoveActions = [W2];
      else if (posEq(W2, pos)) newPremoveActions = [W];
      else return;
    } else if (selectedType === "Ground") {
      return;
    }
  } else if (premoveState === "GroundDist1") {
    if (selectedType === "Wall") {
      if (actCount === 1) newPremoveActions = [premoveGround, pos];
      else return;
    } else if (selectedType === "Ground") {
      if (posEq(pos, premoveGround)) newPremoveActions = [];
      else newPremoveActions = [pos];
    }
  } else if (premoveState === "GroundDist2") {
    if (selectedType === "Wall") return;
    else if (selectedType === "Ground") {
      if (posEq(pos, premoveGround)) newPremoveActions = [];
      else newPremoveActions = [pos];
    }
  } else if (premoveState === "GroundWall") {
    if (selectedType === "Wall") {
      if (posEq(pos, W)) newPremoveActions = [premoveGround];
      else return;
    } else if (selectedType === "Ground") {
      if (posEq(pos, premoveGround)) newPremoveActions = [W];
      else if (actCount === 1) newPremoveActions = [W, pos];
      else return;
    }
  } else {
    console.error("unexpected premove state case", premoveState);
  }
  if (newPremoveActions) draftState.premoveActions = newPremoveActions;
};

const closeDialogs = (draftState) => {
  draftState.showRematchDialog = false;
  draftState.showDrawDialog = false;
  draftState.showTakebackDialog = false;
};
const applyDrawGame = (draftState, finishReason) => {
  if (draftState.lifeCycleStage !== 3) return;
  if (draftState.isVolumeOn) playMoveSound();
  draftState.lifeCycleStage = 4;
  draftState.winner = "draw";
  draftState.gameWins[0] += 0.5;
  draftState.gameWins[1] += 0.5;
  draftState.finishReason = finishReason;
  draftState.ghostAction = null;
  closeDialogs(draftState);
};
const applyResignGame = (draftState, resignerIsCreator) => {
  if (draftState.lifeCycleStage !== 3) return;
  draftState.lifeCycleStage = 4;
  draftState.winner = resignerIsCreator ? "joiner" : "creator";
  draftState.gameWins[resignerIsCreator ? 1 : 0] += 1;
  draftState.finishReason = "resign";
  draftState.ghostAction = null;
  closeDialogs(draftState);
};
const applyLeaveGame = (draftState, leaverIsCreator) => {
  draftState.opponentLeft = true;
  if (draftState.lifeCycleStage === 4) return;
  draftState.lifeCycleStage = 4;
  draftState.winner = leaverIsCreator ? "joiner" : "creator";
  draftState.gameWins[leaverIsCreator ? 1 : 0] += 1;
  draftState.finishReason = "disconnect";
  draftState.ghostAction = null;
  closeDialogs(draftState);
};
const applyTakeback = (draftState, requesterIsCreator) => {
  draftState.showTakebackDialog = false;
  if (draftState.lifeCycleStage !== 2 && draftState.lifeCycleStage !== 3)
    return;
  const requesterToMove = requesterIsCreator === creatorToMove(draftState);
  const numMovesToUndo = requesterToMove ? 2 : 1;
  for (let k = 0; k < numMovesToUndo; k++) draftState.moveHistory.pop();
  draftState.ghostAction = null;
  const tc = turnCount(draftState);
  draftState.viewIndex = tc;
  if (tc === 0) draftState.lifeCycleStage = 1;
  else if (tc === 1) draftState.lifeCycleStage = 2;
};
const applySetupRematch = (draftState) => {
  if (draftState.lifeCycleStage !== 4) return;
  draftState.creatorStarts = !draftState.creatorStarts;
  const newGrid = emptyGrid(boardDims);
  draftState.moveHistory = [
    {
      index: 0,
      actions: [],
      grid: newGrid,
      playerPos: initialPlayerPos,
      timeLeft: [
        draftState.timeControl.duration * 60,
        draftState.timeControl.duration * 60,
      ],
      distances: [
        distance(newGrid, initialPlayerPos[0], goals[0]),
        distance(newGrid, initialPlayerPos[1], goals[1]),
      ],
      wallCounts: [0, 0],
    },
  ];
  draftState.winner = "";
  draftState.finishReason = "";
  draftState.lifeCycleStage = 1;
  draftState.viewIndex = 0;
  draftState.ghostAction = null;
  closeDialogs(draftState);
};
const applyAddExtraTime = (draftState, playerIndex) => {
  if (draftState.lifeCycleStage !== 3) return;
  const tc = turnCount(draftState);
  draftState.moveHistory[tc].timeLeft[playerIndex] += 60;
};
const applyClockTick = (draftState) => {
  //clocks only run after each player have made the first move,
  //and the game has not ended
  if (draftState.lifeCycleStage !== 3) return;
  const idx = indexToMove(draftState);
  const tc = turnCount(draftState);
  draftState.moveHistory[tc].timeLeft[idx] -= 1;
  if (draftState.moveHistory[tc].timeLeft[idx] === 0) {
    draftState.winner = idx === 0 ? "joiner" : "creator";
    draftState.gameWins[idx === 0 ? 1 : 0] += 1;
    draftState.finishReason = "time";
    draftState.lifeCycleStage = 4;
    draftState.ghostAction = null;
    closeDialogs(draftState);
  }
};

const GamePage = ({
  socket,
  //clientParams contains 'clientRole' as well as other fields that depend on the client role:
  //timeControl, name, token for Creator,
  //joinCode, name, token for Joiner, gameId for Spectator
  clientParams,
  returnToLobby,
  isLargeScreen,
  isDarkModeOn,
  handleToggleDarkMode,
}) => {
  const clientRole = clientParams.clientRole;

  //cosmetic state stored between sessions
  const [cookies, setCookie] = useCookies(["isVolumeOn", "zoomLevel"]);

  //the 'state' object contains every other piece of state
  const [state, updateState] = useImmer(createInitialState(cookies));

  //===================================================
  //communication FROM the server
  //===================================================
  useEffect(() => {
    socket.once("gameCreated", ({ joinCode, creatorStarts }) => {
      updateState((draftState) => {
        applyCreatedOnServer(draftState, joinCode, creatorStarts);
      });
    });
    socket.once(
      "gameJoined",
      ({ creatorName, creatorToken, timeControl, creatorStarts }) => {
        updateState((draftState) => {
          applyJoinedOnServer(
            draftState,
            creatorName,
            creatorToken,
            timeControl,
            creatorStarts
          );
        });
      }
    );
    socket.once("requestedGame", ({ game }) => {
      updateState((draftState) => {
        applyReceivedGame(draftState, game);
      });
    });
    socket.once("gameJoinFailed", () => {
      showToastNotification(
        "There is no game with this code waiting for someone to join.",
        5000
      );
      returnToLobby();
    });
    socket.on("gameNotFoundError", () => {
      showToastNotification(
        "There was an issue on the server and we couldn't reach the other player.",
        5000
      );
      updateState((draftState) => {
        draftState.waitingForPing = 0;
      });
    });
    socket.once("joinerJoined", ({ joinerName, joinerToken }) => {
      updateState((draftState) => {
        if (draftState.lifeCycleStage === 1) return;
        if (draftState.isVolumeOn) playMoveSound();
        applyJoinerJoined(draftState, joinerName, joinerToken);
      });
    });

    socket.on("drawOffered", () => {
      updateState((draftState) => {
        draftState.showDrawDialog = true;
        draftState.waitingForPing = 0;
      });
    });
    socket.on("drawRejected", () => {
      showToastNotification("The opponent declined the draw offer.", 5000);
      updateState((draftState) => {
        draftState.waitingForPing = 0;
      });
    });
    socket.on("drawAccepted", () => {
      showToastNotification("The opponent accepted the draw offer.", 5000);
      updateState((draftState) => {
        applyDrawGame(draftState, "agreement");
        draftState.waitingForPing = 0;
      });
    });
    socket.on("takebackRequested", () => {
      updateState((draftState) => {
        draftState.showTakebackDialog = true;
        draftState.waitingForPing = 0;
      });
    });
    socket.on("takebackRejected", () => {
      showToastNotification(
        "The opponent declined the takeback request.",
        5000
      );
      updateState((draftState) => {
        draftState.waitingForPing = 0;
      });
    });
    socket.on("takebackAccepted", () => {
      showToastNotification("The opponent agreed to the takeback.", 5000);
      updateState((draftState) => {
        const requesterIsCreator = clientRole === "Creator";
        applyTakeback(draftState, requesterIsCreator);
        draftState.waitingForPing = 0;
      });
    });
    socket.on("rematchOffered", () => {
      updateState((draftState) => {
        draftState.showRematchDialog = true;
        draftState.waitingForPing = 0;
      });
    });
    socket.on("rematchRejected", () => {
      showToastNotification("The opponent declined the rematch offer.", 5000);
      updateState((draftState) => {
        draftState.waitingForPing = 0;
      });
    });
    socket.on("rematchAccepted", () => {
      showToastNotification("The opponent accepted the rematch offer.", 5000);
      updateState((draftState) => {
        if (draftState.isVolumeOn) playMoveSound();
        applySetupRematch(draftState);
        draftState.waitingForPing = 0;
      });
    });
    socket.on("extraTimeReceived", () => {
      showToastNotification("The opponent added 60s to your clock.", 5000);
      updateState((draftState) => {
        const playerIndex = clientRole === "Creator" ? 0 : 1;
        applyAddExtraTime(draftState, playerIndex);
        draftState.waitingForPing = 0;
      });
    });
    socket.on("resigned", () => {
      showToastNotification("The opponent resigned.", 5000);
      updateState((draftState) => {
        if (draftState.isVolumeOn) playMoveSound();
        const resignerIsCreator = clientRole !== "Creator";
        applyResignGame(draftState, resignerIsCreator);
        draftState.waitingForPing = 0;
      });
    });
    socket.on("moved", ({ actions, moveIndex, remainingTime }) => {
      updateState((draftState) => {
        console.log(`move ${moveIndex} received (${remainingTime}s)`);
        if (draftState.isVolumeOn) playMoveSound();
        applyMove(draftState, actions, remainingTime, moveIndex);
        draftState.waitingForPing = 0;
      });
    });
    socket.on("leftGame", () => {
      showToastNotification("The opponent left the game.", 5000);

      updateState((draftState) => {
        const leaverIsCreator = clientRole === "Creator" ? false : true;
        applyLeaveGame(draftState, leaverIsCreator);
        draftState.waitingForPing = 0;
      });
    });
    socket.on("pongFromServer", () => {
      updateState((draftState) => {
        draftState.waitingForPing = 0;
      });
    });
    return () => {
      socket.removeAllListeners();
    };
  }, [socket, updateState, clientRole, returnToLobby]);

  //===================================================
  //communication TO the server
  //===================================================
  //first contact to server
  useEffect(() => {
    //first contact only from lifecycle stage -2
    if (state.lifeCycleStage !== -2) return;
    if (clientRole === "Creator") {
      updateState((draftState) => {
        applyAddCreator(
          draftState,
          clientParams.timeControl,
          clientParams.name,
          clientParams.token
        );
      });
      socket.emit("createGame", {
        name: clientParams.name,
        timeControl: clientParams.timeControl,
        token: clientParams.token,
      });
    } else if (clientRole === "Joiner") {
      updateState((draftState) => {
        applyAddJoiner(
          draftState,
          clientParams.joinCode,
          clientParams.name,
          clientParams.token
        );
      });
      socket.emit("joinGame", {
        joinCode: clientParams.joinCode,
        name: clientParams.name,
        token: clientParams.token,
      });
    } else if (clientRole === "Spectator") {
      socket.emit("getGame", { gameId: clientParams.gameId });
    } else {
      console.error("unknown client role", clientRole);
    }
  });

  const handleLeaveGame = () => {
    //tell the server to stop listening to events for this game
    socket.emit("leaveGame");
    returnToLobby();
  };
  const handleSendRematchOffer = () => {
    socket.emit("offerRematch");
  };
  const handleAnswerRematchOffer = (accepted) => {
    if (accepted) {
      socket.emit("acceptRematch");
      updateState((draftState) => {
        applySetupRematch(draftState);
      });
    } else {
      socket.emit("rejectRematch");
      updateState((draftState) => {
        draftState.showRematchDialog = false;
      });
    }
  };
  const handleOfferDraw = () => {
    socket.emit("offerDraw");
  };
  const handleAnswerDrawOffer = (accepted) => {
    if (accepted) {
      socket.emit("acceptDraw");
      updateState((draftState) => {
        applyDrawGame(draftState, "agreement");
      });
    } else {
      socket.emit("rejectDraw");
      updateState((draftState) => {
        draftState.showDrawDialog = false;
      });
    }
  };
  const handleRequestTakeback = () => {
    socket.emit("requestTakeback");
  };
  const handleAnswerTakebackRequest = (accepted) => {
    if (accepted) {
      showToastNotification(
        "The last move played on the board has been undone.",
        5000
      );
      socket.emit("acceptTakeback");
      updateState((draftState) => {
        const requesterIsCreator = clientRole === "Joiner";
        applyTakeback(draftState, requesterIsCreator);
      });
    } else {
      socket.emit("rejectTakeback");
      updateState((draftState) => {
        draftState.showTakebackDialog = false;
      });
    }
  };
  const handleGiveExtraTime = () => {
    socket.emit("giveExtraTime");
    updateState((draftState) => {
      const receiverIndex = clientRole === "Creator" ? 1 : 0;
      applyAddExtraTime(draftState, receiverIndex);
    });
  };
  const handleResign = () => {
    socket.emit("resign");
    updateState((draftState) => {
      applyResignGame(draftState, clientRole === "Creator");
    });
  };

  //===================================================
  //timers logic
  //===================================================
  //timer interval to update clocks every second
  useEffect(() => {
    const interval = setInterval(() => {
      updateState((draftState) => {
        applyClockTick(draftState);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [updateState]);

  //===================================================
  //ping logic
  //===================================================
  useEffect(() => {
    const interval = setInterval(() => {
      if (state.lifeCycleStage !== 3) return;
      if (state.waitingForPing === 1) {
        socket.emit("pingServer");
      } else if (state.waitingForPing === 2) {
        showToastNotification(
          "The server is not responding. The game is probably lost. Sorry for the inconvenience.",
          8000
        );
      }
      updateState((draftState) => {
        draftState.waitingForPing = (draftState.waitingForPing + 1) % 3;
      });
    }, pingInterval);
    return () => clearInterval(interval);
  }, [socket, state.lifeCycleStage, state.waitingForPing, updateState]);

  //===================================================
  //game logic when a player selects a board cell
  //===================================================

  //manage the state change on click or keyboard press. this may
  //change the ghost action (which is only shown to this client), or
  //make a full move, in which case it is also sent to the other client
  const handleSelectedCell = (pos) => {
    updateState((draftState) => {
      const clientToMove =
        creatorToMove(draftState) === (clientRole === "Creator");
      applySelectedCell(draftState, pos, clientToMove, true);
    });
  };

  useEffect(() => {
    if (state.moveToSend) {
      socket.emit("move", state.moveToSend);
      updateState((draftState) => {
        draftState.moveToSend = null;
      });
    }
  });

  //notify server if someone has won on time or by reaching the goal
  //this is necessary because the server does not keep its own clock
  //and does not understand the rules of the game
  useEffect(() => {
    //only the creator sends these messages to avoid duplicates
    if (clientRole !== "Creator") return;
    if (state.finishReason === "time") {
      socket.emit("playerWonOnTime", { winner: state.winner });
    }
    if (state.finishReason === "goal") {
      socket.emit("playerReachedGoal", { winner: state.winner });
    }
  }, [clientRole, socket, state.winner, state.finishReason]);

  const handleBoardClick = (clickedPos) => handleSelectedCell(clickedPos);

  //===================================================
  //handling keyboard inputs
  //===================================================
  useEffect(() => {
    window.addEventListener("keydown", downHandler);
    window.addEventListener("keyup", upHandler);
    return () => {
      window.removeEventListener("keydown", downHandler);
      window.removeEventListener("keyup", upHandler);
    };
  });
  const downHandler = ({ key }) => {
    //mechanism to avoid double-counting
    if (state.isKeyPressed) return;
    updateState((draftState) => {
      draftState.isKeyPressed = true;
    });
    if (key === "m") {
      handleToggleVolume();
      return;
    }

    //if the user is not looking at the latest position,
    //or if the game is over, arrows are used to navigate
    if (state.viewIndex < turnCount(state) || state.lifeCycleStage === 4) {
      if (key === "ArrowDown" || key === "ArrowRight") {
        if (state.viewIndex < turnCount(state)) {
          updateState((draftState) => {
            draftState.viewIndex += 1;
          });
        }
      } else if (key === "ArrowUp" || key === "ArrowLeft") {
        if (state.viewIndex > 0) {
          updateState((draftState) => {
            draftState.viewIndex -= 1;
          });
        }
      }
      return;
    }
    //normal case: use arrow keys to move the player token
    let p;
    if (state.ghostAction && ghostType(state.ghostAction) === "Ground")
      p = state.ghostAction;
    else {
      const tc = turnCount(state);
      p = state.moveHistory[tc].playerPos[indexToMove(state)];
    }
    if (key === "ArrowDown") p = { r: p.r + 2, c: p.c };
    else if (key === "ArrowUp") p = { r: p.r - 2, c: p.c };
    else if (key === "ArrowLeft") p = { r: p.r, c: p.c - 2 };
    else if (key === "ArrowRight") p = { r: p.r, c: p.c + 2 };
    else return;
    handleSelectedCell(p);
  };
  const upHandler = () => {
    updateState((draftState) => {
      draftState.isKeyPressed = false;
    });
  };

  //===================================================
  //logic related to navigating through the move history
  //===================================================
  const handleViewMove = (i) => {
    if (i < 0 || i > turnCount(state)) return;
    updateState((draftState) => {
      if (draftState.viewIndex === i) return;
      if (i > turnCount(draftState)) return;
      draftState.viewIndex = i;
      draftState.ghostAction = null;
    });
  };

  //move the inner scroll bar on move history to the end after each move
  useEffect(() => {
    const moveHistoryDiv = document.getElementById("movehistory");
    moveHistoryDiv.scrollTop = moveHistoryDiv.scrollHeight;
  }, [state.moveHistory]);

  const handleSeePreviousMove = () => handleViewMove(state.viewIndex - 1);
  const handleSeeNextMove = () => handleViewMove(state.viewIndex + 1);
  const handleSeeFirstMove = () => {
    handleViewMove(0);
    //move the inner scroll bar to the beginning
    const moveHistoryDiv = document.getElementById("movehistory");
    moveHistoryDiv.scrollTop = 0;
  };
  const handleSeeLastMove = () => {
    handleViewMove(turnCount(state));
    //move the inner scroll bar to the end
    const moveHistoryDiv = document.getElementById("movehistory");
    moveHistoryDiv.scrollTop = moveHistoryDiv.scrollHeight;
  };

  //===================================================
  //cosmetics logic
  //===================================================
  const handleToggleVolume = () => {
    setCookie("isVolumeOn", state.isVolumeOn ? "false" : "true", {
      path: "/",
    });
    updateState((draftState) => {
      draftState.isVolumeOn = !draftState.isVolumeOn;
    });
  };
  const handleIncreaseBoardSize = () => {
    if (state.zoomLevel < 10)
      setCookie("zoomLevel", state.zoomLevel + 1, { path: "/" });
    updateState((draftState) => {
      if (draftState.zoomLevel < 10) draftState.zoomLevel += 1;
    });
  };
  const handleDecreaseBoardSize = () => {
    if (state.zoomLevel > 0)
      setCookie("zoomLevel", state.zoomLevel - 1, { path: "/" });
    updateState((draftState) => {
      if (draftState.zoomLevel > 0) draftState.zoomLevel -= 1;
    });
  };

  //===================================================
  //handle browser's back arrow / history
  //===================================================
  const onBackButtonEvent = (e) => {
    e.preventDefault();
    updateState((draftState) => {
      draftState.showBackButtonWarning = true;
    });
  };
  const handleAnswerConfirmBackButton = (confirmed) => {
    if (confirmed) {
      updateState((draftState) => {
        draftState.showBackButtonWarning = false;
      });
      handleLeaveGame();
    } else {
      updateState((draftState) => {
        draftState.showBackButtonWarning = false;
      });
    }
  };
  useEffect(() => {
    window.history.pushState(null, null, window.location.pathname);
    window.addEventListener("popstate", onBackButtonEvent);
    return () => window.removeEventListener("popstate", onBackButtonEvent);
  });

  //===================================================
  //preparing props for rendering
  //===================================================
  //after the game is over, the players can see how much time they
  //had left at each move. During the game, they ALWAYS see the current time
  let displayTime1, displayTime2;
  if (state.lifeCycleStage === 4) {
    [displayTime1, displayTime2] = state.moveHistory[state.viewIndex].timeLeft;
  } else {
    const tc = turnCount(state);
    [displayTime1, displayTime2] = state.moveHistory[tc].timeLeft;
  }

  let [gSize, wWidth] = isLargeScreen
    ? [globalSettings.groundSize, globalSettings.wallWidth]
    : [
        globalSettings.smallScreenGroundSize,
        globalSettings.smallScreenWallWidth,
      ];
  const scalingFactor = Math.pow(1.1, state.zoomLevel - 5);
  const scaledGroundSize = gSize * scalingFactor;
  const scaledWallWidth = wWidth * scalingFactor;
  const boardHeight =
    (scaledWallWidth * (boardDims.h - 1)) / 2 +
    (scaledGroundSize * (boardDims.h + 1)) / 2;
  const boardWidth =
    (scaledWallWidth * (boardDims.w - 1)) / 2 +
    (scaledGroundSize * (boardDims.w + 1)) / 2;

  const gapSize = isLargeScreen ? 15 : 6;
  let gridTemplateRows, gridTemplateColumns, gridTemplateAreas;
  if (isLargeScreen) {
    const timersHeight = 100;
    const controlPanelWidth = 360;
    gridTemplateRows = `${timersHeight}px ${boardHeight}px`;
    gridTemplateColumns = `${boardWidth}px ${controlPanelWidth}px`;
    gridTemplateAreas = "'timer status' 'board panel'";
  } else {
    const timersHeight = 50;
    const statusHeaderHeight = 80;
    gridTemplateRows = `${timersHeight}px ${boardHeight}px ${statusHeaderHeight}px ${boardHeight}px`;
    gridTemplateColumns = `${boardWidth}px`;
    gridTemplateAreas = "'timer' 'board' 'status' 'panel'";
  }

  return (
    <div className={isDarkModeOn ? "teal darken-4" : undefined}>
      <Header
        gameName={clientRole === "Spectator" ? "" : state.joinCode}
        helpText={GameHelp()}
        isLargeScreen={isLargeScreen}
        isDarkModeOn={isDarkModeOn}
        handleToggleDarkMode={handleToggleDarkMode}
      />
      <div
        style={{
          display: "grid",
          gridTemplateRows: gridTemplateRows,
          gridTemplateColumns: gridTemplateColumns,
          gridTemplateAreas: gridTemplateAreas,
          columnGap: `${gapSize}px`,
          rowGap: `${gapSize}px`,
          margin: `${gapSize}px`,
          justifyContent: "center",
          alignContent: "center",
        }}
      >
        <TimerHeader
          lifeCycleStage={state.lifeCycleStage}
          names={state.names}
          indexToMove={indexToMove(state)}
          playerColors={globalSettings.playerColors}
          timeLeft={[displayTime1, displayTime2]}
          isLargeScreen={isLargeScreen}
          scores={state.gameWins}
        />
        <StatusHeader
          lifeCycleStage={state.lifeCycleStage}
          names={state.names}
          indexToMove={indexToMove(state)}
          winner={state.winner}
          finishReason={state.finishReason}
          timeControl={state.timeControl}
          creatorStarts={state.creatorStarts}
          isLargeScreen={isLargeScreen}
        />
        <Board
          creatorToMove={creatorToMove(state)}
          playerColors={globalSettings.playerColors}
          grid={state.moveHistory[state.viewIndex].grid}
          playerPos={state.moveHistory[state.viewIndex].playerPos}
          goals={goals}
          ghostAction={state.ghostAction}
          premoveActions={state.premoveActions}
          handleClick={handleBoardClick}
          groundSize={scaledGroundSize}
          wallWidth={scaledWallWidth}
          isDarkModeOn={isDarkModeOn}
          tokens={state.tokens}
        />
        <ControlPanel
          lifeCycleStage={state.lifeCycleStage}
          handleResign={handleResign}
          handleOfferDraw={handleOfferDraw}
          handleRequestTakeback={handleRequestTakeback}
          handleGiveExtraTime={handleGiveExtraTime}
          moveHistory={state.moveHistory}
          playerColors={globalSettings.playerColors}
          clientRole={clientRole}
          creatorStarts={state.creatorStarts}
          handleViewMove={handleViewMove}
          viewIndex={state.viewIndex}
          turnCount={turnCount(state)}
          handleSeeFirstMove={handleSeeFirstMove}
          handleSeePreviousMove={handleSeePreviousMove}
          handleSeeNextMove={handleSeeNextMove}
          handleSeeLastMove={handleSeeLastMove}
          handleToggleVolume={handleToggleVolume}
          isVolumeOn={state.isVolumeOn}
          handleLeaveGame={handleLeaveGame}
          isDarkModeOn={isDarkModeOn}
          handleIncreaseBoardSize={handleIncreaseBoardSize}
          handleDecreaseBoardSize={handleDecreaseBoardSize}
          zoomLevel={state.zoomLevel}
          boardHeight={boardHeight}
        />
      </div>
      {state.lifeCycleStage === 4 && clientRole !== "Spectator" && (
        <Row className="valign-wrapper" style={{ marginTop: "1rem" }}>
          <Col className="center" s={12}>
            <Button
              large
              className="red"
              node="button"
              waves="light"
              onClick={() => {
                showToastNotification(
                  "A rematch offer was sent to the opponent. A new game " +
                    "will start if they accept.",
                  5000
                );
                handleSendRematchOffer();
              }}
              disabled={state.opponentLeft}
            >
              Rematch
            </Button>
          </Col>
        </Row>
      )}
      <Dialog
        isOpen={state.showBackButtonWarning}
        title="Return to lobby"
        body={
          "Are you sure you want to return to the lobby? You will " +
          "not be able to rejoin this game."
        }
        acceptButtonText="Quit game"
        rejectButtonText="Stay in game"
        callback={handleAnswerConfirmBackButton}
      />
      <Dialog
        isOpen={state.showDrawDialog}
        title="Draw offer received"
        body="The opponent offered a draw."
        acceptButtonText="Accept"
        rejectButtonText="Decline"
        callback={handleAnswerDrawOffer}
      />
      <Dialog
        isOpen={state.showRematchDialog}
        title="Rematch offer received"
        body="The opponent would like a rematch."
        acceptButtonText="Accept"
        rejectButtonText="Decline"
        callback={handleAnswerRematchOffer}
      />
      <Dialog
        isOpen={state.showTakebackDialog}
        title="Takeback request received"
        body={
          "The opponent requested a takeback. If you accept, their " +
          "last move will be undone."
        }
        acceptButtonText="Accept"
        rejectButtonText="Decline"
        callback={handleAnswerTakebackRequest}
      />
    </div>
  );
};

export default GamePage;
