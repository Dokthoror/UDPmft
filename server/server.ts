// Imports dependancies
import * as dgram from 'dgram';
import * as process from 'process';
import * as fs from 'fs';
import { AddressInfo } from 'net';


// Constants
const PORT = 20000;
const INTERFACE_ADDR = '127.0.0.1';
const MULTICAST_ADDR = '233.255.255.255';
const DELAY = 10;


const socket: dgram.Socket = dgram.createSocket({
	type: 'udp4',
	reuseAddr: true,
});
socket.bind(PORT, INTERFACE_ADDR);


// When the socket is ready to listen
socket.on('listening', (): void => {
	socket.addMembership(MULTICAST_ADDR, INTERFACE_ADDR);	// Adds the socket in the multicast group
	const address: AddressInfo = socket.address();
	console.log(
		`UDP socket listening on ${address.address}:${address.port} pid: ${process.pid}`
	);
	sendFile('/home/pascal/Vidéos/2course-v1inria41020ArchiIntro-Video2.mp4');	// Sends the file
});


// Function which sends the file passes as an argument in the multicast group
const sendFile = (pathToFile: string): void => {
	const bitStart = 'START';
	const bitStop = 'STOP';
	const fileName: string = pathToFile.split('/').splice(-1, 1)[0];	// Gets the file name

	// Sends the starting packets
	// "START file_name"
	socket.send(`${bitStart} ${fileName}`, PORT, MULTICAST_ADDR);
	console.log('send START + filename');

	// Starts reading the file passed as an argument, in 32kb increments
	const fileStream: fs.ReadStream = fs.createReadStream(pathToFile, {
		highWaterMark: 32 * 1024,
	});

	// When the stream reads 32kb of data from the file, sends to the multicast group with a delay of DELAY ms
	fileStream.on('data', (chunk: string): void => {
		socket.send(
			chunk,
			PORT,
			MULTICAST_ADDR,
			(e: Error | null): void => {
				if (e) throw e;
				fileStream.pause();
			}
		);
		setTimeout((): void => {
			fileStream.resume();
		}, DELAY);
	});

	// When the reading of the file is finished, sends the packet that indicates the end of the transfer, with the md5 hash of the original file for comparison
	fileStream.on('close', () => {
		socket.send(`${bitStop} undefined`, PORT, MULTICAST_ADDR);
		console.log('send STOP + md5');
	});
};
