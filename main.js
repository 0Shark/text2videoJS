import express from "express";
import dotenv from "dotenv";
import { Server } from "socket.io";
import { createServer } from "http";

import { AssetsGen } from "./assets-gen.js";

dotenv.config();

// Express
const app = express();

// Socket.io
const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"));

io.on("connection", (socket) => {
	console.log(`CONNECTED ${socket.id}`);

	socket.on("submit", (data) => {
		data = JSON.parse(data);

		console.log(`PROMPT RECEIVED (${socket.id}): ${data.prompt}`);

    (async () => {
      const assets_status = await AssetsGen(data.prompt, socket.id)
				.then((status) => {
      		socket.emit("assets_status", status);
				})
				.catch((error) => {
					console.log("[ERROR] Couldn't generate assets for user " + socket.id);
					console.log(error);

					return false;
				})
    })();
	});
});

const port = process.env.PORT || 5000;

server.listen(port, () => {
	console.log("server started at port " + port);
});
