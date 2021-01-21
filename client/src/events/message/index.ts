// Import dependancies
import Event from '../../modules/Event';
import { RemoteInfo } from 'dgram';
import { WriteStream, createWriteStream } from 'fs';
import { socket } from '../../../client';


// Tells if the packets the socket receives should be written in the target file
let writeToFile = false;
let wStream: WriteStream;

let packetNumber = 0;

// Function to run when the event is triggered
const run: (message: Buffer, remote: RemoteInfo) => void = (message: Buffer, remote: RemoteInfo) => {
	// Three different formats of message :
	//		"START file_name"
	//		Buffer
	//		"STOP md5_hash_from_the_original_file"

	// console.log(`Message from ${remote.address}:${remote.port} - ${message.byteLength} bytes long`);
	const data: string = message.toString().split(' ')[0];	// First part of message
	const value: string = message.toString().split(' ')[1];	// Second part of message

	switch (data) {
	case 'START':
		// Creates a WriteStream only if the START has been received
		writeToFile = true;
		wStream = createWriteStream(`./${value}`, { flags: 'a' });	// Flag "append"
		wStream.cork();	// Caches the data
		console.log(`${packetNumber}: START received`);
		break;

	case 'STOP':
		writeToFile = false;
		wStream.close();	// Closes the WriteStream and write the data in the target file
		console.log(`${packetNumber}: STOP received`);
		socket.close((): void => {
			console.log('socket has been closed');
		});
		break;

	default:
		if (writeToFile) {
			// Writes the data in the cache
			wStream.write(message, (e: Error | null | undefined): void => {
				if (e) throw e;
			});
			console.log(`${packetNumber}: receives ${message.length} bytes`);
		}
		break;
	}

	packetNumber++;
};


// Export event
export default new Event('message', run);