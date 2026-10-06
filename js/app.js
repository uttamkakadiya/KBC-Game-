"use strict";

(() => {
	// Storage keys
	// These keys keep account, session, and prize data separate in this browser's localStorage.
	const USERS_KEY = "ourGameUsers";
	const CURRENT_USER_KEY = "ourGameCurrentUser";
	const SCORES_KEY = "ourGameScores";

	// Storage readers and leaderboard data
	function readJson(key, fallback) {
		const value = localStorage.getItem(key);
		if (value === null) {
			return fallback;
		}
		return JSON.parse(value);
	}

	// Parse storage once through shared helpers so invalid saved data is reported consistently.
	function readUsers() {
		const users = readJson(USERS_KEY, []);
		if (!Array.isArray(users)) {
			throw new Error("Saved account data is invalid.");
		}
		return users;
	}

	function readScores() {
		const scores = readJson(SCORES_KEY, []);
		if (!Array.isArray(scores)) {
			throw new Error("Saved score data is invalid.");
		}
		return scores;
	}

	function getLeaderboardEntries() {
		// localStorage only shares standings between accounts in this browser profile.
		const scoresByEmail = new Map(
			readScores()
				.filter((entry) => typeof entry.email === "string"
					&& Number.isSafeInteger(entry.score)
					&& entry.score >= 0)
				.map((entry) => [entry.email, entry.score])
		);
		return readUsers()
			.filter((user) => typeof user.name === "string" && typeof user.email === "string")
			.map((user) => ({
				name: user.name,
				email: user.email,
				score: scoresByEmail.get(user.email) || 0
			}))
			.sort((first, second) => second.score - first.score
				|| first.name.localeCompare(second.name));
	}

	// Shared page feedback and navigation
	function showMessage(element, message, isError) {
		if (!element) {
			return;
		}
		element.textContent = message;
		element.classList.toggle("is-error", isError);
		element.classList.toggle("is-success", !isError && message !== "");
	}

	function updateNavigation() {
		try {
			// Pages mark login/signup links and logout links with data attributes for this toggle.
			const signedIn = Boolean(localStorage.getItem(CURRENT_USER_KEY));
			document.querySelectorAll("[data-auth-link]").forEach((link) => {
				link.hidden = signedIn;
			});
			document.querySelectorAll("[data-logout]").forEach((link) => {
				link.hidden = !signedIn;
				link.addEventListener("click", (event) => {
					event.preventDefault();
					localStorage.removeItem(CURRENT_USER_KEY);
					window.location.href = "login.html";
				}, { once: true });
			});
		} catch (error) {
			document.querySelectorAll("[data-logout]").forEach((link) => {
				link.hidden = true;
			});
			console.error("Could not read browser account storage.", error);
		}
	}

	// Account validation and form handlers
	function isValidEmail(email) {
		// Use the browser's email syntax check and require a dotted domain with a valid-looking suffix.
		const emailField = document.createElement("input");
		emailField.type = "email";
		emailField.value = email;
		return emailField.checkValidity()
			&& /^[^\s@]+@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/i.test(email);
	}

	// Signup and login handlers are attached only when their matching form exists on the current page.
	function setupSignup() {
		const form = document.querySelector("#signup-form");
		if (!form) {
			return;
		}

		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const message = document.querySelector("#signup-message");
			const name = form.elements.name.value.trim();
			const email = form.elements.email.value.trim().toLowerCase();
			const password = form.elements.password.value;
			const confirmation = form.elements["confirm-password"].value;

			if (name.length < 2 || name.length > 50) {
				showMessage(message, "Name must be between 2 and 50 characters.", true);
				return;
			}
			if (!isValidEmail(email)) {
				showMessage(message, "Enter a valid email address.", true);
				return;
			}
			if (password.length < 8) {
				showMessage(message, "Password must be at least 8 characters.", true);
				return;
			}
			if (password !== confirmation) {
				showMessage(message, "The passwords do not match.", true);
				return;
			}

			try {
				const users = readUsers();
				if (users.some((user) => user.email === email)) {
					showMessage(message, "An account with this email already exists.", true);
					return;
				}
				users.push({ name, email, password });
				localStorage.setItem(USERS_KEY, JSON.stringify(users));
				localStorage.setItem(CURRENT_USER_KEY, email);
				window.dispatchEvent(new Event("next-millionaire:scores-changed"));
				window.location.href = "../index.html";
			} catch (error) {
				console.error("Could not create account.", error);
				showMessage(message, "Could not save the account in this browser. Check local storage and try again.", true);
			}
		});
	}

	function setupLogin() {
		const form = document.querySelector("#login-form");
		if (!form) {
			return;
		}

		form.addEventListener("submit", (event) => {
			event.preventDefault();
			const message = document.querySelector("#login-message");
			const email = form.elements.email.value.trim().toLowerCase();
			const password = form.elements.password.value;

			if (!isValidEmail(email)) {
				showMessage(message, "Enter a valid email address.", true);
				return;
			}
			if (!password) {
				showMessage(message, "Enter your password.", true);
				return;
			}

			try {
				const user = readUsers().find((account) =>
					account.email === email && account.password === password
				);
				if (!user) {
					showMessage(message, "Email or password is incorrect.", true);
					return;
				}
				localStorage.setItem(CURRENT_USER_KEY, user.email);
				window.location.href = "../index.html";
			} catch (error) {
				console.error("Could not log in.", error);
				showMessage(message, "Could not read accounts from this browser. Check local storage and try again.", true);
			}
		});
	}

	// Game score persistence
	function saveFinalScore(score) {
		const message = document.querySelector("#score-message");
		if (!Number.isSafeInteger(score) || score < 0) {
			showMessage(message, "The game returned an invalid score.", true);
			return false;
		}

		try {
			const currentUser = localStorage.getItem(CURRENT_USER_KEY);
			if (!currentUser) {
				showMessage(message, "Please log in before playing to save your score.", true);
				return false;
			}
			const user = readUsers().find((account) => account.email === currentUser);
			if (!user) {
				localStorage.removeItem(CURRENT_USER_KEY);
				showMessage(message, "Your account was not found. Please log in again.", true);
				return false;
			}

			// Store one best-prize record per account so the leaderboard shows personal bests.
			const scores = readScores();
			const existingScore = scores.find((entry) => entry.email === currentUser);
			// Preserve each player's best prize instead of replacing it with a lower result.
			if (existingScore && score <= existingScore.score) {
				showMessage(message, `Your top score is still ${existingScore.score}.`, false);
				return true;
			}
			if (existingScore) {
				existingScore.score = score;
				existingScore.name = user.name;
			} else {
				scores.push({ name: user.name, email: currentUser, score });
			}
			localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
			window.dispatchEvent(new Event("next-millionaire:scores-changed"));
			showMessage(message, `New top score saved: ${score}.`, false);
			return true;
		} catch (error) {
			console.error("Could not save final score.", error);
			showMessage(message, "Could not save the score in this browser. Check local storage and try again.", true);
			return false;
		}
	}

	// Leaderboard rendering
	function renderLeaderboard() {
		const list = document.querySelector("#leaderboard-list");
		if (!list) {
			return;
		}
		const message = document.querySelector("#leaderboard-message");
		const registeredCount = document.querySelector("#registered-player-count");
		const scoredCount = document.querySelector("#scored-player-count");

		try {
			const users = readUsers()
				.filter((user) => typeof user.name === "string"
					&& typeof user.email === "string");
			const scores = readScores()
				.filter((entry) => typeof entry.name === "string"
					&& typeof entry.email === "string"
					&& Number.isSafeInteger(entry.score)
					&& entry.score >= 0)
				.sort((first, second) => second.score - first.score
					|| first.name.localeCompare(second.name));
			const leaderboardEntries = getLeaderboardEntries();
			const currentUser = localStorage.getItem(CURRENT_USER_KEY);
			list.replaceChildren();
			showMessage(registeredCount, `Players on this browser: ${users.length}`, false);
			showMessage(scoredCount, `Players with a saved prize: ${scores.length}`, false);
			if (leaderboardEntries.length === 0) {
				showMessage(message, "No registered players yet. Create an account to appear on the leaderboard.", false);
				return;
			}
			// Build rows with text nodes, avoiding HTML injection from user-provided display names.
			leaderboardEntries.forEach((entry, index) => {
				const item = document.createElement("li");
				item.classList.toggle("is-current-player", entry.email === currentUser);
				const rank = document.createElement("span");
				rank.className = "leaderboard-rank";
				rank.textContent = `#${index + 1}`;
				const name = document.createElement("span");
				name.className = "leaderboard-player";
				name.textContent = `${entry.name}${entry.email === currentUser ? " (you)" : ""}`;
				const score = document.createElement("span");
				score.className = "leaderboard-score";
				score.textContent = `₹${entry.score.toLocaleString("en-IN")}`;
				item.append(rank, name, score);
				list.append(item);
			});
			showMessage(message, scores.length === 0
				? "No prizes have been saved yet. Finish a game to add the first score."
				: "", false);
		} catch (error) {
			console.error("Could not load leaderboard.", error);
			showMessage(registeredCount, "Could not load registered player count.", true);
			showMessage(scoredCount, "Could not load player score count.", true);
			showMessage(message, "Could not read saved scores from this browser.", true);
		}
	}

	// Initialise only the features whose page elements are present.
	// Page startup and cross-tab updates
	updateNavigation();
	setupSignup();
	setupLogin();
	window.GameApp = { saveFinalScore, getLeaderboard: getLeaderboardEntries };
	window.addEventListener("game:ended", (event) => {
		if (!event.detail || !Object.prototype.hasOwnProperty.call(event.detail, "score")) {
			showMessage(document.querySelector("#score-message"), "The game ended without providing a score.", true);
			return;
		}
		saveFinalScore(event.detail.score);
	});
	renderLeaderboard();
	window.addEventListener("storage", (event) => {
		// The browser emits "storage" in other tabs when this profile's saved data changes.
		if (event.key === USERS_KEY || event.key === SCORES_KEY || event.key === CURRENT_USER_KEY) {
			renderLeaderboard();
			window.dispatchEvent(new Event("next-millionaire:leaderboard-updated"));
		}
	});
	window.addEventListener("next-millionaire:scores-changed", () => {
		renderLeaderboard();
		window.dispatchEvent(new Event("next-millionaire:leaderboard-updated"));
	});
	// Polling also refreshes rankings after score changes within this same tab.
	window.setInterval(() => {
		renderLeaderboard();
		window.dispatchEvent(new Event("next-millionaire:leaderboard-updated"));
	}, 5000);
})();
