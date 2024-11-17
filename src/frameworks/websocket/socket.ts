import { Server as SocketIoServer, Socket } from "socket.io";
import { Server as HttpServer } from "http";
import { v4 as uuidv4 } from "uuid";

const onlineUsers: { [key: string]: string } = {};
const waitingUsers: string[] = [];

const initializeSocket = (server: HttpServer): void => {
  const io = new SocketIoServer(server, {
    cors: {
      origin: process.env.ORIGIN,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    const userId = uuidv4();
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
      } else {
        waitingUsers.push(userId);
      }
    });
    socket.on("candidate",({from,to,candidate})=>{
      const receiver = onlineUsers[to];
      io.to(receiver).emit("candidate",{candidate,from,to})

    })
    socket.on("offer", ({from, to, offer }) => {
   
      console.log("serveril offer vannu ",from)
      const receiver = onlineUsers[to];
      io.to(receiver).emit("offer", { offer,from });
    });
    socket.on("answer", ({to, answer }) => {
         console.log("answer to", to);
         console.log("answer ",answer)
         console.log("answer 2 ", onlineUsers[to]);
           console.log("serveril answer vannu");
      const receiver = onlineUsers[to];
      io.to(receiver).emit("answer", { answer});
    });

    // Handle the "next" event to find a new match

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      const userEntry = Object.entries(onlineUsers).find(
        ([_, id]) => id === socket.id
      );
      if (userEntry) {
        const [disconnectedUserId] = userEntry;
        delete onlineUsers[disconnectedUserId];
        console.log(`Removed user with UUID: ${disconnectedUserId}`);

        // Remove from waiting list if present
        const index = waitingUsers.indexOf(disconnectedUserId);
        if (index !== -1) waitingUsers.splice(index, 1);
      }
    });
  });
};

export default initializeSocket;