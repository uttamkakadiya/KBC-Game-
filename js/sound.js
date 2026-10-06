"use strict";

(() => {
	// Sound is synthesized locally with Web Audio, so no external audio files are needed.
	// Audio state
	const soundButton = document.querySelector("#sound-toggle");
	const soundStatus = document.querySelector("#sound-status");
	const AudioContextConstructor = window.AudioContext || window.webkitAudioContext;
	let audioContext = null;
	let masterGain = null;
	let enabled = true;
	let ambienceTimer = null;
	const ambienceOscillators = new Set();
	let ambienceActive = false;
	let ambienceStep = 0;

	function updateControl() {
		soundButton.textContent = `Sound: ${enabled ? "On" : "Off"}`;
		soundButton.setAttribute("aria-pressed", String(enabled));
	}

	function setStatus(message, isError = false) {
		soundStatus.textContent = message;
		soundStatus.classList.toggle("is-error", isError);
	}

	function getAudioContext() {
		// Browsers require audio to be resumed after a real user interaction.
		if (!AudioContextConstructor) {
			throw new Error("Web Audio is not supported in this browser.");
		}
		if (!audioContext) {
			audioContext = new AudioContextConstructor();
			masterGain = audioContext.createGain();
			masterGain.gain.value = 0.75;
			masterGain.connect(audioContext.destination);
		}
		return audioContext;
	}

	// Sound primitives and effects
	function makeNoiseBuffer(duration) {
		// Short random-noise buffers create original synthesized crowd and clap textures.
		const frameCount = Math.ceil(audioContext.sampleRate * duration);
		const buffer = audioContext.createBuffer(1, frameCount, audioContext.sampleRate);
		const channel = buffer.getChannelData(0);
		for (let index = 0; index < frameCount; index += 1) {
			channel[index] = Math.random() * 2 - 1;
		}
		return buffer;
	}

	function playTone(frequency, startTime, duration, volume, wave = "sine", ambience = false) {
		// Each note uses its own oscillator and envelope to fade smoothly in and out.
		const oscillator = audioContext.createOscillator();
		const gain = audioContext.createGain();
		oscillator.type = wave;
		oscillator.frequency.setValueAtTime(frequency, startTime);
		gain.gain.setValueAtTime(0.0001, startTime);
		gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.025);
		gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
		oscillator.connect(gain);
		gain.connect(masterGain);
		if (ambience) {
			ambienceOscillators.add(oscillator);
			oscillator.addEventListener("ended", () => ambienceOscillators.delete(oscillator), { once: true });
		}
		oscillator.start(startTime);
		oscillator.stop(startTime + duration + 0.03);
	}

	function playApplause(intensity = 1) {
		// A 2.5-second crowd bed plus sharp, varied transients makes each clap distinct.
		runAudio(() => {
			const now = audioContext.currentTime + 0.02;
			const filter = audioContext.createBiquadFilter();
			const master = audioContext.createGain();
			const duration = 2.5;
			filter.type = "bandpass";
			filter.frequency.value = 1800;
			filter.Q.value = 0.65;
			master.gain.setValueAtTime(0.0001, now);
			master.gain.exponentialRampToValueAtTime(0.32, now + 0.18);
			master.gain.setValueAtTime(0.27, now + duration * 0.65);
			master.gain.exponentialRampToValueAtTime(0.0001, now + duration);
			filter.connect(master);
			master.connect(masterGain);

			// Quiet looping crowd noise sits behind the louder, high-frequency handclap transients.
			const noise = audioContext.createBufferSource();
			noise.buffer = makeNoiseBuffer(0.22);
			noise.loop = true;
			noise.connect(filter);
			noise.start(now);
			noise.stop(now + duration);

			const numberOfClaps = Math.round(53 * Math.min(intensity, 1.4));
			for (let index = 0; index < numberOfClaps; index += 1) {
				const offset = Math.random() * (duration - 0.12);
				const transient = audioContext.createBufferSource();
				const transientFilter = audioContext.createBiquadFilter();
				const transientGain = audioContext.createGain();
				const clapTime = now + offset;
				transient.buffer = makeNoiseBuffer(0.035);
				transientFilter.type = "highpass";
				transientFilter.frequency.value = 1400 + Math.random() * 2200;
				transientGain.gain.setValueAtTime(0.0001, clapTime);
				transientGain.gain.exponentialRampToValueAtTime(0.38 + Math.random() * 0.42, clapTime + 0.003);
				transientGain.gain.exponentialRampToValueAtTime(0.0001, clapTime + 0.035 + Math.random() * 0.035);
				transient.connect(transientFilter);
				transientFilter.connect(transientGain);
				transientGain.connect(master);
				transient.start(clapTime);
				transient.stop(clapTime + 0.075);
			}
		});
	}

	function playSadPiano() {
		runAudio(() => {
			const now = audioContext.currentTime + 0.02;
			// A slow, descending minor-key phrase with layered harmonics evokes a soft piano.
			const notes = [
				{ frequency: 293.66, offset: 0, duration: 1.05, volume: 0.07 },
				{ frequency: 261.63, offset: 0.52, duration: 1.05, volume: 0.065 },
				{ frequency: 233.08, offset: 1.04, duration: 1.35, volume: 0.06 }
			];
			notes.forEach(({ frequency, offset, duration, volume }, noteIndex) => {
				const noteStart = now + offset;
				const toneFilter = audioContext.createBiquadFilter();
				toneFilter.type = "lowpass";
				toneFilter.frequency.value = 1250 - noteIndex * 100;
				toneFilter.connect(masterGain);
				[[1, 1], [2, 0.24], [3, 0.08]].forEach(([harmonic, level]) => {
					const oscillator = audioContext.createOscillator();
					const envelope = audioContext.createGain();
					oscillator.type = "sine";
					oscillator.frequency.setValueAtTime(frequency * harmonic, noteStart);
					envelope.gain.setValueAtTime(0.0001, noteStart);
					envelope.gain.exponentialRampToValueAtTime(volume * level, noteStart + 0.025);
					envelope.gain.exponentialRampToValueAtTime(volume * level * 0.2, noteStart + 0.16);
					envelope.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration);
					oscillator.connect(envelope);
					envelope.connect(toneFilter);
					oscillator.start(noteStart);
					oscillator.stop(noteStart + duration + 0.03);
				});
			});
		});
	}

	// Audio startup and game-event cues
	function runAudio(action) {
		if (!enabled) {
			return;
		}
		try {
			const context = getAudioContext();
			context.resume().then(() => {
				if (enabled) {
					action();
				}
			}).catch((error) => {
				console.error("Could not start game audio.", error);
				setStatus("Sound could not start. Use the sound button to try again.", true);
			});
		} catch (error) {
			console.error("Could not initialize game audio.", error);
			setStatus("Sound is not available in this browser.", true);
			enabled = false;
			updateControl();
		}
	}

	function playCue(name) {
		// Map game events to sound layers and short original musical note sequences.
		if (name === "incorrect") {
			playSadPiano();
			return;
		}
		if (name === "correct") {
			playApplause();
			playToneCue([[523, 0], [659, 0.09], [784, 0.18]]);
			return;
		}
		if (name === "milestone") {
			playToneCue([[523, 0], [659, 0.11], [784, 0.22], [1047, 0.35]]);
			return;
		}
		if (name === "win") {
			playToneCue([[523, 0], [659, 0.13], [784, 0.26], [1047, 0.42], [1319, 0.58]]);
			return;
		}
		playToneCue({
			start: [[392, 0], [523, 0.12], [659, 0.24]],
			lifeline: [[587, 0], [784, 0.1]]
		}[name]);
	}

	function playToneCue(notes) {
		runAudio(() => {
			const now = audioContext.currentTime + 0.02;
			if (!notes) {
				console.error("Unknown game sound cue.");
				return;
			}
			notes.forEach(([frequency, offset]) => {
				playTone(frequency, now + offset, 0.34, 0.055, "triangle");
			});
		});
	}

	// Background studio ambience
	function playAmbience() {
		if (!ambienceActive) {
			return;
		}
		runAudio(() => {
			if (!ambienceActive) {
				return;
			}
			// Slowly rotating quiet chords add studio tension while a game is in progress.
			const chordSets = [
				[130.81, 196, 261.63],
				[146.83, 220, 293.66],
				[110, 164.81, 220],
				[123.47, 185, 246.94]
			];
			const now = audioContext.currentTime + 0.05;
			chordSets[ambienceStep % chordSets.length].forEach((frequency, index) => {
				playTone(frequency, now + index * 0.08, 3.3, 0.012, "sine", true);
			});
			ambienceStep += 1;
		});
	}

	function startAmbience() {
		stopAmbience();
		ambienceStep = 0;
		ambienceActive = true;
		playAmbience();
		ambienceTimer = window.setInterval(playAmbience, 3200);
	}

	function stopAmbience() {
		ambienceActive = false;
		if (ambienceTimer !== null) {
			window.clearInterval(ambienceTimer);
			ambienceTimer = null;
		}
		ambienceOscillators.forEach((oscillator) => oscillator.stop());
		ambienceOscillators.clear();
	}

	// Sound toggle and public game-audio API
	soundButton.addEventListener("click", () => {
		// The toggle also stops ongoing ambience when sound is switched off.
		enabled = !enabled;
		updateControl();
		if (enabled) {
			if (audioContext && masterGain) {
				masterGain.gain.setTargetAtTime(0.75, audioContext.currentTime, 0.04);
			}
			setStatus("Applause and game sounds are on.");
			playCue("start");
		} else {
			stopAmbience();
			if (audioContext && masterGain) {
				masterGain.gain.setTargetAtTime(0, audioContext.currentTime, 0.04);
			}
			setStatus("Sound is off.");
		}
	});

	updateControl();
	window.QuizShowSound = {
		play: playCue,
		startAmbience,
		stopAmbience,
		applaud: playApplause
	};
})();
