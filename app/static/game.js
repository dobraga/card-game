export default function createGame() {
  const state = {
    players: {},
    round: {},
    qtdPlayers: 0,
  };

  // Set owner round
  function setOwnerRound(command) {
    if (command.round) {
      state.round.card = command.round.card;
      state.round.current = command.round.player;
    }
  }

  // Add a player
  function addPlayer(command) {
    const id = command.id;

    state.players[id] = {
      wins: [],
      round: {
        finished: false,
        card: null,
      },
    };
    state.qtdPlayers += 1;
    console.log(`New client connected: "${id}", have ${qtdPlayers()} players.`);
  }

  // Set cards
  function setCardsHand(command) {
    state.players[command.id].hand = command.cards;
  }

  // Remove the player
  function removePlayer(command) {
    const id = command.id;
    console.log(`Client ${id} disconnected`);
    delete state.players[id];
    state.qtdPlayers -= 1;
  }

  // Get list of players
  function getPlayers() {
    return Object.keys(state.players);
  }

  // Set state on setup
  function setState(newState) {
    Object.assign(state, newState);
  }

  // Check if all players finished
  function allPlayersFinished() {
    let finished = true;
    for (const check_id of getPlayers()) {
      finished =
        finished &&
        (yourTurn(check_id) || state.players[check_id].round.finished);
    }
    return finished;
  }

  // Check is blocked
  function isBlocked(id) {
    let check;
    if (yourTurn(id)) {
      if (qtdPlayers() == 1) {
        check = true;
      } else {
        check = !allPlayersFinished();
      }
    } else {
      check = youFinished(id);
    }
    console.log(`= is blocked ${id}? ${check}`);
    return check;
  }

  // Check if is your turn
  function yourTurn(id) {
    if (state.players[id] != undefined) {
      return state.round.current == id;
    }
    return false;
  }

  // Check if the user finish the round
  function youFinished(id) {
    if (state.players[id] != undefined) {
      return state.players[id].round.finished;
    }
    return false;
  }

  // Finish round and prepare next round
  function finishRound(command) {
    state.players[command.id].round.finished = true;
    state.players[command.id].round.card = command.card;
    state.players[command.id].round.index = command.index;
    state.players[command.id].round.nextCard = command.nextCard;
  }

  // Buy card
  function buyCard(command) {
    const id = command.id;
    const index = state.players[id].round.index;
    const nextCard = state.players[id].round.nextCard;
    state.players[id].hand[index] = nextCard;
  }

  // Get selected cards
  function getSelectedCards() {
    const selectedCards = {};
    for (const id of getPlayers()) {
      if (state.players[id].round.card != undefined) {
        selectedCards[id] = state.players[id].round.card;
      } else {
        selectedCards[id] = 'espera os doentes escolherem as cartas';
      }
    }
    return selectedCards;
  }

  // Get position of selected card
  function positionCard(command) {
    return state.players[command.id].hand.indexOf(command.card);
  }

  // Get possible cards
  function getMyCards(id) {
    if (state.players[id] != undefined) {
      return state.players[id].hand;
    }
  }

  // # players
  function qtdPlayers() {
    return state.qtdPlayers;
  }

  // # where the player wins
  function qtdWins(id) {
    return state.players[id].wins.length;
  }

  // Set next turn
  function nextTurn() {
    const players = getPlayers();
    const currentPosition = players.indexOf(state.round.current);
    let newPosition = currentPosition + 1;
    if (currentPosition >= qtdPlayers() - 1) {
      newPosition = 0;
    }

    const newPlayerTurn = players[newPosition];
    console.log(
      `Turn pass from "${state.round.current}(position: ${currentPosition})" to "${newPlayerTurn}(position: ${newPosition})"`
    );
    state.round.current = newPlayerTurn;
  }

  // Set winner and setup the next round
  function setWinnerSetupNextTurn(command) {
    state.players[command.winner].wins.push(command);
    for (const id of getPlayers()) {
      if (yourTurn(id)) {
        continue
      }
      buyCard({id: id});
      state.players[id].round = { finished: false, card: null };
    }
    state.round.card = command.newCard;
  }

  return {
    state,
    setOwnerRound,
    addPlayer,
    removePlayer,
    setState,
    isBlocked,
    finishRound,
    yourTurn,
    youFinished,
    getSelectedCards,
    setCardsHand,
    positionCard,
    getMyCards,
    qtdPlayers,
    allPlayersFinished,
    setWinnerSetupNextTurn,
    nextTurn,
    qtdWins,
  };
}
