import React from "react";

const GameHelp = () => (
  <div>
    <h6>
      To connect with your friend, share the game code in the top header with
      them and tell them to use it when clicking "Join Game" from the lobby.
    </h6>
    <h6>Rules of the game:</h6>
    <h6>
      The player who created the game starts at the top left corner (color red).
      The player who joined the game starts at the top right (color blue). The
      goal of each player is to reach the <em>opposite</em> corner from where
      they start. The player who gets there first, wins.
    </h6>
    <h6>
      Players move by clicking cells on the board. There are two types of cells:
      ground cells (the big squares) and walls (the thin rectangles in between
      ground cells). Each move consists of a total of two actions. One action
      can be building one wall or moving to an adjacent cell (a diagonal move
      counts as two actions).
    </h6>
    <h6>
      Players can build walls to obstruct the opponent. Walls can be built
      anywhere as long as there always exists at least one way to get to their
      goal.
    </h6>
    <h6>
      The remaining time for each player is shown next to their name. The clock
      of a player ticks down when it is their turn (after each player has moved
      once). The player who starts is chosen randomly. The name of the player to
      move next is highlighted with their color.
    </h6>
    <h6>
      If it is your turn and you do a single action, like building a wall or
      moving to an adjacent cell, you can undo it by clicking the wall again or
      clicking a different ground cell, respectively. Once you choose 2 actions,
      the move becomes permanent.
    </h6>
    <h6>Special rules:</h6>
    <h6>(1) no walls can be placed during the first move of each player.</h6>
    <h6>
      (2) if the player who moved first reaches the goal first but the other
      player is at distance 1 or 2 from her goal, the game ends in a draw.
    </h6>
    <h6>
      Note: if you return to the lobby, you will not be able to reenter this
      game!
    </h6>
  </div>
);

export default GameHelp;