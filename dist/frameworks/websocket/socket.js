"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const onlineUsers = {};
const waitingUsers = [];
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);
        const userId = (0, uuid_1.v4)();
        onlineUsers[userId] = socket.id;
        console.log(`User joined with UUID: ${userId}, Socket ID: ${socket.id}`);
        socket.on("user_joined", () => {
            socket.emit("user_id", userId);
        });
        socket.on("find_match", (data) => {
            console.log("vannu");
            if (data?.receiverId) {
                const receiverSocketId = onlineUsers[data.receiverId];
                io.to(receiverSocketId).emit("handle-next");
            }
            if (waitingUsers.length > 0) {
                const matchedUserId = waitingUsers.pop();
                if (matchedUserId) {
                    const matchedSocketId = onlineUsers[matchedUserId];
                    if (matchedSocketId) {
                        // Notify both users of the match
                        socket.emit("match_found", {
                            userId: matchedUserId,
                            isMaster: true,
                        });
                        io.to(matchedSocketId).emit("match_found", {
                            userId,
                            isMaster: false,
                        });
                    }
                }
            }
            else {
                waitingUsers.push(userId);
            }
        });
        socket.on("candidate", ({ from, to, candidate }) => {
            const receiver = onlineUsers[to];
            io.to(receiver).emit("candidate", { candidate, from, to });
        });
        socket.on("offer", ({ from, to, offer }) => {
            console.log("serveril offer vannu ", from);
            const receiver = onlineUsers[to];
            io.to(receiver).emit("offer", { offer, from });
        });
        socket.on("answer", ({ to, answer }) => {
            console.log("answer to", to);
            console.log("answer ", answer);
            console.log("answer 2 ", onlineUsers[to]);
            console.log("serveril answer vannu");
            const receiver = onlineUsers[to];
            io.to(receiver).emit("answer", { answer });
        });
        // Handle the "next" event to find a new match
        socket.on("disconnect", () => {
            console.log(`User disconnected: ${socket.id}`);
            const userEntry = Object.entries(onlineUsers).find(([_, id]) => id === socket.id);
            if (userEntry) {
                const [disconnectedUserId] = userEntry;
                delete onlineUsers[disconnectedUserId];
                console.log(`Removed user with UUID: ${disconnectedUserId}`);
                // Remove from waiting list if present
                const index = waitingUsers.indexOf(disconnectedUserId);
                if (index !== -1)
                    waitingUsers.splice(index, 1);
            }
        });
    });
};
exports.default = initializeSocket;
