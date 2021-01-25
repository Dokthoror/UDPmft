// Import dependancies
import { AddressInfo } from 'net';
import { socket, netAddr, pathToFile } from '../../../server';
import Event from '../../modules/Event';
import config from '../../../config.json';
import { sendFile } from './sendFile';


// Function to run when the event is triggered
const run: () => void = () => {
	socket.addMembership(config.MULTICAST_ADDR, netAddr);	// Adds the socket in the multicast group
	const address: AddressInfo = socket.address();
	console.log(
		`UDP socket listening on ${address.address}:${address.port} pid: ${process.pid}`
	);
	sendFile(pathToFile!);	// Sends the file
};


// Export event
export default new Event('listening', run);