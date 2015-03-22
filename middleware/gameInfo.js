var gameInfo = {
    usersOnline : [],
    crossPlayer: '',
    circlePlayer: '',
    gameStarted: false,
    gameFinished: false,
    waitingForOpponent: false,
    filledCells: [],
    turnToHit: "",
    lastHitPlayer: '',
    chatMessages: []
};
module.exports = gameInfo;
