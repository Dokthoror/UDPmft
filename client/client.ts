// Imports dependancies
import * as fs from 'fs';
import * as dgram from 'dgram';


// Constants
const PORT = 20000;
const INTERFACE_ADDR = '127.0.0.1';
const MULTICAST_ADDR = '233.255.255.255';


const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
socket.bind(PORT);


// When the socket is ready to listen
socket.on('listening', (): void => {
	socket.addMembership(MULTICAST_ADDR, INTERFACE_ADDR); 	// Adds the socket in the multicast group
	const address = socket.address();
	console.log(`UDP socket listening on ${address.address}:${address.port}`);
});


// Tells if the packets the socket receives should be written in the target file
let writeToFile = false;
let wStream: fs.WriteStream;

socket.on('message', (message: Buffer, remote: dgram.RemoteInfo): void => {
	// Three different formats of message :
	//		"START file_name"
	//		Buffer
	//		"STOP md5_hash_from_the_original_file"

	console.log(`Message from ${remote.address}:${remote.port} - ${message.byteLength} bytes long`);
	const data: string = message.toString().split(' ')[0];	// First part of message
	const value: string = message.toString().split(' ')[1];	// Second part of message

	switch (data) {
	case 'START':
		// Creates a WriteStream only if the START has been received
		writeToFile = true;
		wStream = fs.createWriteStream(`./${value}`, { flags: 'a' });	// Flag "append"
		wStream.cork();	// Caches the data
		console.log('START received');
		break;

	case 'STOP':
		writeToFile = false;
		wStream.close();	// Closes the WriteStream and write the data in the target file
		console.log('STOP received');
		break;

	default:
		if (writeToFile) {
			wStream.write(message);	// Writes the data in the cache
		}
		break;
	}
});