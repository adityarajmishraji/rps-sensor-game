function play(userChoice) {
  const choices = ['rock', 'paper', 'scissors'];
  const computerChoice = choices[Math.floor(Math.random() * choices.length)];

  let result = '';

  if (userChoice === computerChoice) {
    result = 'It\'s a draw!';
  } else if (
    (userChoice === 'rock' && computerChoice === 'scissors') ||
    (userChoice === 'scissors' && computerChoice === 'paper') ||
    (userChoice === 'paper' && computerChoice === 'rock')
  ) {
    result = 'You win!';
  } else {
    result = 'You lose!';
  }

  document.getElementById('status').innerText = `Computer chose ${computerChoice}`;
  document.getElementById('result').innerText = result;
}
