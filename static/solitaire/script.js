
// New game menu is displayed at the beginning, once a gamemode is chosen it hides and startNewGame() runs
const newGameMenuContainer = document.querySelector('.new-game-menu-container');
const newGameEasyButton = document.querySelector('#new-game-easy');
const newGameDifficultButton = document.querySelector('#new-game-difficult');


newGameEasyButton.addEventListener('click', () => startNewGame(0));
newGameDifficultButton.addEventListener('click', () => startNewGame(1));

// Establish the board

const columnElements = [
	document.getElementById("game-column-one"),
	document.getElementById("game-column-two"),
	document.getElementById("game-column-three"),
	document.getElementById("game-column-four"),
	document.getElementById("game-column-five"),
	document.getElementById("game-column-six"),
	document.getElementById("game-column-seven")

]
const columns = [[],[],[],[],[],[],[]];

const cards = [
	'ace_of_clubs', 'ace_of_diamonds', 'ace_of_hearts', 'ace_of_spades',
	'2_of_clubs', '2_of_diamonds', '2_of_hearts', '2_of_spades',
	'3_of_clubs', '3_of_diamonds', '3_of_hearts', '3_of_spades',
	'4_of_clubs', '4_of_diamonds', '4_of_hearts', '4_of_spades',
	'5_of_clubs', '5_of_diamonds', '5_of_hearts', '5_of_spades',
	'6_of_clubs', '6_of_diamonds', '6_of_hearts', '6_of_spades',
	'7_of_clubs', '7_of_diamonds', '7_of_hearts', '7_of_spades',
	'8_of_clubs', '8_of_diamonds', '8_of_hearts', '8_of_spades',
	'9_of_clubs', '9_of_diamonds', '9_of_hearts', '9_of_spades',
	'10_of_clubs', '10_of_diamonds', '10_of_hearts', '10_of_spades',
	'jack_of_clubs', 'jack_of_diamonds', 'jack_of_hearts', 'jack_of_spades',
	'king_of_clubs', 'king_of_diamonds', 'king_of_hearts', 'king_of_spades',
	'queen_of_clubs', 'queen_of_diamonds', 'queen_of_hearts', 'queen_of_spades'
];

const turnedPileCards = [];
const unturnedPileCards = [];

const stackedPileCards = [[],[],[],[]]; 

// Start new game - get all the different elements of the game, shuffle the deck, display them appropriately
// Leaves cards array only with those in the unturned-pile. 

function startNewGame(difficulty) {
	newGameMenuContainer.style.display = "none";

	shuffleDeck(cards);

	createCardElements(cards.slice(0, 28));
	unturnedPileCards.push(...cards.slice(29))
	createCardPile(unturnedPileCards);
}

function shuffleDeck(cards) {
	for (let i = cards.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[cards[i], cards[j]] = [cards[j], cards[i]];
	}
}

function createCardElements(cards) {
	let columnIndex = 0;
	let counter = 1;
	let columnLimit = 1;

	cards.forEach((cardName) => {
		const cardImage = document.createElement('img');
		cardImage.className = 'card board-card';
		cardImage.setAttribute('flipped', counter === columnLimit ? 'true' : 'false');
		cardImage.addEventListener('dragstart', dragStart);
		cardImage.addEventListener('dragend', dragEnd);

		if(counter === columnLimit){
			fetch(`/get-card-image/${cardName}`)
			  .then(response => response.json())
			  .then(data => {
				const cardImageUrl = data.cardImageUrl;
				cardImage.src = cardImageUrl;
			});
			cardImage.alt = cardName;
		} else {
			fetch('/get-card-image/card_back')
			  .then(response => response.json())
			  .then(data => {
				const cardImageUrl = data.cardImageUrl;
				cardImage.src = cardImageUrl;
			});
			cardImage.alt = "cardBack";
		}

		const columnElement = columnElements[columnIndex];
		const li = document.createElement('li');
		li.appendChild(cardImage);
		columnElement.appendChild(li);

		columns[columnIndex].push(cardName)
		counter++;
		if (counter > columnLimit) {
			columnIndex++;
			columnLimit++;
			counter = 1;
		}
	});

	columnElements.forEach(column => {
		const cardsInColumn = column.getElementsByTagName('li');
		for (let i = 0; i < cardsInColumn.length - 1; i++) {
			cardsInColumn[i].draggable = false;
		}
		if (cardsInColumn.length > 0) {
			cardsInColumn[cardsInColumn.length - 1].draggable = true;
		}
	});
}

function createCardPile(cards) {
	const cardPile = document.querySelector(".card-pile");
	const emptyCardImage = document.createElement('img');
	fetch(`/get-card-image/pile_empty`)
	  .then(response => response.json())
	  .then(data => {
		const cardImageUrl = data.cardImageUrl;
		emptyCardImage.src = cardImageUrl;
		emptyCardImage.className = 'card';
	  });
	cardPile.appendChild(emptyCardImage);

	cards.forEach(cardName => {
	  const cardImage = document.createElement('img');
	  fetch(`/get-card-image/card_back`)
		.then(response => response.json())
		.then(data => {
		  const cardImageUrl = data.cardImageUrl;
		  cardImage.src = cardImageUrl;
		  cardImage.alt = cardName;
		  cardImage.className = 'card';
		  cardImage.setAttribute('flipped', 'false');
		});
	  cardPile.appendChild(cardImage);
	});
}
  
// Reveal card
const unturnedPile = document.querySelector('.unturned-pile');
unturnedPile.addEventListener('click', turnCard);
const turnedPile = document.querySelector('.turned-pile');

function turnCard() {
	unturnedPile.lastElementChild.remove();
	const cardToTurn = unturnedPileCards[unturnedPileCards.length - 1];
	const cardImage = document.createElement('img');
	cardImage.className = 'turned-card card';
	cardImage.setAttribute('flipped', 'true');
	cardImage.addEventListener('dragstart', dragStart);
	cardImage.addEventListener('dragend', dragEnd);

	fetch(`/get-card-image/${cardToTurn}`)
	  .then(response => response.json())
	  .then(data => {
		const cardImageUrl = data.cardImageUrl;
		cardImage.src = cardImageUrl;
	  });

	cardImage.alt = cardToTurn;
	turnedPile.appendChild(cardImage);
	turnedPileCards.push(cardToTurn);
	unturnedPileCards.pop();

	if (unturnedPileCards.length == 0) {
		unturnedPile.removeEventListener('click', turnCard);
		unturnedPile.addEventListener('click', resetPiles);
	}
}

function resetPiles() {
	unturnedPile.lastElementChild.remove();
	unturnedPileCards.push(...turnedPileCards);
	unturnedPileCards.reverse();
	
	const turnedCards = [...turnedPile.getElementsByClassName('turned-card')];
	turnedCards.forEach((card) => {
		card.parentNode.removeChild(card);
	});
	turnedPileCards.splice(0, turnedPileCards.length)
	createCardPile(unturnedPileCards);
	unturnedPile.removeEventListener('click', resetPiles);
	unturnedPile.addEventListener('click', turnCard);
}

// Drag cards around the board
var draggedCard = null;
var sourceColumn = null;

function dragStart(event) {
    draggedCard = this;
    event.dataTransfer.setData('text/plain', '');
    event.dataTransfer.effectAllowed = 'move';
    this.classList.add('dragging');

    if (this.getAttribute('draggable') === 'false') {
        event.preventDefault();
        return;
    }

    sourceColumn = this.closest('.game-column');
}

function dragEnd(event) {
    event.preventDefault();
    draggedCard.classList.remove('dragging');
    draggedCard = null;
    sourceColumn = null;
}

function dragEnter(event) {
    event.preventDefault();
    this.classList.add('drag-over');
}

function dragLeave(event) {
    event.preventDefault();
    this.classList.remove('drag-over');
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    this.classList.remove('drag-over');

    if (event.target.classList.contains('game-column')) {
        columnDrop(event);
    } else if (event.target.parentElement.classList.contains('stacked-pile')) {
        stackedDrop(event);
    }
}


function stackedDrop(event) {
    const stackedId = event.target.parentElement.id;
    const cardName = draggedCard.alt;

    if (isCardValid(cardName, stackedId, "stacked")) {
        const newCardContainer = document.createElement('li');
        newCardContainer.setAttribute('draggable', 'true');
        newCardContainer.appendChild(draggedCard);
        const targetStacked = event.target.parentElement;
        targetStacked.appendChild(newCardContainer);

        const sourceColumnIndex = Array.from(columnElements).indexOf(sourceColumn);
        const cardIndex = columns[sourceColumnIndex].indexOf(cardName);
        stackedPileCards[stackedId].push(columns[sourceColumnIndex].splice(cardIndex, 1)[0]);
    }
}


function columnDrop(event) {
	const targetColumn = event.target;
	const cardName = draggedCard.alt;
	if(isCardValid(cardName, targetColumn, "column")) {
		const newCardContainer = document.createElement('li');
		newCardContainer.setAttribute('draggable', 'true');
		newCardContainer.appendChild(draggedCard);
		
		targetColumn.appendChild(newCardContainer);
		if (sourceColumn){
			if (sourceColumn.children.length !== 0) {
				var cardToFlip = sourceColumn.lastElementChild.previousElementSibling;
				sourceColumn.removeChild(sourceColumn.lastElementChild)
				flipCard(cardToFlip);
			}
			const sourceColumnIndex = Array.from(columnElements).indexOf(sourceColumn);
			const targetColumnIndex = Array.from(columnElements).indexOf(targetColumn);
			const cardIndex = columns[sourceColumnIndex].indexOf(cardToFlip.alt);
			columns[targetColumnIndex].push(columns[sourceColumnIndex].splice(cardIndex, 1)[0]);
		} else {
			const targetColumnIndex = Array.from(columnElements).indexOf(targetColumn);
			columns[targetColumnIndex].push(draggedCard.alt);
			draggedCard.classList = "card board-card"
		}
	}
}

const gameColumns = document.querySelectorAll('.game-column');
gameColumns.forEach((column) => {
    column.addEventListener('dragenter', dragEnter);
    column.addEventListener('dragleave', dragLeave);
    column.addEventListener('dragover', dragOver);
    column.addEventListener('drop', drop);
});

const draggableCards = document.querySelectorAll('.game-column li[draggable="true"]');
draggableCards.forEach((card) => {
    card.addEventListener('dragstart', dragStart);
    card.addEventListener('dragend', dragEnd);
    card.addEventListener('dragenter', dragEnter);
    card.addEventListener('dragleave', dragLeave);
    card.addEventListener('dragover', dragOver);
    card.addEventListener('drop', drop);
});

const stackedPiles = document.querySelectorAll('.stacked-pile');
stackedPiles.forEach((pile) => {
    pile.addEventListener('dragenter', dragEnter);
    pile.addEventListener('dragleave', dragLeave);
    pile.addEventListener('dragover', dragOver);
    pile.addEventListener('drop', drop);
});

// Card Processes
function flipCard(cardToFlipLi) {
	const sourceColumn = cardToFlipLi.closest('.game-column');
    const sourceColumnIndex = Array.from(columnElements).indexOf(sourceColumn);
    const cardIndex = Array.from(sourceColumn.children).indexOf(cardToFlipLi);
    const cardToFlipName = columns[sourceColumnIndex][cardIndex];
	const cardToFlip = cardToFlipLi.lastElementChild;
    cardToFlip.setAttribute('flipped', 'true');
	cardToFlip.alt = cardToFlipName
    fetch(`/get-card-image/${cardToFlipName}`)
        .then(response => response.json())
        .then(data => {
            const cardImageUrl = data.cardImageUrl;
            cardToFlip.src = cardImageUrl;
        });
}

function isCardValid(cardName, cardDestination, cardDestinationType) {
    console.log(cardDestination);
    console.log("arrived");

    const cardValues = [];
    const lastCardLi = document.getElementById(cardDestination).lastElementChild;
    const lastCardAlt = lastCardLi ? lastCardLi.querySelector('img').alt : '';
    const cardsToParse = [cardName, lastCardAlt || cardName];

    cardsToParse.forEach((card) => {
        const [value, _, suit] = card.split('_');

        let suitNumber;
        switch (suit) {
            case 'clubs':
            case 'spades':
                suitNumber = 0;
                break;
            case 'diamonds':
            case 'hearts':
                suitNumber = 1;
                break;
            default:
                suitNumber = -1;
                break;
        }

        let valueNumber;
        if (value === 'ace') {
            valueNumber = 1;
        } else if (value === 'jack') {
            valueNumber = 11;
        } else if (value === 'queen') {
            valueNumber = 12;
        } else if (value === 'king') {
            valueNumber = 13;
        } else {
            valueNumber = parseInt(value);
        }

        cardValues.push({ suit: suitNumber, number: valueNumber });
    });

    const card0 = cardValues[0];
    const card1 = cardValues[1];

    if (cardDestinationType === "column") {
        console.log(card0, card1);
        return card0["number"] === card1["number"] - 1 && card0["suit"] !== card1["suit"];
    } else if (cardDestinationType === "stacked") {
        const [__, suit, _] = cardName.split('_');
        let thisOne;
        switch (suit) {
            case 'clubs':
            case 'spades':
                thisOne = 0;
                break;
            case 'diamonds':
            case 'hearts':
                thisOne = 1;
                break;
            default:
                thisOne = -1;
                break;
        }

        if (!lastCardLi) {
            return card0["number"] === 1 && card0["suit"] === thisOne;
        } else {
            return card0["number"] === card1["number"] + 1 && card0["suit"] === thisOne;
        }
    }

    return false;
}

