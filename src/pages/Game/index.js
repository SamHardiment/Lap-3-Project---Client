import React, { useState, useEffect } from "react";
import {
  NewCanvas,
  DisplayBox,
  MessageBox,
  Users,
  Countdown,
  RandomWord,
} from "../../components";
import { socket } from "../../App";
import axios from "axios";

import "../../App.css";
import { io } from "socket.io-client";

const Game = () => {
  const [room, setRoom] = useState("");
  const [user, setUser] = useState("");
  const [players, setPlayers] = useState([]);
  const [catergory, setCatergory] = useState("");
  const [host, setHost] = useState(false);
  const [points, setPoints] = useState(0);
  const [activePlayer, setActivePlayer] = useState("");
  const [activePlayerTrue, setActivePlayerTrue] = useState(false);
  const [allWords, setAllWords] = useState("");
  const [error, setError] = useState("");
  const [mode, setMode] = useState("");

  socket.on(
    "recieveData",
    (roomData, userData, playersData, catergory, mode, host) => {
      setPlayers([...playersData]);
      setRoom(roomData);
      setUser(userData);
      setCatergory(catergory);
      setMode(mode);
      setHost(host);
    }
  );
  console.log(mode);

  let activePlayers;

  setTimeout(() => {
    activePlayers = [...players];
  }, 1000);

  useEffect(() => {
    if (host) {
      setActivePlayer(user);
    }
  }, [host]);

  useEffect(() => {
    if (host) {
      socket.emit("sendActivePlayerChange", activePlayer, room);
    }
  }, [activePlayer]);

  useEffect(() => {
    if (activePlayer != "") {
      if (user === activePlayer) {
        setActivePlayerTrue(true);
      }
    }
  }, [activePlayer]);

  socket.on("recieveActivePlayerChange", (activePlayerChange) => {
    setActivePlayer(activePlayerChange);
  });

  socket.on("recieveRemoveActivePlayer", (activePlayer) => {
    if (user == activePlayer) {
      setActivePlayerTrue(false);
    }
  });

  const getNextPlayer = () => {
    if (activePlayers.length == 1) {
      setActivePlayer(activePlayers[0]);
    }
    if (activePlayers.length == 0) {
      //Navigate here
    }

    const randomPlayer =
      activePlayers[Math.floor(Math.random() * activePlayers.length)];
    if (user == activePlayer) {
      setActivePlayerTrue(false);
    }
    socket.emit("sendRemoveActivePlayer", activePlayer, room);
    setActivePlayer(randomPlayer);

    activePlayers.splice(activePlayers.indexOf(randomPlayer), 1);
  };

  ////////  RandomWord

  useEffect(() => {
    if (host) {
      const getWords = async (catergory) => {
        if (catergory) {
          try {
            const { data } = await axios.get(
              `https://quizzards-the-game.herokuapp.com/${catergory}`
            );
            setAllWords(data);
            socket.emit("sendCatergory", catergory, room);
            socket.emit("sendCatergoryHost", catergory, room);
          } catch (err) {
            setError(err);
          }
        }
      };
      getWords(catergory);
    }
  }, [catergory]);

  useEffect(() => {
    if (allWords) {
      socket.emit("sendAllWords", allWords, room);
    }
  }, [allWords]);

  return (
    <>
      <div className="bkImgGame"></div>
      <div className="randomWord">
        <button onClick={getNextPlayer}>Press me</button>
        <RandomWord
          error={error}
          catergoryChoice={catergory}
          activePlayerTrue={activePlayerTrue}
          activePlayer={activePlayer}
          room={room}
        />
      </div>
      <div className="gamePageContainer">
        <div className="UserComponent">
          <Countdown />
          <Users room={room} user={user} players={players} points={points} />
        </div>
        <div className="canvas-container">
          <NewCanvas
            room={room}
            user={user}
            players={players}
            activePlayer={activePlayer}
            activePlayerTrue={activePlayerTrue}
            mode={mode}
          />
        </div>

        <MessageBox room={room} user={user} players={players} />
      </div>
    </>
  );
};

export default Game;
