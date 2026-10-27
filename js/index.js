"use strict";

(() => {
	// Home-page elements and signed-in account state
	// These elements are filled from localStorage after the signed-in player's identity is confirmed.
	const message = document.querySelector("#home-message");
	const bestPrize = document.querySelector("#home-best-prize");
	const playerRank = document.querySelector("#home-player-rank");
	const playerCount = document.querySelector("#home-player-count");
	const prizeMessage = document.querySelector("#home-prize-message");
	let currentEmail = "";

	// Dashboard data and rendering
	// Format prize values consistently with the game and leaderboard.
	function formatPrize(amount) {
		return `₹${amount.toLocaleString("en-IN")}`;
	}

	// Read saved accounts and scores, then update the signed-in player's dashboard.
	function updateDashboard() {
		try {
			const users = JSON.parse(localStorage.getItem("ourGameUsers") || "[]");
			const savedScores = JSON.parse(localStorage.getItem("ourGameScores") || "[]");
			if (!Array.isArray(users) || !Array.isArray(savedScores)) {
				throw new Error("Saved player data is invalid.");
			}

			// Convert each account to a ranked entry; players without a saved prize start at zero.
			const players = users
				.filter((user) => typeof user.name === "string" && typeof user.email === "string")
				.map((user) => {
					const score = savedScores.find((entry) => entry.email === user.email);
					return {
						name: user.name,
						email: user.email,
						score: score && Number.isSafeInteger(score.score) && score.score >= 0
							? score.score
							: 0
					};
				})
				.sort((first, second) => second.score - first.score
					|| first.name.localeCompare(second.name));
			const player = players.find((entry) => entry.email === currentEmail);
			if (!player) {
				throw new Error("Your player account could not be found.");
			}

			// Sorted position determines rank, while the saved score supplies the best-prize card.
			bestPrize.textContent = formatPrize(player.score);
			playerRank.textContent = `#${players.indexOf(player) + 1} of ${players.length}`;
			playerCount.textContent = String(players.length);
			prizeMessage.textContent = player.score > 0
				? `Amazing work, ${player.name}! Your best prize is saved. Ready to beat it?`
				: `Your first big win is waiting, ${player.name}. The whole stage is yours!`;
		} catch (error) {
			console.error("Could not update player dashboard.", error);
			message.hidden = false;
			message.textContent = "Could not load your latest score and ranking from this browser.";
		}
	}

	// Protect the dashboard by redirecting missing or invalid sessions to the login page.
	try {
		currentEmail = localStorage.getItem("ourGameCurrentUser") || "";
		if (!currentEmail) {
			window.location.replace("html/login.html");
			return;
		}

		const users = JSON.parse(localStorage.getItem("ourGameUsers") || "[]");
		if (!Array.isArray(users)) {
			throw new Error("Saved account data is invalid.");
		}
		const player = users.find((user) => user.email === currentEmail);
		if (!player) {
			localStorage.removeItem("ourGameCurrentUser");
			window.location.replace("html/login.html");
			return;
		}

		document.querySelector("#home-welcome").textContent = `Welcome to the show, ${player.name}!`;
		document.querySelectorAll("[data-auth-link]").forEach((link) => {
			link.hidden = true;
		});
		const logout = document.querySelector("#home-logout");
		logout.hidden = false;
		// Remove the local session before returning to login when the player signs out.
		logout.addEventListener("click", (event) => {
			event.preventDefault();
			localStorage.removeItem("ourGameCurrentUser");
			window.location.href = "html/login.html";
		});
		updateDashboard();
	} catch (error) {
		console.error("Could not load the home page account.", error);
		message.hidden = false;
		message.textContent = "Could not access your account in this browser. Check local storage or log in again.";
		document.querySelector("#home-welcome").textContent = "";
	}

	// Recalculate dashboard cards when a different tab changes the saved accounts or scores.
	window.addEventListener("storage", (event) => {
		if (event.key === "ourGameUsers" || event.key === "ourGameScores") {
			updateDashboard();
		}
	});
	// Listen for score updates made in this tab by the shared account/game code.
	window.addEventListener("next-millionaire:scores-changed", updateDashboard);
	// Poll as a fallback because same-tab localStorage writes do not emit "storage".
	window.setInterval(updateDashboard, 5000);
})();
