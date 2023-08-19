import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import { GetCurrentDateTime } from "./utils/getCurrentDateTime";

const socket = io("https://masaiyan-chat-socket.onrender.com");

const ChatAdmim = () => {
 

  const [message, setMessage] = useState("");
  // const [clientid, setSocket_Id] = useState<string>("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [message1, setmessage1] = useState([]);
  const messageContainerRef = useRef(null);
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    // Subscribe to server events
    socket.on("adminMessage", (data) => {
      console.log(data, "adminevent");
      setmessage1((pre) => [...pre, data]);
      console.log(data);
    });
    // Cleanup on unmount
    return () => {
      socket.off("adminMessage");
    };
  }, []);

  useEffect(() => {
    // Scroll to the bottom of the message container when new messages are added
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop =
        messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    // Send message to admin
    let timestamp = GetCurrentDateTime();
    socket.emit("adminMessage", {
      client_id: selectedConversation,
      timestamp,
      message: message,
    });
    // Send message to all clients and admin
    let data = {
      timestamp,
      message,
      client_id: selectedConversation,
      admin_id: "7787816467",
    };
    setmessage1((pre) => [...pre, data]);
    setMessage("");
  };
  useEffect(() => {
    setMessages(groupMessagesByClientId(message1));
  }, [message1]);
  const handleConversationClick = (clientId) => {
    setSelectedConversation(clientId);
  };
  return (
    <div className=" min-h-screen flex border-2 justify-center gap-2 pl-[10%]  bg-black pt-[100px]">
      <div className=" gap-2 flex flex-col ">
        {messages.map((conversation, index) => (
          <div
            key={conversation.clientId}
            onClick={() => handleConversationClick(conversation.clientId)}
            className={`cursor-pointer border-red-400 border-b-2 p-[10px] bg-slate-400 ${
              selectedConversation === conversation.clientId
                ? "bg-yellow-200"
                : "bg-white"
            }`}
          >
            <h3>Client {index + 1}</h3>
          </div>
        ))}
      </div>
      {selectedConversation && (
        <div className="w-[40%] border-2 p-2 z-100 bg-[#2D2F31] shadow-md">
          <h2 className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent  text-center  font-semibold text-2xl h-[50px] align-middle justify-center mt-4">
            Masaiyans{" "}
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Guides
            </span>
          </h2>
          <div
            ref={messageContainerRef}
            className=" custom-scrollbar flex flex-col h-[300px] overflow-y-auto p-2 mb-4 scrollbar-thin scrollbar-thumb-blue-500 scrollbar-track-red"
          >
            {messages
              .find(
                (conversation) => conversation.clientId === selectedConversation
              )
              ?.messages.map((message, index) => (
                <div
                  key={index + 1}
                  className={` min-w-fit p-1 mb-1 ${
                    message.client_id && message.admin_id
                      ? "bg-gray-300 ml-auto min-w-fit py-1 px-1 rounded-bl-md rounded-tl-md rounded-tr-md text-black"
                      : "bg-blue-200 mr-auto p-2 min-w-fit ml-1 py-1 px-2 rounded-br-md rounded-tr-md rounded-tl-md text-black"
                  }`}
                >
                  <p className="text-sm">{message.timestamp.split("at")[1]}</p>
                  <span className="text-sm">{message.message}</span>
                </div>
              ))}
          </div>

          <div className="flex gap-2 justify-evenly text-center m-auto mb-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-[10px] border w-[60%] p-2 border-gray-300 focus:outline-none rounded-sm"
              placeholder="Type your message..."
            />
            <button
              disabled={message == ""}
              onClick={handleSendMessage}
              className={`text-center text-[10px] p-1 bg-blue-500 text-white font-semibold rounded-sm ${
                message == "" ? "disabled" : ""
              }`}
            >
              <svg
                className="svg-icon"
                style={{
                  width: "3em",
                  height: "2.3em",
                  verticalAlign: "middle",
                  fill: message == "" ? "darkgray" : "white",
                  overflow: "hidden",
                }}
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M729.173333 469.333333L157.845333 226.496 243.52 469.333333h485.674667z m0 85.333334H243.541333L157.824 797.504 729.173333 554.666667zM45.12 163.541333c-12.352-34.986667 22.762667-67.989333 56.917333-53.482666l853.333334 362.666666c34.645333 14.72 34.645333 63.829333 0 78.549334l-853.333334 362.666666c-34.133333 14.506667-69.269333-18.474667-56.917333-53.482666L168.085333 512 45.098667 163.541333z"
                  fill=""
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatAdmim;

function groupMessagesByClientId(data) {
  const groupedMessages = data.reduce((acc, curr) => {
    const { client_id, admin_id, message, timestamp } = curr;
    if (!client_id) {
      // If client_id is missing, skip this message or handle it accordingly
      return acc;
    }
    if (!acc[client_id]) {
      acc[client_id] = { clientId: client_id, messages: [] };
    }
    acc[client_id].messages.push({
      admin_id,
      message,
      timestamp,
      client_id: client_id,
    });
    return acc;
  }, {});

  return Object.values(groupedMessages);
}
