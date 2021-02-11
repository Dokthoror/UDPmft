// Import dependancies
import Event from "../../modules/Event";
import { RemoteInfo } from "dgram";
import { WriteStream, createWriteStream, unlink } from "fs";
import { netAddr, pathToDir, socket } from "../../../client";
import { createHash, Hash } from "crypto";
import { unzipping } from "./unzipping";

// Tells if the packets the socket receives should be written in the target file
let writeToFile = false;

let wStream: WriteStream;
let fileName: string;
let packetNumber = 0;

// Creates the hash
export const shasum: Hash = createHash("sha1");

// Function to run when the event is triggered
const run: (message: Buffer, remote: RemoteInfo) => Promise<void> = async (
	message: Buffer,
	remote: RemoteInfo
): Promise<void> => {
	// Three different formats of message :
	//		"START file_name"
	//		Buffer
	//		"STOP"

	const data: string = message.toString().split(" ")[0]; // First part of message
	const value: string = message.toString().split(" ")[1]; // Second part of message

	switch (data) {
		case "START":
			fileName = value;
			// Creates a WriteStream only if the START has been received
			writeToFile = true;
			wStream = createWriteStream(`${pathToDir}/${fileName}.gz`, {
				flags: "a", // Flag "append"
			});
			wStream.cork(); // Caches the data
			console.log(`${packetNumber}: START`);
			break;

		case "STOP":
			writeToFile = false;
			wStream.close(); // Closes the WriteStream and write the data in the target file
			console.log(`${packetNumber}: STOP`);
			// Sends the hash to the server for comparison
			socket.send(
				`SHA1 ${netAddr} ${shasum.digest("hex")}`,
				remote.port,
				remote.address,
				(e: Error | null) => {
					if (e) throw e;
					socket.close();
				}
			);
			// Unzipping the received file and deleting the zip file
			try {
				console.log("Unzipping...");
				await unzipping(`${pathToDir}/${fileName}`);
				console.log("Done!");
			} catch (e) {
				throw new Error(e);
			}
			unlink(
				`${pathToDir}/${fileName}.gz`,
				(err: NodeJS.ErrnoException | null) => {
					if (err) throw err;
					console.log("Zip file deleted successfuly!");
				}
			);
			break;

		default:
			if (writeToFile) {
				// Writes the data in the cache
				wStream.write(message, (e: Error | null | undefined): void => {
					if (e) throw e;
				});
				// Updates the hash with the received data
				shasum.update(message);
				console.log(
					`${packetNumber}: receives ${message.length} bytes`
				);
			}
			break;
	}

	packetNumber++;
};

// Export event
export default new Event("message", run);
