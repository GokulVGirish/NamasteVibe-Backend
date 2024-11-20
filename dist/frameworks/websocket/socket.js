"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const uuid_1 = require("uuid");
const queue_1 = __importDefault(require("./queue"));
const onlineUsers = {};
const queue = new queue_1.default();
const initializeSocket = (server) => {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: process.env.ORIGIN,
            methods: ["GET", "POST"],
        },
    });
    io.on("connection", (socket) => {
        const userId = (0, uuid_1.v4)();
        onlineUsers[userId] = socket.id;
        console.log("online users", onlineUsers);
        console.log(`User joined with UUID: ${userId}, Socket ID: ${socket.id}`);
        socket.emit("user_id", userId);
        socket.on("find_match", (data) => {
            console.log("find _ match");
            if (data?.receiverId) {
                console.log("in receiver id", data.receiverId);
                const receiverSocketId = onlineUsers[data.receiverId];
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit("handle-next");
                }
            }
            if (!queue.isEmpty()) {
                console.log("if");
                const matchedUserId = queue.dequeue();
                if (matchedUserId) {
                    const matchedSocketId = onlineUsers[matchedUserId];
                    if (matchedSocketId) {
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
                console.log("else dequeued");
                queue.enqueue(userId);
            }
        });
        socket.on("candidate", ({ from, to, candidate }) => {
            const receiver = onlineUsers[to];
            io.to(receiver).emit("candidate", { candidate, from, to });
        });
        socket.on("offer", ({ from, to, offer }) => {
            const receiver = onlineUsers[to];
            io.to(receiver).emit("offer", { offer, from });
        });
        socket.on("answer", ({ to, answer }) => {
            const receiver = onlineUsers[to];
            io.to(receiver).emit("answer", { answer });
        });
        socket.on("message", ({ message, to }) => {
            const receiver = onlineUsers[to];
            io.to(receiver).emit("message", message);
        });
        socket.on("typing", (to) => {
            const receiver = onlineUsers[to];
            if (receiver)
                io.to(receiver).emit("typing");
        });
        socket.on("assist-partner", (to) => {
            const receiver = onlineUsers[to];
            if (receiver)
                io.to(receiver).emit("handle-next");
        });
        socket.on("disconnect", () => {
            // console.log(`User disconnected: ${socket.id}`);
            const userEntry = Object.entries(onlineUsers).find(([_, id]) => id === socket.id);
            if (userEntry) {
                const [disconnectedUserId] = userEntry;
                delete onlineUsers[disconnectedUserId];
                console.log(`Removed user with UUID: ${disconnectedUserId}`);
                queue.remove(disconnectedUserId);
            }
            socket.removeAllListeners();
        });
    });
};
exports.default = initializeSocket;
