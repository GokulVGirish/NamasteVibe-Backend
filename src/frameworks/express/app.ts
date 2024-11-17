import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import http from "http"
import initializeSocket from "../websocket/socket";

dotenv.config();

const app = express();
const server=http.createServer(app)
export const  io=initializeSocket(server)

app.use(
  cors({
    origin: process.env.ORIGIN,
    methods: "GET,POST,PUT,DELETE,OPTIONS,PATCH",
    allowedHeaders: "Content-Type,Authorization",
    credentials: true,
  })
);

export default server;
