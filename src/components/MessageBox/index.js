import React, { useState } from "react";
import { socket } from "../../App";
import ReactDOM from "react-dom";

export default function MessageBox({ room, user, players }) {
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState([]);

  socket.on("recieveMessage", (messageData, roomData, userData) => {
    setMessages([...messages, userData + " : " + messageData]);
  });

  const updateMessage = (e) => {
    const input = e.target.value;
    setMessageInput(input);
  };

  const handleSubmitMessage = (e) => {
    e.preventDefault();
    if (messageInput != "") {
      socket.emit("sendMessage", messageInput, room, user);
      setMessages([...messages, user + " : " + messageInput]);
      setMessageInput("");
    }
  };

  return (
    <>
      <div id="message-container">
        <div className="messages">
          {messages.map((message) => (
            <div key={message}>{message}</div>
          ))}
        </div>

        <form
          id="message-input"
          action="javascript:void(0);"
          onSubmit={handleSubmitMessage}
        >
          <label htmlFor="message"></label>
          <input
            type="text"
            id="message"
            name="message"
            placeholder="Whats your guess?"
            className="textarea"
            value={messageInput}
            onChange={updateMessage}
          />

          <button type="submit" className="send-message-btn">
            Guess!
          </button>
        </form>
      </div>
    </>
  );
}
