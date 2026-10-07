# Next Millionaire

Next Millionaire is a browser-based quiz game inspired by televised general-knowledge contests. It has 15 prize rounds, three lifelines, synthesized sound effects, and a leaderboard.

## Run the game

The project has no build step or package dependencies. Serve the project folder with a local static web server, then open the site in a browser. For example, in VS Code you can use the Live Server extension and open `index.html`.

The main page redirects signed-out visitors to the login page. Create an account or sign in to reach the game and player dashboard.

## Project structure

| Path | Purpose |
| --- | --- |
| `index.html` | Entry page; loads `js/index.js` and redirects to login when signed out. |
| `html/login.html` | Sign-in form. |
| `html/signup.html` | Account registration form. |
| `html/home.html` | Redirects to the root entry page. |
| `html/game.html` | Quiz interface, prize ladder, lifelines, and results. |
| `html/leaderboard.html` | Browser-local player rankings. |
| `css/styles.css` | Shared page styles, components, responsive layout, and game-show theme. |
| `js/app.js` | Shared account, navigation, storage, and leaderboard helpers. |
| `js/index.js` | Signed-in home-page greeting and player dashboard. |
| `js/game.js` | Quiz flow, answer checks, prize tracking, lifelines, and score saving. |
| `js/questions.js` | Question bank, grouped by prize round. |
| `js/sound.js` | Sound effects synthesized with the Web Audio API. |
| `images/` | Page artwork and other image assets. |
| `sounds/` | Audio assets, if used by the pages. |

## How the game works

- There are 15 prize rounds. Each round contains alternate questions at the same prize level.
- Players get a few seconds to read each question before its answer choices appear.
- Each lifeline can be used once per game, and only one lifeline can be used on a given question.
- A wrong answer allows one retry in that game. A second wrong answer ends the game.
- Questions already shown to a player are tracked so they are not selected again until that round's question pool is exhausted.
- Reaching questions 5 and 10 banks a guaranteed prize. Players can also walk away between questions.
- A player's best prize is saved to the leaderboard.

## Edit the question bank

Open `js/questions.js`. `window.KbcQuestionBank` is an array of 15 round arrays. Add a question object to the round whose prize level it should use:

```js
{
	question: "What is the capital of France?",
	options: ["Berlin", "Madrid", "Paris", "Rome"],
	answer: 2
}
```

Each question needs a prompt, four answer strings, and an `answer` index from `0` to `3` identifying the correct option. Keep questions distinct within each round so the player's no-repeat history can work as intended.

## Browser storage and limitations

Accounts, the signed-in session, question history, and scores are stored in the current browser's `localStorage`. The leaderboard is therefore local to that browser profile; it is not shared between devices or visitors. Clearing browser data removes the saved accounts and scores.

This is a front-end learning/demo project, not a production authentication system. Account data (including passwords) is stored in browser storage and should not be used for real credentials or sensitive information.

## Validate JavaScript

If Node.js is installed, check each JavaScript file for syntax errors from the project folder:

```powershell
Get-ChildItem .\js\*.js | ForEach-Object { node --check $_.FullName }
```

The pages can also be checked manually in a browser: register or sign in, start a game, try the lifelines and retry, finish a round, then review the saved leaderboard.
