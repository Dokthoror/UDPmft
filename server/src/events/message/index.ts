// Import dependancies
import { socket, quantityToVerify } from "../../../server";
import Event from "../../modules/Event";
import { RemoteInfo } from "dgram";
import { hash } from "../listening/sendFile";

let verifiedQuantity = 0;

// Function to run when the event is triggered
const run: (message: Buffer, remote: RemoteInfo) => void = (
	message: Buffer,
	remote: RemoteInfo
) => {
	const data: string = message.toString().split(" ")[0];
	const value: string[] = message.toString().split(" ").slice(1);

	switch (data) {
		case "SHA1":
			console.log(`Received SHA1 from ${value[0]}: ${value[1]}`);
			if (hash == value[1]) {
				console.log("FILE OK");
			} else {
				console.log("FILE CORRUPTED");
			}
			verifiedQuantity++;
			if (verifiedQuantity == quantityToVerify) socket.close();
			break;

		default:
			break;
	}
};

// Export event
export default new Event("message", run);
