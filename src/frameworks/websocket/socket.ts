import { Server as SocketIoServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { v4 as uuidv4 } from "uuid";
import Queue from "./queue";

const onlineUsers: { [key: string]: string } = {};
const queue = new Queue();

const initializeSocket = (server: HttpServer): void => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    
    const userId = uuidv4();
    onlineUsers[userId] = socket.id;
    console.log("online users",onlineUsers)
    console.log(`User joined with UUID: ${userId}, Socket ID: ${socket.id}`);

  
      socket.emit("user_id", userId);
  

    socket.on("find_match", (data) => {
      console.log("find _ match")

      if (data?.receiverId) {
        console.log("in receiver id",data.receiverId)
        const receiverSocketId = onlineUsers[data.receiverId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("handle-next");
        }
      }

      if (!queue.isEmpty()) {
        console.log("if")
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
      } else {
        console.log("else dequeued")
    
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
      if (receiver) io.to(receiver).emit("typing");
    });
    socket.on("assist-partner", (to) => {
      const receiver = onlineUsers[to];
      if (receiver) io.to(receiver).emit("handle-next");
    });

    socket.on("disconnect", () => {
      
      // console.log(`User disconnected: ${socket.id}`);
      const userEntry = Object.entries(onlineUsers).find(
        ([_, id]) => id === socket.id
      );
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

export default initializeSocket;
