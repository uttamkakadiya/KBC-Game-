"use strict";

(() => {
	// Prize structure and page elements
	// Position zero is the first question; milestone prizes are banked after questions 5 and 10.
	const prizeLadder = [
		1_000, 2_000, 3_000, 5_000, 10_000,
		20_000, 40_000, 80_000, 160_000, 320_000,
		640_000, 1_250_000, 2_500_000, 5_000_000, 10_000_000
	];
	const lifelineNames = ["fifty-fifty", "audience", "swap"];
	const intro = document.querySelector("#game-intro");
	const panel = document.querySelector("#quiz-panel");
	const result = document.querySelector("#game-result");
	const questionText = document.querySelector("#question-text");
	const optionsContainer = document.querySelector("#answer-options");
	const progressText = document.querySelector("#question-progress");
	const currentPrizeText = document.querySelector("#current-prize");
	const ladder = document.querySelector("#prize-ladder");
	const gameMessage = document.querySelector("#game-message");
	const lifelineMessage = document.querySelector("#lifeline-message");
	const playerMessage = document.querySelector("#player-message");
	const resultTitle = document.querySelector("#result-title");
	const resultDetails = document.querySelector("#result-details");
	const finalRank = document.querySelector("#final-rank");
	const gameRankingList = document.querySelector("#game-ranking-list");
	const gameRankStatus = document.querySelector("#game-rank-status");
	const lifelineButtons = new Map(
		lifelineNames.map((name) => [name, document.querySelector(`[data-lifeline="${name}"]`)])
	);

	// This object is the in-memory state for the current playthrough; a restart resets it.
	const state = {
		active: false,
		player: null,
		questions: [],
		questionIndex: 0,
		bankedPrize: 0,
		usedLifelines: new Set(),
		optionRevealTimer: null
	};

	// Formatting, randomization, and player/question storage
	function formatPrize(amount) {
		return `₹${amount.toLocaleString("en-IN")}`;
	}

	function shuffle(items) {
		// Fisher-Yates returns a shuffled copy so the original question bank stays unchanged.
		const shuffled = [...items];
		for (let index = shuffled.length - 1; index > 0; index -= 1) {
			const swapIndex = Math.floor(Math.random() * (index + 1));
			[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
		}
		return shuffled;
	}

	function getSignedInPlayer() {
		const email = localStorage.getItem("ourGameCurrentUser");
		if (!email) {
			return null;
		}
		const users = JSON.parse(localStorage.getItem("ourGameUsers") || "[]");
		if (!Array.isArray(users)) {
			throw new Error("Saved account data is invalid.");
		}
		return users.find((user) => user.email === email) || null;
	}

	function getQuestionHistoryKey() {
		return `ourGameQuestionHistory:${encodeURIComponent(state.player.email)}`;
	}

	function readQuestionHistory(roundCount) {
		const savedHistory = localStorage.getItem(getQuestionHistoryKey());
		if (savedHistory === null) {
			return Array.from({ length: roundCount }, () => []);
		}
		const history = JSON.parse(savedHistory);
		if (!Array.isArray(history)
			|| history.length !== roundCount
			|| history.some((round) => !Array.isArray(round)
				|| round.some((question) => typeof question !== "string"))) {
			throw new Error("Saved question history is invalid.");
		}
		return history;
	}

	function questionKey(question) {
		return question.question.trim().toLocaleLowerCase();
	}

	function chooseQuestionsForGame() {
		const history = readQuestionHistory(window.KbcQuestionBank.length);
		const questions = window.KbcQuestionBank.map((round, roundIndex) => {
			const previouslyUsed = new Set(history[roundIndex]);
			let available = round.filter((question) => !previouslyUsed.has(questionKey(question)));
			if (available.length === 0) {
				history[roundIndex] = [];
				available = round;
			}
			const selected = shuffle(available)[0];
			history[roundIndex].push(questionKey(selected));
			return selected;
		});
		localStorage.setItem(getQuestionHistoryKey(), JSON.stringify(history));
		return questions;
	}

	// View rendering helpers
	function showPanel(panelToShow) {
		intro.hidden = panelToShow !== intro;
		panel.hidden = panelToShow !== panel;
		result.hidden = panelToShow !== result;
	}

	function setLifelinesEnabled(enabled) {
		lifelineButtons.forEach((button, name) => {
			button.disabled = !enabled || state.usedLifelines.has(name);
		});
	}

	function renderLadder() {
		// Rebuild the ladder from the prize data and highlight the active question and milestones.
		ladder.replaceChildren();
		prizeLadder.forEach((prize, index) => {
			const rung = document.createElement("li");
			rung.textContent = `${String(index + 1).padStart(2, "0")}  ${formatPrize(prize)}`;
			if (index === state.questionIndex && state.active) {
				rung.classList.add("is-current");
				rung.setAttribute("aria-current", "step");
			}
			if (index === 4 || index === 9 || index === 14) {
				rung.classList.add("is-milestone");
			}
			ladder.prepend(rung);
		});
	}

	function renderPlayerRank() {
		if (!state.player) {
			gameRankStatus.textContent = "Log in to see your rank against other players on this browser.";
			gameRankingList.replaceChildren();
			return;
		}
		try {
			const entries = window.GameApp.getLeaderboard();
			const playerIndex = entries.findIndex((entry) => entry.email === state.player.email);
			gameRankingList.replaceChildren();
			if (playerIndex === -1) {
				gameRankStatus.textContent = "Your account is not on this browser's leaderboard.";
				return;
			}

			const topPlayers = entries.slice(0, 5);
			// Keep the signed-in player visible even when they are outside the top five.
			if (playerIndex >= topPlayers.length) {
				topPlayers.push(entries[playerIndex]);
			}
			gameRankStatus.textContent = `Your rank: #${playerIndex + 1} of ${entries.length} players on this browser`;
			topPlayers.forEach((entry) => {
				const index = entries.indexOf(entry);
				const item = document.createElement("li");
				item.classList.toggle("is-current-player", entry.email === state.player.email);
				const position = document.createElement("span");
				position.className = "mini-ranking-position";
				position.textContent = `#${index + 1}`;
				const name = document.createElement("span");
				name.className = "mini-ranking-name";
				name.textContent = entry.email === state.player.email ? `${entry.name} (you)` : entry.name;
				const score = document.createElement("span");
				score.className = "mini-ranking-score";
				score.textContent = formatPrize(entry.score);
				item.append(position, name, score);
				gameRankingList.append(item);
			});
			if (!result.hidden) {
				finalRank.textContent = gameRankStatus.textContent;
			}
		} catch (error) {
			console.error("Could not update player rankings.", error);
			gameRankStatus.textContent = "Could not load rankings from this browser.";
		}
	}

	function renderQuestion() {
		if (state.optionRevealTimer !== null) {
			window.clearTimeout(state.optionRevealTimer);
			state.optionRevealTimer = null;
		}
		// Question text and answer buttons are created from the selected round's data.
		const question = state.questions[state.questionIndex];
		if (!question) {
			finishGame("win");
			return;
		}
		questionText.textContent = question.question;
		progressText.textContent = `Question ${state.questionIndex + 1} of ${prizeLadder.length}`;
		currentPrizeText.textContent = `This question: ${formatPrize(prizeLadder[state.questionIndex])}`;
		gameMessage.textContent = "";
		lifelineMessage.textContent = "";
		optionsContainer.replaceChildren();
		question.options.forEach((option, index) => {
			const button = document.createElement("button");
			button.type = "button";
			button.className = "answer-option";
			button.dataset.answerIndex = String(index);
			const letter = document.createElement("span");
			letter.className = "answer-letter";
			letter.textContent = String.fromCharCode(65 + index);
			const text = document.createElement("span");
			text.className = "answer-text";
			text.textContent = option;
			button.append(letter, text);
			button.addEventListener("click", () => chooseAnswer(index));
			optionsContainer.append(button);
		});
		optionsContainer.hidden = true;
		gameMessage.textContent = "Take a few seconds to read the question. The answer choices are coming up.";
		state.optionRevealTimer = window.setTimeout(() => {
			state.optionRevealTimer = null;
			if (state.active) {
				optionsContainer.hidden = false;
				gameMessage.textContent = "Choose your answer.";
				setLifelinesEnabled(true);
			}
		}, 3000);
		renderLadder();
		setLifelinesEnabled(false);
	}

	// Game start and answer flow
	function startGame() {
		try {
			state.player = getSignedInPlayer();
			if (!state.player) {
				playerMessage.hidden = false;
				playerMessage.textContent = "Please log in or create an account before starting a game.";
				return;
			}
			if (!Array.isArray(window.KbcQuestionBank)
				|| window.KbcQuestionBank.length !== prizeLadder.length
				|| window.KbcQuestionBank.some((round) => !Array.isArray(round) || round.length === 0)) {
				throw new Error("The question bank does not match the prize ladder.");
			}

			// Select unused questions in each prize round, cycling only after that round's pool is exhausted.
			state.questions = chooseQuestionsForGame();
			state.questionIndex = 0;
			state.bankedPrize = 0;
			state.usedLifelines.clear();
			state.active = true;
			finalRank.textContent = "";
			playerMessage.hidden = true;
			document.querySelector("#player-name").textContent = state.player.name;
			window.QuizShowSound.play("start");
			window.QuizShowSound.startAmbience();
			renderPlayerRank();
			showPanel(panel);
			renderQuestion();
		} catch (error) {
			console.error("Could not start the game.", error);
			playerMessage.hidden = false;
			playerMessage.textContent = "The game could not start. Check that account data and questions are available.";
		}
	}

	function chooseAnswer(answerIndex) {
		if (!state.active) {
			return;
		}
		const question = state.questions[state.questionIndex];
		const buttons = [...optionsContainer.querySelectorAll(".answer-option")];
		// Lock every choice immediately, then mark the correct and selected answers for feedback.
		buttons.forEach((button) => {
			button.disabled = true;
			const index = Number(button.dataset.answerIndex);
			if (index === question.answer) {
				button.classList.add("is-correct");
			} else if (index === answerIndex) {
				button.classList.add("is-incorrect");
			}
		});
		setLifelinesEnabled(false);

		if (answerIndex !== question.answer) {
			gameMessage.textContent = `That answer is not correct. The correct answer was ${question.options[question.answer]}.`;
			finishGame("incorrect", question.options[question.answer]);
			return;
		}

		window.QuizShowSound.play("correct");
		state.questionIndex += 1;
		// Reaching question 5 or 10 secures that level even after a later wrong answer.
		if (state.questionIndex === 5 || state.questionIndex === 10) {
			state.bankedPrize = prizeLadder[state.questionIndex - 1];
			window.QuizShowSound.play("milestone");
		}
		gameMessage.textContent = state.questionIndex === prizeLadder.length
			? "Correct! You have answered every question."
			: "Correct! Get ready for the next question.";
		renderLadder();
		window.setTimeout(() => {
			if (state.active) {
				renderQuestion();
			}
		}, 2500);
	}

	// Lifeline actions
	function useFiftyFifty() {
		const question = state.questions[state.questionIndex];
		const incorrect = question.options
			.map((_, index) => index)
			.filter((index) => index !== question.answer);
		// Remove two random wrong answers while always keeping the correct answer available.
		shuffle(incorrect).slice(0, 2).forEach((index) => {
			optionsContainer.querySelector(`[data-answer-index="${index}"]`).hidden = true;
		});
		lifelineMessage.textContent = "50:50 used. Two incorrect options have been removed.";
	}

	function useAudiencePoll() {
		const question = state.questions[state.questionIndex];
		const answerCount = question.options.length;
		// This is a simulated poll; the correct answer is deliberately favoured.
		const confidence = 50 + Math.floor(Math.random() * 31);
		let remainingVotes = 100 - confidence;
		const incorrect = shuffle(question.options
			.map((_, index) => index)
			.filter((index) => index !== question.answer));
		const votes = Array(answerCount).fill(0);
		votes[question.answer] = confidence;
		incorrect.forEach((index, position) => {
			votes[index] = position === incorrect.length - 1
				? remainingVotes
				: Math.floor(Math.random() * (remainingVotes + 1));
			remainingVotes -= votes[index];
		});
		lifelineMessage.textContent = `Simulated audience poll: ${votes.map((vote, index) => `${String.fromCharCode(65 + index)} ${vote}%`).join(" · ")}`;
	}

	function useSwapQuestion() {
		// The replacement comes from the same round, so the current prize difficulty is unchanged.
		try {
			const history = readQuestionHistory(window.KbcQuestionBank.length);
			const usedThisRound = new Set(history[state.questionIndex]);
			const alternatives = window.KbcQuestionBank[state.questionIndex]
				.filter((question) => !usedThisRound.has(questionKey(question)));
			if (alternatives.length === 0) {
				lifelineMessage.textContent = "No unused replacement questions remain for this prize round.";
				return false;
			}
			const replacement = shuffle(alternatives)[0];
			history[state.questionIndex].push(questionKey(replacement));
			localStorage.setItem(getQuestionHistoryKey(), JSON.stringify(history));
			state.questions[state.questionIndex] = replacement;
			renderQuestion();
			lifelineMessage.textContent = "Question swapped. Your current prize level stays the same.";
			return true;
		} catch (error) {
			console.error("Could not update question history for the swap.", error);
			lifelineMessage.textContent = "Could not load an unused replacement question.";
			return false;
		}
	}

	function useLifeline(name) {
		if (!state.active || state.usedLifelines.has(name)) {
			return;
		}
		state.usedLifelines.add(name);
		setLifelinesEnabled(false);
		// Mark the lifeline as spent first; restore it if the requested action cannot run.
		const succeeded = name === "fifty-fifty"
			? (useFiftyFifty(), true)
			: name === "audience"
				? (useAudiencePoll(), true)
				: useSwapQuestion();
		if (!succeeded) {
			state.usedLifelines.delete(name);
		} else {
			window.QuizShowSound.play("lifeline");
		}
		setLifelinesEnabled(state.optionRevealTimer === null);
	}

	// Results, score saving, and event wiring
	function finishGame(reason, correctAnswer = "") {
		if (!state.active && result.hidden === false) {
			return;
		}
		if (state.optionRevealTimer !== null) {
			window.clearTimeout(state.optionRevealTimer);
			state.optionRevealTimer = null;
		}
		state.active = false;
		setLifelinesEnabled(false);
		// A wrong answer falls back to the last banked milestone; walking away keeps the current prize.
		let finalPrize = state.bankedPrize;
		if (reason === "quit" && state.questionIndex > 0) {
			finalPrize = Math.max(finalPrize, prizeLadder[state.questionIndex - 1]);
		} else if (reason === "win") {
			finalPrize = prizeLadder[prizeLadder.length - 1];
		}

		const labels = {
			incorrect: "Game over",
			quit: "You have walked away",
			win: "You are the next millionaire!"
		};
		resultTitle.textContent = labels[reason];
		resultDetails.textContent = reason === "incorrect"
			? `${state.player.name}, your final prize is ${formatPrize(finalPrize)}. The correct answer was ${correctAnswer}.`
			: `${state.player.name}, your final prize is ${formatPrize(finalPrize)}.`;
		showPanel(result);
		window.QuizShowSound.stopAmbience();
		if (reason === "win") {
			window.QuizShowSound.play("win");
		} else if (reason === "incorrect") {
			window.QuizShowSound.play("incorrect");
		}

		const scoreSaved = window.GameApp.saveFinalScore(finalPrize);
		renderPlayerRank();
		const saveMessage = document.querySelector("#result-save-message");
		saveMessage.textContent = scoreSaved
			? "Your best score has been updated on the leaderboard if this prize is higher."
			: "Your result could not be saved. Please log in and check browser storage.";
		saveMessage.classList.toggle("is-error", !scoreSaved);
		renderLadder();
	}

	document.querySelector("#start-game").addEventListener("click", startGame);
	document.querySelector("#restart-game").addEventListener("click", startGame);
	document.querySelector("#quit-game").addEventListener("click", () => finishGame("quit"));
	lifelineButtons.forEach((button, name) => {
		button.addEventListener("click", () => useLifeline(name));
	});
	document.querySelector("#login-to-play").addEventListener("click", () => {
		window.location.href = "login.html";
	});
	document.querySelector("#leaderboard-link").addEventListener("click", () => {
		window.location.href = "leaderboard.html";
	});

	try {
		const player = getSignedInPlayer();
		if (player) {
			state.player = player;
			document.querySelector("#welcome-player").textContent = `Welcome, ${player.name}.`;
			renderPlayerRank();
		} else {
			playerMessage.hidden = false;
			playerMessage.textContent = "Log in or create an account to play and save your score.";
			document.querySelector("#login-to-play").hidden = false;
		}
	} catch (error) {
		console.error("Could not load the signed-in player.", error);
		playerMessage.hidden = false;
		playerMessage.textContent = "Could not read account information. Check browser storage or log in again.";
		document.querySelector("#login-to-play").hidden = false;
	}

	window.addEventListener("next-millionaire:leaderboard-updated", renderPlayerRank);
})();
