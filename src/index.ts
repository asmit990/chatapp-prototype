import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

interface User {
    socket: WebSocket;
    room: string;
}

let allSockets: User[] = [];

wss.on("connection", (socket) => {
    socket.on("message", (message) => {
        const parsedMessage = JSON.parse(message as unknown as string);

        if (parsedMessage.type === "join") {
            console.log("User joined room " + parsedMessage.payload.roomId);
            allSockets.push({
                socket,
                room: parsedMessage.payload.roomId,
            });
        }

        if (parsedMessage.type === "chat") {
            let currentUserRoom: string | null = null;
            console.log("Message received for room: " + parsedMessage.payload.roomId);

            for (let i = 0; i < allSockets.length; i++) {
                if (allSockets[i].socket === socket) {
                    currentUserRoom = allSockets[i].room;
                }
            }

            if (currentUserRoom) {
                for (let i = 0; i < allSockets.length; i++) {
                    if (allSockets[i].room === currentUserRoom) {
                        allSockets[i].socket.send(JSON.stringify({
                            type: "chat",
                            payload: { message: parsedMessage.payload.message }
                        }));
                    }
                }
            }
        }
    });

    socket.on("close", () => {
        allSockets = allSockets.filter((user) => user.socket !== socket);
        console.log("User disconnected");
    });
});
