module.exports = {
  //client-server messages
  connectionMsg: "connection", //reserved socket.io message
  disconnectMsg: "disconnect", //reserved socket.io message
  createGameMsg: "createGame",
  gameCreatedMsg: "gameCreated",
  pingServerMsg: "pingServer",
  pongFromServerMsg: "pongFromServer",

  //client-server-client messages
  joinGameMsg: "joinGame",
  gameJoinedMsg: "gameJoined",
  gameJoinFailedMsg: "gameJoinFailed",
  joinSelfGameFailedMsg: "joinSelfGameFailed",
  joinerJoinedMsg: "joinerJoined",
  moveMsg: "move",
  movedMsg: "moved",
  gameNotFoundErrorMsg: "gameNotFoundError",
  resignMsg: "resign",
  resignedMsg: "resigned",
  leaveGameMsg: "leaveGame",
  leftGameMsg: "leftGame",
  abandonedGameMsg: "abandonedGame",
  playerWonOnTimeMsg: "playerWonOnTime",
  playerReachedGoalMsg: "playerReachedGoal",
  giveExtraTimeMsg: "giveExtraTime",
  extraTimeReceivedMsg: "extraTimeReceived",
  offerRematchMsg: "offerRematch",
  rematchOfferedMsg: "rematchOffered",
  rejectRematchMsg: "rejectRematch",
  rematchRejectedMsg: "rematchRejected",
  acceptRematchMsg: "acceptRematch",
  rematchAcceptedMsg: "rematchAccepted",
  offerDrawMsg: "offerDraw",
  drawOfferedMsg: "drawOffered",
  acceptDrawMsg: "acceptDraw",
  drawAcceptedMsg: "drawAccepted",
  rejectDrawMsg: "rejectDraw",
  drawRejectedMsg: "drawRejected",
  requestTakebackMsg: "requestTakeback",
  takebackRequestedMsg: "takebackRequested",
  acceptTakebackMsg: "acceptTakeback",
  takebackAcceptedMsg: "takebackAccepted",
  rejectTakebackMsg: "rejectTakeback",
  takebackRejectedMsg: "takebackRejected",
  checkHasOngoingGameMsg: "checkHasOngoingGame",
  respondHasOngoingGameMsg: "respondHasOngoingGame",
  returnToOngoingGameMsg: "returnToOngoingGame",
  returnedToOngoingGameMsg: "returnedToOngoingGame",
  ongoingGameNotFoundMsg: "ongoingGameNotFound",
  opponentReturnedMsg: "opponentReturned",
  newChallengeMsg: "newChallenge",
  deadChallengeMsg: "deadChallenge",

  //HTTP-like GET messages
  getGameMsg: "getGame",
  requestedGameMsg: "requestedGame",
  getRandomGameMsg: "getRandomGame",
  requestedRandomGameMsg: "requestedRandomGame",
  randomGameNotFoundMsg: "randomGameNotFound",
  getRecentGamesMsg: "getRecentGames",
  requestedRecentGamesMsg: "requestedRecentGames",
  recentGamesNotFoundMsg: "recentGamesNotFound",
  requestCurrentChallengesMsg: "requestCurrentChallenges",
  requestedCurrentChallengesMsg: "requestedCurrentChallenges",
};
