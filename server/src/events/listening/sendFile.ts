// Import dependancies
import { ReadStream, createReadStream } from 'fs';
import config from '../../../config.json';
import { socket } from '../../../server';


// Function which sends the file passes as an argument in the multicast group
export const sendFile = (pathToFile: string): void => {
	const bitStart = 'START';
	const bitStop = 'STOP';
	const fileName: string = pathToFile.split('/').splice(-1, 1)[0];	// Gets the file name

	// Sends the starting packets
	// "START file_name"
	socket.send(`${bitStart} ${fileName}`, config.PORT, config.MULTICAST_ADDR);
	console.log('send START + filename');

	// Starts reading the file passed as an argument, in 32kb increments
	const fileStream: ReadStream = createReadStream(pathToFile, {
		highWaterMark: 32 * 1024,
	});

	// When the stream reads 32kb of data from the file, sends to the multicast group with a delay of DELAY ms
	fileStream.on('data', (chunk: string): void => {
		socket.send(
			chunk,
			config.PORT,
			config.MULTICAST_ADDR,
			(e: Error | null): void => {
				if (e) throw e;
				fileStream.pause();
			}
		);
		setTimeout((): void => {
			fileStream.resume();
		}, config.DELAY);
	});

	// When the reading of the file is finished, sends the packet that indicates the end of the transfer, with the md5 hash of the original file for comparison
	fileStream.on('close', () => {
		socket.send(`${bitStop} undefined`, config.PORT, config.MULTICAST_ADDR);
		console.log('send STOP + md5');
		socket.close();
	});
};