import ts from "typescript";
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User{
    socket: WebSocket;
    room: String;
}

let allSockets: User[] = [];
wss.on("connection", (socket) => {
    

    socket.on("message", (message) => {
        // @ts-ignore
        const parsedMessage = JSON.parse(message);

        if (parsedMessage.type === "join") {
            console.log("user Joined the Room " + parsedMessage.payload.roomId);
            
            allSockets.push({
              // @ts-ignore
              socket,
              room: parsedMessage.payload.roomId,
            });
        }

        if (parsedMessage.type === "chat") {
            console.log("user Wants To chat");
            
            let currentUserRoom = null;
            for (let i = 0; i < allSockets.length; i++){
              // @ts-ignore
              if (allSockets[i].socket == socket) {
                currentUserRoom = allSockets[i].room;
              }
            }

            for (let i = 0; i < allSockets.length; i++){
                if (allSockets[i].room == currentUserRoom) {
                    allSockets[i].socket.send(parsedMessage.payload.message)
                }
            }
        }
    })
})