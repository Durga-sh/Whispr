import { WebSocket, WebSocketServer } from "ws";
import { RawData } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  socket: WebSocket;
  room: string;
  username: string;
}

interface Message {
  type: "join" | "chat" | "system" | "message" | "joined";
  payload?: {
    roomId: string;
    username?: string;
    message?: string;
  };
  message?: string;
  username?: string;
  timestamp?: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket: WebSocket) => {
  console.log("New client connected");

  socket.on("message", (message: RawData) => {
    const parsedMessage = JSON.parse(message.toString()) as Message;

    if (parsedMessage.type === "join") {
      console.log("User joined room: " + parsedMessage.payload?.roomId);

      // Remove user from any previous room
      allSockets = allSockets.filter((user) => user.socket !== socket);

      // Add user to new room
      if (parsedMessage.payload?.roomId) {
        allSockets.push({
          socket,
          room: parsedMessage.payload.roomId,
          username: parsedMessage.payload.username || "Anonymous",
        });

        // Send confirmation to user
        socket.send(
          JSON.stringify({
            type: "joined",
            message: `You joined room: ${parsedMessage.payload.roomId}`,
          })
        );

        // Notify others in the room
        broadcastToRoom(
          parsedMessage.payload.roomId,
          {
            type: "system",
            message: `${
              parsedMessage.payload.username || "Anonymous"
            } joined the room`,
          },
          socket
        );
      }
    }

    if (parsedMessage.type === "chat") {
      console.log("User wants to chat");

      // Find current user's room
      let currentUser = allSockets.find((user) => user.socket === socket);

      if (currentUser && parsedMessage.payload?.message) {
        // Broadcast message to all users in the same room
        broadcastToRoom(currentUser.room, {
          type: "message",
          message: parsedMessage.payload.message,
          username: currentUser.username,
          timestamp: new Date().toLocaleTimeString(),
        });
      }
    }
  });

  socket.on("close", () => {
    // Remove user when they disconnect
    const user = allSockets.find((u) => u.socket === socket);
    if (user) {
      allSockets = allSockets.filter((u) => u.socket !== socket);

      // Notify others in the room
      broadcastToRoom(
        user.room,
        {
          type: "system",
          message: `${user.username} left the room`,
        },
        socket
      );
    }
    console.log("Client disconnected");
  });
});

function broadcastToRoom(
  roomId: string,
  message: Message,
  excludeSocket?: WebSocket
) {
  allSockets
    .filter((user) => user.room === roomId && user.socket !== excludeSocket)
    .forEach((user) => {
      try {
        user.socket.send(JSON.stringify(message));
      } catch (error) {
        console.error("Error sending message:", error);
      }
    });
}

console.log("WebSocket server running on port 8080");
