import { io } from "socket.io-client";
const URL =
    process.env.NODE_ENV === "production"
        ? "https://sketchbookbackend.onrender.com"
        : "http://localhost:3005";
export const socket = io(URL);
