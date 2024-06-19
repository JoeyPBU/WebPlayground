function createPlayer() {
    const playerNameInput = document.getElementById('player-name');
    const playerName = playerNameInput.value.trim();

    if (playerName !== '') {
        fetch('/create_player', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: playerName }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateOldPlayersList();
                updateGameArea();
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    } else {
        alert('Please enter a valid player name.');
    }
}

function updateGameArea() {
    fetch('/get_all_players')
    .then(response => response.json())
    .then(data => {
        const oldPlayersList = document.getElementById('players-list');
        oldPlayersList.innerHTML = '';

        data.forEach(player => {
            const playerListItem = document.createElement('li');
            playerListItem.innerHTML = `
                <span>${player.name}</span>
                <button onclick="bringPlayerIntoGame('${player.name}')">Select</button>
                <button onclick="deletePlayer('${player.name}')">Delete</button>
            `;
            oldPlayersList.appendChild(playerListItem);
        });
    })
    .catch(error => console.error('Error:', error));
}


function bringPlayerIntoGame(playerName) {
    const selectedPlayersContainer = document.getElementById('selected-players');

    const existingPlayer = Array.from(selectedPlayersContainer.children)
        .find(playerDiv => playerDiv.querySelector('h3').textContent === playerName);

    if (existingPlayer) {
        alert(`Player "${playerName}" is already in the game.`);
        return;
    }

    fetch('/get_all_players')
    .then(response => response.json())
    .then(data => {
        const selectedPlayer = data.find(player => player.name === playerName);

        if (selectedPlayer) {
            const playerDiv = document.createElement('div');
            playerDiv.className = 'player-display';
            playerDiv.innerHTML = `
                <h3>${selectedPlayer.name}</h3>
                <p>Wins: ${selectedPlayer.results.wins}, Losses: ${selectedPlayer.results.losses}, Draws: ${selectedPlayer.results.draws}</p>
                <p>Balance: £<span id="balance-${selectedPlayer.name}">${selectedPlayer.balance || 1000}</span></p>
                <label for="bet-amount-${selectedPlayer.name}">Bet Amount:</label>
                <input type="number" id="bet-amount-${selectedPlayer.name}" placeholder="Enter bet amount">
                <button onclick="recordResult('win', '${selectedPlayer.name}')">Win</button>
                <button onclick="recordResult('loss', '${selectedPlayer.name}')">Loss</button>
                <button onclick="recordResult('draw', '${selectedPlayer.name}')">Draw</button>
            `;

            selectedPlayersContainer.appendChild(playerDiv);

            const oldPlayersList = document.getElementById('players-list');
            const selectedPlayerListItem = oldPlayersList.querySelector(`li span:contains('${selectedPlayer.name}')`).closest('li');
            if (selectedPlayerListItem) {
                selectedPlayerListItem.parentNode.removeChild(selectedPlayerListItem);
            }
        } else {
            alert(`Player "${playerName}" not found`);
        }
    })
    .catch(error => console.error('Error:', error));
}



function leaveTable(playerName) {
    const selectedPlayersContainer = document.getElementById('selected-players');
    const playerDivToRemove = Array.from(selectedPlayersContainer.children)
        .find(playerDiv => playerDiv.querySelector('h3').textContent === playerName);

    if (playerDivToRemove) {
        selectedPlayersContainer.removeChild(playerDivToRemove);

        updateOldPlayersList();
    }
}



function recordResult(result, playerName) {
    const betAmount = getBetAmount(playerName);

    fetch('/record_result', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playerName, result, betAmount }),
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            alert(data.message);
        } else {
            handleResult(result, playerName);
            updateBalance(playerName);
            updateGameArea();
        }
        updateOldPlayersList();
    })
    .catch(error => console.error('Error:', error));
}
function updatePlayerScores(playerName) {
    fetch('/get_all_players')
    .then(response => response.json())
    .then(data => {
        const player = data.find(player => player.name === playerName);
        if (player) {
            const winElement = document.getElementById(`win-${playerName}`);
            const lossElement = document.getElementById(`loss-${playerName}`);
            const drawElement = document.getElementById(`draw-${playerName}`);
            const balanceElement = document.getElementById(`balance-${playerName}`);

            winElement.textContent = player.results.wins;
            lossElement.textContent = player.results.losses;
            drawElement.textContent = player.results.draws;
            balanceElement.textContent = player.balance;
        }
    })
    .catch(error => console.error('Error:', error));
}

function handleResult(result, playerName) {
    const minBet = parseFloat(document.getElementById('min-bet').textContent);
    const selectedPlayersContainer = document.getElementById('selected-players');
    const playerDiv = Array.from(selectedPlayersContainer.children)
        .find(div => div.querySelector('h3').textContent === playerName);

    if (playerDiv) {
        const betAmount = parseFloat(playerDiv.querySelector('input').value) || minBet;

        if (result === 'win') {
            const winnings = betAmount * 2;
            alert(`Player "${playerName}" wins £${winnings}!`);
            updateBalance(playerName, winnings);
        } else if (result === 'draw') {
            alert(`Player "${playerName}" draws. Bet of £${betAmount} returned.`);
        } else if (result === 'loss') {
            alert(`Player "${playerName}" loses £${betAmount}.`);
            updateBalance(playerName, -betAmount);
        }
    }
}

function updateBalance(playerName) {
    fetch('/get_player_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playerName }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const balanceElement = document.getElementById(`balance-${playerName}`);
            balanceElement.textContent = data.player.balance;
        } else {
            console.error(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

function updatePlayerScores(playerName) {
    fetch('/get_player_info', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playerName }),
    })
    .then(response => response.json())
    .then(data => {
        const winElement = document.getElementById(`win-${playerName}`);
        const lossElement = document.getElementById(`loss-${playerName}`);
        const drawElement = document.getElementById(`draw-${playerName}`);

        winElement.textContent = data.player.results.wins;
        lossElement.textContent = data.player.results.losses;
        drawElement.textContent = data.player.results.draws;
    })
    .catch(error => console.error('Error:', error));
}



function deletePlayer(playerName) {
    fetch('/delete_player', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playerName }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            updateOldPlayersList();
        } else {
            alert(data.message);
        }
    })
    .catch(error => console.error('Error:', error));
}

function updateOldPlayersList() {
    fetch('/get_all_players')
    .then(response => response.json())
    .then(data => {
        const oldPlayersList = document.getElementById('players-list');
        oldPlayersList.innerHTML = '';

        data.forEach(player => {
            const playerListItem = document.createElement('li');
            playerListItem.innerHTML = `
                <span>${player.name}</span>
                <button onclick="bringPlayerIntoGame('${player.name}')">Select</button>
                <button onclick="deletePlayer('${player.name}')">Delete</button>
            `;
            oldPlayersList.appendChild(playerListItem);
        });
    })
    .catch(error => console.error('Error:', error));
}

function setMinBet() {
    const minBetInput = document.getElementById('min-bet-input');
    const minBetSpan = document.getElementById('min-bet');
    const newMinBet = parseFloat(minBetInput.value);

    if (!isNaN(newMinBet) && newMinBet >= 0) {
        minBetSpan.textContent = newMinBet;
    } else {
        alert('Please enter a valid minimum bet.');
    }
}



window.onload = () => {
    updateOldPlayersList();
    updateGameArea();
};
