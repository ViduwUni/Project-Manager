import { io } from "socket.io-client";

const socket = io(`http://${process.env.REACT_APP_HOST}:5000`);

export default socket;