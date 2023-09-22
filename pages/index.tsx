import React, { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

type IMessage = { name: string; text: string };

const Home = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const [text, setText] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [socket, setSocket] = useState<Socket | null>(null);

  const sendMessage = () => {
    if (socket) {
      socket.emit(
        "createMessage",
        { name, text, room: roomId },
        (data: IMessage) => {
          console.log({ data });
        }
      );
    }
  };

  const join = () => {
    if (socket) {
      socket.emit("join", { room: roomId }, (data: IMessage) => {
        getAllMessages();
      });
    }
  };

  let timeout: NodeJS.Timeout | null = null;
  const emitTyping = (e: React.FormEvent<HTMLInputElement>) => {
    setText(e.currentTarget.value);
  };

  const getAllMessages = () => {
    if (socket) {
      socket.emit("findAllMessages", { room: roomId }, (data: IMessage[]) => {
        console.log({ data });
        setMessages(data);
      });
    }
  };

  useEffect(() => {
    const socketInstance = io("http://localhost:3001");
    setSocket(socketInstance);

    socketInstance.on("connect", () => {
      console.log("Connected to the server");
    });

    getAllMessages();

    socketInstance.on("message", (data: IMessage[], room: string) => {

      console.log({ data, room });
      setMessages(data);
    });

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
      }
    };
  }, []);

  return (
    <div>
      <h1>Chat App</h1>
      <div className="room">
        <input
          type="text"
          placeholder="Room..."
          onChange={(e) => setRoomId(e.currentTarget.value)}
        />
      </div>
      <div className="join">
        <input
          type="text"
          placeholder="Name..."
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <button onClick={join}>Join</button>
      </div>

      <div className="chat">
        <div className="chat-container">
          <div className="message-container">
            {messages.map((message, index) => (
              <p key={`${index}-${message.text}`}>
                {message.name}: {message.text}
              </p>
            ))}
          </div>
        </div>
        <div className="chat-input">
          <input
            type="text"
            placeholder="Type message..."
            onChange={emitTyping}
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Home;
