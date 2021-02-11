// Import dependancies
import { ReadStream, createReadStream, Stats, createWriteStream } from "fs";
import config from "../../../config.json";
import { socket } from "../../../server";
import { statSync } from "fs";
import { createHash, Hash } from "crypto";
import { zipping } from "./zipping";

export let hash: string;

// Function which sends the file passes as an argument in the multicast group
export const sendFile = async (pathToFile: string): Promise<void> => {
	const fileName: string = pathToFile.split("/").splice(-1, 1)[0]; // Gets the file name
	const tmpFilePath = `/tmp/${fileName}.gz`;

	// Zipping the file in the /tmp directory before sending it
	console.log("Zipping the file to send...");
	await zipping(pathToFile, tmpFilePath);

	const shasum: Hash = createHash("sha1"); // Creates the hash
	let packetNumber = 1;
	const bitStart = "START";
	const bitStop = "STOP";

	const fileStats: Stats = statSync(tmpFilePath);
	const fileSize: number = fileStats.size;
	const numberOfPacketsToSend: number = Math.ceil(fileSize / (32 * 1024));

	console.log(`Number of packets to send: ${numberOfPacketsToSend}`);

	// Sends the starting packets
	// "START file_name"
	try {
		socket.send(
			`${bitStart} ${fileName}`,
			config.PORT,
			config.MULTICAST_ADDR
		);
	} catch (e) {
		throw new Error(e);
	}

	console.log("START file_name");

	// Starts reading the file passed as an argument, in 32kB increments
	const rStream: ReadStream = createReadStream(tmpFilePath, {
		highWaterMark: 32 * 1024,
	});

	// When the stream reads 32kb of data from the file, sends to the multicast group with a delay of DELAY ms
	rStream.on("data", (chunk: string): void => {
		try {
			socket.send(chunk, config.PORT, config.MULTICAST_ADDR);
			rStream.pause(); // Pauses the stream
		} catch (e) {
			throw new Error(e);
		}
		shasum.update(chunk); // Updates the hash with the sent data
		console.log(
			`ETA: ${Math.round(
				(packetNumber++ / numberOfPacketsToSend) * 100
			)}%`
		);
		setTimeout((): void => {
			rStream.resume(); // Waits DELAY ms and resumes the stream
		}, config.DELAY);
	});

	// When the reading of the file is finished, sends the packet that indicates the end of the transfer
	rStream.on("close", (): void => {
		try {
			socket.send(`${bitStop}`, config.PORT, config.MULTICAST_ADDR);
			console.log("STOP");
			hash = shasum.digest("hex");
		} catch (e) {
			throw new Error(e);
		}
	});
};
