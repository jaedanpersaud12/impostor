"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, Transition } from "framer-motion";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/space-grotesk/700.css";

type GameState =
  | "setup"
  | "names"
  | "reveal"
  | "playing"
  | "voting"
  | "results";
type Category =
  | "places"
  | "food"
  | "activities"
  | "nature"
  | "entertainment"
  | "random";

interface WordCategory {
  name: string;
  words: string[];
  emoji: string;
  gradient: string;
}

interface Vote {
  voter: string;
  votedFor: string;
}

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 },
};

const pageTransition: Transition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4,
};

export default function Home() {
  const [gameState, setGameState] = useState<GameState>("setup");
  const [playerCount, setPlayerCount] = useState(3);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [word, setWord] = useState("");
  const [impostorIndex, setImpostorIndex] = useState(-1);
  const [showWord, setShowWord] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category>("random");
  const [gameTime, setGameTime] = useState(180);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [currentVoter, setCurrentVoter] = useState(0);

  const categories: Record<Category, WordCategory> = {
    places: {
      name: "Places",
      emoji: "🏛️",
      gradient: "from-blue-500 to-cyan-500",
      words: [
        "Airport",
        "Beach",
        "Castle",
        "Desert",
        "Forest",
        "Hospital",
        "Library",
        "Museum",
        "Park",
        "Prison",
        "School",
        "Space Station",
        "Stadium",
        "Subway",
        "Zoo",
        "Haunted House",
        "Volcano",
        "Underwater City",
        "Cloud City",
        "Moon Base",
      ],
    },
    food: {
      name: "Food & Drinks",
      emoji: "🍕",
      gradient: "from-orange-500 to-red-500",
      words: [
        "Pizza",
        "Sushi",
        "Burger",
        "Ice Cream",
        "Tacos",
        "Pasta",
        "Salad",
        "Chocolate",
        "Coffee",
        "Smoothie",
        "Ramen",
        "Curry",
        "BBQ",
        "Sandwich",
        "Soup",
        "Cake",
        "Steak",
        "Seafood",
        "Fruit Salad",
        "Hot Dog",
      ],
    },
    activities: {
      name: "Activities",
      emoji: "🎮",
      gradient: "from-purple-500 to-pink-500",
      words: [
        "Gaming",
        "Swimming",
        "Dancing",
        "Painting",
        "Reading",
        "Cooking",
        "Hiking",
        "Shopping",
        "Sleeping",
        "Working Out",
        "Photography",
        "Gardening",
        "Singing",
        "Writing",
        "Coding",
        "Meditation",
        "Yoga",
        "Skateboarding",
        "Rock Climbing",
        "Bungee Jumping",
      ],
    },
    nature: {
      name: "Nature",
      emoji: "🌿",
      gradient: "from-green-500 to-emerald-500",
      words: [
        "Ocean",
        "Mountain",
        "Rainforest",
        "Desert",
        "River",
        "Waterfall",
        "Cave",
        "Island",
        "Glacier",
        "Canyon",
        "Volcano",
        "Coral Reef",
        "Savanna",
        "Tundra",
        "Swamp",
        "Prairie",
        "Fjord",
        "Geyser",
        "Aurora",
        "Rainbow",
      ],
    },
    entertainment: {
      name: "Entertainment",
      emoji: "🎬",
      gradient: "from-indigo-500 to-purple-500",
      words: [
        "Movie Theater",
        "Concert",
        "Video Game",
        "TV Show",
        "Podcast",
        "Stand-up Comedy",
        "Musical",
        "Opera",
        "Ballet",
        "Magic Show",
        "Circus",
        "Festival",
        "Theme Park",
        "Escape Room",
        "Karaoke",
        "Board Game",
        "Book Club",
        "Art Gallery",
        "Sports Game",
        "Trivia Night",
      ],
    },
    random: {
      name: "Mix It Up!",
      emoji: "🎲",
      gradient: "from-gray-600 to-gray-800",
      words: [],
    },
  };

  const startGame = () => {
    // Check if we have saved player names and they match the current player count
    const savedNames = localStorage.getItem("impostorPlayerNames");
    if (savedNames) {
      const parsedNames = JSON.parse(savedNames);
      if (
        parsedNames.length === playerCount &&
        parsedNames.every((name: string) => name.trim() !== "")
      ) {
        setPlayerNames(parsedNames);
        startGameWithNames();
        return;
      }
    }

    // Otherwise, go to name entry
    setPlayerNames(new Array(playerCount).fill(""));
    setGameState("names");
  };

  const startGameWithNames = () => {
    // Save player names to localStorage
    localStorage.setItem("impostorPlayerNames", JSON.stringify(playerNames));

    let wordList: string[] = [];

    if (selectedCategory === "random") {
      wordList = Object.values(categories)
        .filter((cat) => cat.name !== "Mix It Up!")
        .flatMap((cat) => cat.words);
    } else {
      wordList = categories[selectedCategory].words;
    }

    const randomWord = wordList[Math.floor(Math.random() * wordList.length)];
    const randomImpostor = Math.floor(Math.random() * playerCount);
    setWord(randomWord);
    setImpostorIndex(randomImpostor);
    setCurrentPlayer(0);
    setVotes([]);
    setCurrentVoter(0);
    setGameState("reveal");
  };

  const showPlayerWord = () => {
    setShowWord(true);
  };

  const nextPlayer = () => {
    setShowWord(false);
    if (currentPlayer < playerCount - 1) {
      setCurrentPlayer(currentPlayer + 1);
    } else {
      setGameState("playing");
      setTimeLeft(gameTime);
      setIsTimerRunning(true);
    }
  };

  const resetGame = () => {
    setGameState("setup");
    setCurrentPlayer(0);
    setShowWord(false);
    setIsTimerRunning(false);
    setTimeLeft(0);
    setVotes([]);
    setCurrentVoter(0);
    // Keep player names for next game
  };

  const changePlayers = () => {
    setPlayerNames(new Array(playerCount).fill(""));
    setGameState("names");
  };

  const handleVote = (votedFor: string) => {
    const newVote: Vote = {
      voter: playerNames[currentVoter],
      votedFor: votedFor,
    };
    setVotes([...votes, newVote]);

    if (currentVoter < playerCount - 1) {
      setCurrentVoter(currentVoter + 1);
    } else {
      setGameState("results");
    }
  };

  const getVoteCount = () => {
    const voteCount: Record<string, number> = {};
    playerNames.forEach((name) => {
      voteCount[name] = 0;
    });
    votes.forEach((vote) => {
      voteCount[vote.votedFor]++;
    });
    return voteCount;
  };

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setGameState("voting");
    }
  }, [timeLeft, isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Load saved player names on component mount
  useEffect(() => {
    const savedNames = localStorage.getItem("impostorPlayerNames");
    if (savedNames) {
      try {
        const parsedNames = JSON.parse(savedNames);
        if (Array.isArray(parsedNames) && parsedNames.length > 0) {
          setPlayerNames(parsedNames);
          setPlayerCount(parsedNames.length);
        }
      } catch (error) {
        // Invalid saved data, ignore
      }
    }
  }, []);

  return (
    <main className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-2 sm:p-4 overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={gameState}
          initial="initial"
          animate="in"
          exit="out"
          variants={pageVariants}
          transition={pageTransition}
          className="w-full max-w-2xl h-full max-h-screen overflow-y-auto"
        >
          {gameState === "setup" && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl h-fit">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                className="text-center mb-6"
              >
                <h1
                  className="text-4xl sm:text-5xl font-bold mb-2 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  IMPOSTOR
                </h1>
                <p className="text-gray-500 text-sm sm:text-base">
                  One of you doesn&apos;t belong...
                </p>
              </motion.div>

              <div className="space-y-4">
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Players:{" "}
                    <span className="text-xl font-bold text-gray-900">
                      {playerCount}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="3"
                    max="10"
                    value={playerCount}
                    onChange={(e) => {
                      const newCount = Number(e.target.value);
                      setPlayerCount(newCount);
                      // If we have saved names and the count doesn't match, clear the saved names
                      if (
                        playerNames.length > 0 &&
                        playerNames.length !== newCount
                      ) {
                        setPlayerNames([]);
                      }
                    }}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-gray-400 mt-1 text-xs">
                    <span>3</span>
                    <span>10</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <label className="text-gray-700 text-sm font-medium mb-2 block">
                    Timer:{" "}
                    <span className="text-xl font-bold text-gray-900">
                      {formatTime(gameTime)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="60"
                    max="300"
                    step="30"
                    value={gameTime}
                    onChange={(e) => setGameTime(Number(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-gray-400 mt-1 text-xs">
                    <span>1:00</span>
                    <span>5:00</span>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gray-50 rounded-xl p-4"
                >
                  <label className="text-gray-700 text-sm font-medium mb-3 block">
                    Category
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(categories).map(([key, cat], index) => (
                      <motion.button
                        key={key}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 + index * 0.05 }}
                        onClick={() => setSelectedCategory(key as Category)}
                        className={`p-2 rounded-lg transition-all ${
                          selectedCategory === key
                            ? `bg-gradient-to-r ${cat.gradient} text-white shadow-lg`
                            : "bg-white border border-gray-200 text-gray-700 hover:border-gray-300"
                        }`}
                      >
                        <div className="text-lg mb-1">{cat.emoji}</div>
                        <div className="text-xs font-medium leading-tight">
                          {cat.name}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {playerNames.length > 0 &&
                  playerNames.every((name) => name.trim() !== "") && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-blue-50 rounded-xl p-4 mb-4"
                    >
                      <p className="text-blue-700 text-sm font-medium mb-2">
                        Current Players:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {playerNames.slice(0, playerCount).map((name, i) => (
                          <span
                            key={i}
                            className="bg-blue-100 text-blue-800 px-2 py-1 rounded-lg text-xs font-medium"
                          >
                            {name}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}

                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={startGame}
                    className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 px-6 rounded-xl text-base font-semibold transition-all shadow-lg hover:shadow-xl"
                  >
                    Start Game
                  </motion.button>

                  {playerNames.length > 0 &&
                    playerNames.every((name) => name.trim() !== "") && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        onClick={changePlayers}
                        className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-6 rounded-xl text-sm font-medium transition-all"
                      >
                        Change Players
                      </motion.button>
                    )}
                </div>
              </div>
            </div>
          )}

          {gameState === "names" && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl h-fit">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl sm:text-4xl font-bold text-center mb-6 text-gray-800"
                style={{ fontFamily: "Space Grotesk" }}
              >
                Enter Names
              </motion.h2>

              <div className="space-y-3 mb-6">
                {Array.from({ length: playerCount }, (_, i) => (
                  <motion.div
                    key={i}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-gray-50 rounded-lg p-3"
                  >
                    <label className="text-gray-600 text-xs mb-1 block font-medium">
                      Player {i + 1}
                    </label>
                    <input
                      type="text"
                      value={playerNames[i] || ""}
                      onChange={(e) => {
                        const newNames = [...playerNames];
                        newNames[i] = e.target.value;
                        setPlayerNames(newNames);
                      }}
                      placeholder="Enter name..."
                      className="w-full bg-white text-gray-800 px-3 py-2 rounded-md border border-gray-200 focus:border-gray-400 focus:outline-none transition-colors text-sm"
                      maxLength={20}
                    />
                  </motion.div>
                ))}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={startGameWithNames}
                disabled={playerNames.some(
                  (name) => !name || name.trim() === ""
                )}
                className={`w-full py-4 px-6 rounded-xl text-base font-semibold transition-all ${
                  playerNames.some((name) => !name || name.trim() === "")
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-lg hover:shadow-xl"
                }`}
              >
                Continue
              </motion.button>
            </div>
          )}

          {gameState === "reveal" && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl h-fit">
              <motion.h2
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl sm:text-4xl font-bold text-center mb-6 text-gray-800"
                style={{ fontFamily: "Space Grotesk" }}
              >
                {playerNames[currentPlayer]?.toUpperCase()}
              </motion.h2>

              {!showWord ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                    className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center"
                  >
                    <span className="text-4xl">🤐</span>
                  </motion.div>
                  <p className="text-gray-600 text-lg mb-2">
                    Ready to see your word?
                  </p>
                  <p className="text-gray-400 text-sm mb-6">
                    Make sure others can&apos;t see!
                  </p>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={showPlayerWord}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white py-4 px-8 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl"
                  >
                    Reveal Word
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center"
                >
                  <motion.div
                    initial={{ rotate: 180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className={`p-6 rounded-xl mb-6 ${
                      currentPlayer === impostorIndex
                        ? "bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200"
                        : "bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200"
                    }`}
                  >
                    <p
                      className="text-4xl sm:text-5xl font-bold mb-3"
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      {currentPlayer === impostorIndex ? (
                        <span className="text-red-600">IMPOSTOR</span>
                      ) : (
                        <span className="text-blue-600">
                          {word.toUpperCase()}
                        </span>
                      )}
                    </p>
                    {currentPlayer === impostorIndex && (
                      <motion.p
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-orange-600 text-sm font-medium"
                      >
                        You must guess the word!
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextPlayer}
                    className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 px-8 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl"
                  >
                    {currentPlayer < playerCount - 1
                      ? "Next Player"
                      : "Start Round"}
                  </motion.button>
                </motion.div>
              )}
            </div>
          )}

          {gameState === "playing" && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl text-center h-fit">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`mb-4 text-5xl sm:text-6xl font-bold ${
                  timeLeft <= 30 ? "text-red-500" : "text-gray-800"
                }`}
                style={{ fontFamily: "Space Grotesk" }}
              >
                {timeLeft <= 30 && (
                  <motion.div
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                  >
                    {formatTime(timeLeft)}
                  </motion.div>
                )}
                {timeLeft > 30 && formatTime(timeLeft)}
              </motion.div>

              <h2
                className="text-2xl sm:text-3xl font-bold mb-4 text-gray-800"
                style={{ fontFamily: "Space Grotesk" }}
              >
                GAME ON!
              </h2>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4"
              >
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="text-4xl mb-2"
                >
                  🎭
                </motion.div>
                <p className="text-gray-700 text-base mb-1 font-medium">
                  Take turns giving clues!
                </p>
                <p className="text-gray-500 text-xs">
                  Remember: The impostor doesn&apos;t know the word!
                </p>
              </motion.div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <p className="text-gray-500 text-xs mb-1">The word is:</p>
                  <p
                    className="text-lg font-bold text-gray-800"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    ???
                  </p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="bg-gray-50 rounded-lg p-3"
                >
                  <p className="text-gray-500 text-xs mb-1">Impostor:</p>
                  <p
                    className="text-lg font-bold text-gray-800"
                    style={{ fontFamily: "Space Grotesk" }}
                  >
                    ???
                  </p>
                </motion.div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setIsTimerRunning(false);
                  setGameState("voting");
                }}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-6 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl mb-3"
              >
                Vote Out Impostor
              </motion.button>

              <button
                onClick={resetGame}
                className="text-gray-400 hover:text-gray-600 text-xs transition-colors"
              >
                End Game Early
              </button>
            </div>
          )}

          {gameState === "voting" && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl text-center h-fit">
              <motion.h2
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800"
                style={{ fontFamily: "Space Grotesk" }}
              >
                VOTING TIME
              </motion.h2>

              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 mb-4"
              >
                <p
                  className="text-xl font-bold text-gray-800 mb-1"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  {playerNames[currentVoter]}&apos;s Turn
                </p>
                <p className="text-gray-600 text-sm">
                  Who do you think is the impostor?
                </p>
              </motion.div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                {playerNames.map((name, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{
                      scale: name !== playerNames[currentVoter] ? 1.05 : 1,
                    }}
                    whileTap={{
                      scale: name !== playerNames[currentVoter] ? 0.95 : 1,
                    }}
                    onClick={() => handleVote(name)}
                    disabled={name === playerNames[currentVoter]}
                    className={`p-4 rounded-lg transition-all ${
                      name === playerNames[currentVoter]
                        ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-800 shadow-md hover:shadow-lg"
                    }`}
                  >
                    <p
                      className="text-lg font-bold mb-1"
                      style={{ fontFamily: "Space Grotesk" }}
                    >
                      {name.toUpperCase()}
                    </p>
                    {name === playerNames[currentVoter] && (
                      <p className="text-xs text-gray-400">
                        Can&apos;t vote yourself!
                      </p>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="text-gray-500 text-sm">
                Vote {currentVoter + 1} of {playerCount}
              </div>
            </div>
          )}

          {gameState === "results" && (
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl text-center h-fit">
              <motion.h2
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800"
                style={{ fontFamily: "Space Grotesk" }}
              >
                GAME OVER
              </motion.h2>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 mb-4"
              >
                <p className="text-gray-600 text-sm mb-3 font-medium">
                  Vote Results
                </p>
                <div className="space-y-2">
                  {Object.entries(getVoteCount())
                    .sort(([, a], [, b]) => b - a)
                    .map(([name, count], index) => (
                      <motion.div
                        key={name}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.3 + index * 0.1 }}
                        className="bg-white rounded-lg p-2 flex justify-between items-center shadow-sm"
                      >
                        <span className="text-gray-800 font-semibold text-sm">
                          {name}
                        </span>
                        <span className="text-gray-600 text-xs">
                          {count} vote{count !== 1 ? "s" : ""}
                        </span>
                      </motion.div>
                    ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 mb-4"
              >
                <p className="text-gray-600 text-xs mb-2">The word was:</p>
                <p
                  className="text-3xl font-bold text-blue-600 mb-2"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  {word.toUpperCase()}
                </p>
                <p className="text-gray-500 text-xs">
                  Category:{" "}
                  {selectedCategory === "random"
                    ? "Mixed"
                    : categories[selectedCategory].name}
                </p>
              </motion.div>

              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
                className="bg-gradient-to-br from-red-50 to-orange-50 rounded-xl p-4 mb-6 border border-red-200"
              >
                <div className="text-3xl mb-2">🎭</div>
                <p
                  className="text-2xl font-bold text-red-600 mb-1"
                  style={{ fontFamily: "Space Grotesk" }}
                >
                  {playerNames[impostorIndex]?.toUpperCase()}
                </p>
                <p className="text-gray-600 text-sm">was the Impostor!</p>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
                onClick={resetGame}
                className="w-full bg-gradient-to-r from-gray-800 to-gray-900 text-white py-4 px-6 rounded-xl text-base font-semibold shadow-lg hover:shadow-xl"
              >
                New Game
              </motion.button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  );
}
