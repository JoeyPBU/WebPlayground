// Set up event listeners for category dropdowns and joke elements
const categories = document.getElementsByClassName('category');
const categorySelects = document.getElementsByClassName('category-select');

for (let i = 0; i < categories.length; i++) {
  categorySelects[i].addEventListener('change', (function(index) {
    return function() {
      fillCategory(categories[index], categorySelects[index].value);
    };
  })(i));
  
  const categoryJokesUl = categories[i].querySelector('.category-jokes');
  const categoryJokes = categoryJokesUl.querySelectorAll('li');
  
  for (let j = 0; j < categoryJokes.length; j++) {
    const liElement = categoryJokes[j];
    liElement.addEventListener('click', () => {
      liElement.classList.toggle('spin');
      flipJoke(liElement.getAttribute('joke-id'), liElement.innerHTML).then(joke_line => {
        if (joke_line) {
          liElement.innerHTML = joke_line;
        } else {
          liElement.innerHTML = 'Filler';
        }
      });
    });
  }
}

// Fill categories with jokes
async function fillCategory(category, selectedJokeTopic) {
  const categoryJokesUl = category.querySelector('.category-jokes');
  const categoryJokes = categoryJokesUl.querySelectorAll('li');
  
  const response = await fetch('/data_jokes/get_jokes');
  const data = await response.json();
  
  let selectedJokes = [];
  if (data.jokes) {
    const jokesByTopic = Object.values(data.jokes).filter(joke => joke.joke_topic === selectedJokeTopic);
    for (let i = jokesByTopic.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [jokesByTopic[i], jokesByTopic[j]] = [jokesByTopic[j], jokesByTopic[i]];
    }
    selectedJokes = jokesByTopic.slice(0, categoryJokes.length);
  }
  
  let currentIndex = 0;
  categoryJokes.forEach((liElement) => {
    liElement.textContent = selectedJokes[currentIndex].first_line;
    liElement.setAttribute('joke-id', Object.keys(data.jokes)[Object.values(data.jokes).indexOf(selectedJokes[currentIndex])]);
    currentIndex = (currentIndex + 1) % selectedJokes.length;
  });
}

// Flip joke
async function flipJoke(jokeId, jokeTextContent) {
  if (!jokeId) {
    return Promise.resolve(null);
  }
  
  const response = await fetch('/data_jokes/get_jokes');
  const data = await response.json();
  
  const jokeLine = jokeTextContent.trim();
  const newLine = jokeLine === data.jokes[jokeId].first_line ? 'punch_line' : 'first_line';
  
  return data.jokes[jokeId][newLine];
}


// Joke of The Day
const jokeOfTheDayContainer = document.querySelector('.joke-of-the-day-container');
const jokeOfTheDay = document.getElementById('joke-of-the-day');

function newJokeOfTheDay() {
  fetch('/data_jokes/new_joke_of_the_day')
    .then(response => response.json())
    .then(data => {
      jokeOfTheDay.setAttribute('joke-id', data.joke_id);
      jokeOfTheDay.innerHTML = data.joke;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function getJokeOfTheDay() {
  fetch('/data_jokes/get_joke_of_the_day')
    .then(response => response.json())
    .then(data => {
      jokeOfTheDay.setAttribute('joke-id', data.joke_id);
      jokeOfTheDay.innerHTML = data.joke;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}


jokeOfTheDay.addEventListener('click', () => {
  jokeOfTheDayContainer.classList.toggle('spin');
  flipJoke(jokeOfTheDay.getAttribute('joke-id'), jokeOfTheDay.innerHTML).then(joke_line => {
    jokeOfTheDay.innerHTML = joke_line;
  });
});

setInterval(() => {
  newJokeOfTheDay();
}, 1000 * 60 * 30);

getJokeOfTheDay();

// Starter Jokes
fillCategory(categories[0], 'General');
fillCategory(categories[1], 'General');
fillCategory(categories[2], 'General');


// Create new joke
const createJokeButton = document.getElementById('create-joke-button');
const createJokeBox = document.getElementById('create-joke-box');
createJokeButton.addEventListener('click', () => {
  createJokeBox.style.display = createJokeBox.style.display === 'none' ? 'block' : 'none';
});

const createJokeSubmit = document.getElementById('create-joke-submit');
const jokeForm = document.querySelector('form');

jokeForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const jokeTopic = document.getElementById('create-joke-topic').value;
  const jokeFirstLine = document.getElementById('create-joke-first-line').value;
  const jokePunchLine = document.getElementById('create-joke-punch-line').value;
  
  if (jokeTopic && jokeFirstLine && jokePunchLine) {
    fetch('/data_jokes/create_joke', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        joke_topic: jokeTopic,
        first_line: jokeFirstLine,
        punch_line: jokePunchLine
      })
    })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        jokeForm.reset();
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  else {
    alert('Please fill all fields');
  }
});