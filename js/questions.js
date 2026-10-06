"use strict";

// Each outer array is one prize/difficulty round; every inner item is a distinct GK alternative.
// game.js rotates through each round's questions without repeating them for the signed-in player.
// The answer property is the zero-based correct option index used by game.js.
window.KbcQuestionBank = [
	// Prize rounds 1–5: introductory general knowledge.
	[
		{
			question: "How many days are there in a week?",
			options: [
				"Five",
				"Six",
				"Seven",
				"Eight"
			],
			answer: 2
		},
		{
			question: "Which planet is known as the Red Planet?",
			options: [
				"Venus",
				"Mars",
				"Jupiter",
				"Mercury"
			],
			answer: 1
		},
		{
			question: "What is the largest ocean on Earth?",
			options: [
				"Atlantic Ocean",
				"Indian Ocean",
				"Pacific Ocean",
				"Arctic Ocean"
			],
			answer: 2
		},
		{
			question: "What is the currency of Japan?",
			options: [
				"Won",
				"Yuan",
				"Yen",
				"Ringgit"
			],
			answer: 2
		},
	],
	// Prize round 2 of 15.
	[
		{
			question: "Which of these is a primary colour of light?",
			options: [
				"Red",
				"Brown",
				"Pink",
				"Grey"
			],
			answer: 0
		},
		{
			question: "Which language is the official language of Brazil?",
			options: [
				"Spanish",
				"French",
				"Portuguese",
				"Italian"
			],
			answer: 2
		},
		{
			question: "Which is the largest planet in our solar system?",
			options: [
				"Earth",
				"Saturn",
				"Jupiter",
				"Neptune"
			],
			answer: 2
		},
		{
			question: "On which continent is Egypt located?",
			options: [
				"Asia",
				"Africa",
				"Europe",
				"South America"
			],
			answer: 1
		},
	],
	// Prize round 3 of 15.
	[
		{
			question: "Which ocean lies between Africa and Australia?",
			options: [
				"Atlantic Ocean",
				"Indian Ocean",
				"Arctic Ocean",
				"Southern Ocean"
			],
			answer: 1
		},
		{
			question: "Which gas do green plants absorb from the air during photosynthesis?",
			options: [
				"Oxygen",
				"Helium",
				"Carbon dioxide",
				"Hydrogen"
			],
			answer: 2
		},
		{
			question: "What is the capital city of Japan?",
			options: [
				"Kyoto",
				"Osaka",
				"Tokyo",
				"Nagoya"
			],
			answer: 2
		},
		{
			question: "Which of these animals is a mammal that can fly?",
			options: [
				"Eagle",
				"Bat",
				"Penguin",
				"Butterfly"
			],
			answer: 1
		},
	],
	// Prize round 4 of 15.
	[
		{
			question: "Which planet has a giant storm known as the Great Red Spot?",
			options: [
				"Mars",
				"Jupiter",
				"Saturn",
				"Neptune"
			],
			answer: 1
		},
		{
			question: "Which European capital is traditionally said to have been built on seven hills?",
			options: [
				"Athens",
				"Rome",
				"Lisbon",
				"Prague"
			],
			answer: 1
		},
		{
			question: "What is the highest mountain above sea level?",
			options: [
				"K2",
				"Mount Kilimanjaro",
				"Mount Everest",
				"Denali"
			],
			answer: 2
		},
		{
			question: "What is the currency of the United Kingdom?",
			options: [
				"Euro",
				"Pound sterling",
				"Franc",
				"Krone"
			],
			answer: 1
		},
	],
	// Prize round 5 of 15.
	[
		{
			question: "What is the chemical formula for water?",
			options: [
				"CO2",
				"H2O",
				"O2",
				"NaCl"
			],
			answer: 1
		},
		{
			question: "What is an animal called if it eats both plants and other animals?",
			options: [
				"Herbivore",
				"Carnivore",
				"Omnivore",
				"Insectivore"
			],
			answer: 2
		},
		{
			question: "Which river flows through the city of Paris?",
			options: [
				"The Rhine",
				"The Seine",
				"The Danube",
				"The Thames"
			],
			answer: 1
		},
		{
			question: "Who wrote the book The Jungle Book?",
			options: [
				"Rudyard Kipling",
				"Mark Twain",
				"Jules Verne",
				"Charles Dickens"
			],
			answer: 0
		},
	],
	// Prize rounds 6–10: intermediate general knowledge.
	[
		{
			question: "How many chambers does a human heart have?",
			options: [
				"Two",
				"Three",
				"Four",
				"Five"
			],
			answer: 2
		},
		{
			question: "What is the largest land animal alive today?",
			options: [
				"Giraffe",
				"African elephant",
				"Hippopotamus",
				"Rhinoceros"
			],
			answer: 1
		},
		{
			question: "Which country is home to the ancient city of Petra?",
			options: [
				"Jordan",
				"Greece",
				"Peru",
				"India"
			],
			answer: 0
		},
		{
			question: "What is the name of the galaxy that contains our Solar System?",
			options: [
				"Andromeda",
				"Whirlpool",
				"Milky Way",
				"Sombrero"
			],
			answer: 2
		},
	],
	// Prize round 7 of 15.
	[
		{
			question: "What is the capital city of India?",
			options: [
				"Mumbai",
				"Kolkata",
				"New Delhi",
				"Jaipur"
			],
			answer: 2
		},
		{
			question: "Which star is closest to Earth?",
			options: [
				"Sirius",
				"The Sun",
				"Polaris",
				"Vega"
			],
			answer: 1
		},
		{
			question: "Which country gave the Statue of Liberty to the United States?",
			options: [
				"France",
				"Spain",
				"Italy",
				"Canada"
			],
			answer: 0
		},
		{
			question: "Which sea separates Europe from Africa?",
			options: [
				"Caribbean Sea",
				"Mediterranean Sea",
				"Arabian Sea",
				"Baltic Sea"
			],
			answer: 1
		},
	],
	// Prize round 8 of 15.
	[
		{
			question: "What is the chemical symbol for sodium?",
			options: [
				"S",
				"So",
				"Na",
				"N"
			],
			answer: 2
		},
		{
			question: "Which animal is known for the fastest running speed on land?",
			options: [
				"Cheetah",
				"Lion",
				"Greyhound",
				"Ostrich"
			],
			answer: 0
		},
		{
			question: "In which country did the Olympic Games originate?",
			options: [
				"Italy",
				"Greece",
				"Egypt",
				"China"
			],
			answer: 1
		},
		{
			question: "Which part of a plant usually absorbs water from the soil?",
			options: [
				"Flower",
				"Leaf",
				"Root",
				"Fruit"
			],
			answer: 2
		},
	],
	// Prize round 9 of 15.
	[
		{
			question: "Which planet is famous for its prominent ring system?",
			options: [
				"Mars",
				"Saturn",
				"Venus",
				"Mercury"
			],
			answer: 1
		},
		{
			question: "Which instrument measures atmospheric pressure?",
			options: [
				"Thermometer",
				"Barometer",
				"Hygrometer",
				"Anemometer"
			],
			answer: 1
		},
		{
			question: "Who was the first person to walk on the Moon?",
			options: [
				"Yuri Gagarin",
				"Buzz Aldrin",
				"Neil Armstrong",
				"Michael Collins"
			],
			answer: 2
		},
		{
			question: "Which metal is liquid at room temperature?",
			options: [
				"Iron",
				"Mercury",
				"Copper",
				"Aluminium"
			],
			answer: 1
		},
	],
	// Prize round 10 of 15.
	[
		{
			question: "What is the chemical symbol for tungsten?",
			options: [
				"Tn",
				"Tu",
				"W",
				"Tg"
			],
			answer: 2
		},
		{
			question: "Which is the largest desert on Earth by area?",
			options: [
				"Sahara Desert",
				"Arabian Desert",
				"Gobi Desert",
				"Antarctic Desert"
			],
			answer: 3
		},
		{
			question: "Which ancient civilisation built Machu Picchu?",
			options: [
				"Maya",
				"Inca",
				"Roman",
				"Aztec"
			],
			answer: 1
		},
		{
			question: "What is the name of the deepest known ocean trench?",
			options: [
				"Java Trench",
				"Tonga Trench",
				"Mariana Trench",
				"Puerto Rico Trench"
			],
			answer: 2
		},
	],
	// Prize rounds 11–15: advanced general knowledge.
	[
		{
			question: "Which part of a cell is often called its powerhouse?",
			options: [
				"Nucleus",
				"Mitochondrion",
				"Ribosome",
				"Cell wall"
			],
			answer: 1
		},
		{
			question: "Which artist painted the ceiling of the Sistine Chapel?",
			options: [
				"Raphael",
				"Michelangelo",
				"Donatello",
				"Titian"
			],
			answer: 1
		},
		{
			question: "What is the smallest bone in the human body?",
			options: [
				"Stapes",
				"Femur",
				"Patella",
				"Ulna"
			],
			answer: 0
		},
		{
			question: "Which country was formerly known as Persia?",
			options: [
				"Iraq",
				"Iran",
				"Syria",
				"Turkey"
			],
			answer: 1
		},
	],
	// Prize round 12 of 15.
	[
		{
			question: "What is the capital city of Thailand?",
			options: [
				"Hanoi",
				"Bangkok",
				"Manila",
				"Phnom Penh"
			],
			answer: 1
		},
		{
			question: "Which element has the chemical symbol Au?",
			options: [
				"Silver",
				"Gold",
				"Argon",
				"Aluminium"
			],
			answer: 1
		},
		{
			question: "Which treaty formally ended the First World War between Germany and the Allied Powers?",
			options: [
				"Treaty of Paris",
				"Treaty of Versailles",
				"Treaty of Utrecht",
				"Treaty of Tordesillas"
			],
			answer: 1
		},
		{
			question: "Which blood type is commonly called the universal red-cell donor?",
			options: [
				"AB positive",
				"A negative",
				"O negative",
				"B positive"
			],
			answer: 2
		},
	],
	// Prize round 13 of 15.
	[
		{
			question: "Which element is the most abundant in Earth's atmosphere?",
			options: [
				"Oxygen",
				"Carbon dioxide",
				"Nitrogen",
				"Argon"
			],
			answer: 2
		},
		{
			question: "Which scientist formulated the three laws of motion?",
			options: [
				"Isaac Newton",
				"Marie Curie",
				"Charles Darwin",
				"Niels Bohr"
			],
			answer: 0
		},
		{
			question: "What is the name of the process by which a liquid changes into a gas?",
			options: [
				"Condensation",
				"Evaporation",
				"Freezing",
				"Deposition"
			],
			answer: 1
		},
		{
			question: "Which strait separates Spain from Morocco?",
			options: [
				"Strait of Gibraltar",
				"Bosphorus",
				"Strait of Hormuz",
				"Danish strait"
			],
			answer: 0
		},
	],
	// Prize round 14 of 15.
	[
		{
			question: "Which painter created the artwork commonly known as the Mona Lisa?",
			options: [
				"Claude Monet",
				"Vincent van Gogh",
				"Leonardo da Vinci",
				"Rembrandt"
			],
			answer: 2
		},
		{
			question: "Which country was the first to grant women the right to vote in national elections?",
			options: [
				"New Zealand",
				"France",
				"Canada",
				"Japan"
			],
			answer: 0
		},
		{
			question: "What is the SI unit of electrical resistance?",
			options: [
				"Volt",
				"Watt",
				"Ohm",
				"Ampere"
			],
			answer: 2
		},
		{
			question: "Which African lake is the world's largest tropical lake by area?",
			options: [
				"Lake Tanganyika",
				"Lake Malawi",
				"Lake Victoria",
				"Lake Chad"
			],
			answer: 2
		},
	],
	// Prize round 15 of 15.
	[
		{
			question: "Which mathematician is associated with the incompleteness theorems?",
			options: [
				"Kurt Gödel",
				"Alan Turing",
				"Euclid",
				"Blaise Pascal"
			],
			answer: 0
		},
		{
			question: "Which particle carries the electromagnetic force?",
			options: [
				"Gluon",
				"Photon",
				"Neutrino",
				"Higgs boson"
			],
			answer: 1
		},
		{
			question: "Which 1648 settlement ended the Thirty Years' War in Europe?",
			options: [
				"Peace of Westphalia",
				"Congress of Vienna",
				"Peace of Augsburg",
				"Treaty of Ghent"
			],
			answer: 0
		},
		{
			question: "Which moon in the Solar System has a dense atmosphere and lakes of liquid methane?",
			options: [
				"Europa",
				"Titan",
				"Phobos",
				"Callisto"
			],
			answer: 1
		},
	]
];
