const cardsContainer = document.querySelector('.cards-container');

cardsContainer.addEventListener('wheel', (event) => {
    event.preventDefault();
    cardsContainer.scrollLeft += event.deltaY;
});

/* Header */

document.querySelector('#display-body-nav-btn').addEventListener('click', navBallSwitch);

function navBallSwitch() {
  const navBalls = document.querySelectorAll('.nav-ball-sub');
  navBalls.forEach((navBall, index) => {
    setTimeout(() => {
      navBall.classList.toggle('show');
    }, index * 100);
  });
}

const cardContainerBorders = document.querySelectorAll(".cards-container-border")

document.querySelector('#display-cards-container-btn').addEventListener('click', () => {
  cardsContainer.classList.toggle('show');
  cardContainerBorders.forEach((border) => {
    border.classList.toggle('show');
  });
  navBallSwitch()
})