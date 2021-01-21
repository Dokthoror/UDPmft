// Import dependancies
import { AddressInfo } from 'net';
import { socket } from '../../../server';
import Event from '../../modules/Event';
import config from '../../../config.json';
import { sendFile } from './sendFile';


// Function to run when the event is triggered
const run: () => void = () => {
	socket.addMembership(config.MULTICAST_ADDR, config.INTERFACE_ADDR);	// Adds the socket in the multicast group
	const address: AddressInfo = socket.address();
	console.log(
		`UDP socket listening on ${address.address}:${address.port} pid: ${process.pid}`
	);
	sendFile('/home/pascal/Vidéos/2course-v1inria41020ArchiIntro-Video2.mp4', socket);	// Sends the file
};


// Export event
export default new Event('listening', run);