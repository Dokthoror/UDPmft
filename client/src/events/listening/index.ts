// Import dependancies
import { socket, netAddr } from "../../../client";
import Event from "../../modules/Event";
import config from "../../../config.json";

// Function to run when the event is triggered
const run: () => void = () => {
	socket.addMembership(config.MULTICAST_ADDR, netAddr); // Adds the socket in the multicast group
	const address = socket.address();
	console.log(`UDP socket listening on ${address.address}:${address.port}`);
};

// Export event
export default new Event("listening", run);
