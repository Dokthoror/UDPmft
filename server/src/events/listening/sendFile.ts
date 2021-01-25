// Import dependancies
import { ReadStream, createReadStream, Stats } from 'fs';
import config from '../../../config.json';
import { socket } from '../../../server';
import { statSync } from 'fs';
import { createHash, Hash } from 'crypto';


export let shasum: Hash;

// Function which sends the file passes as an argument in the multicast group
export const sendFile = (pathToFile: string): void => {
	shasum = createHash('sha1');

	let packetNumber = 1;

	const bitStart = 'START';
	const bitStop = 'STOP';
	const fileName: string = pathToFile.split('/').splice(-1, 1)[0];	// Gets the file name

	
	const fileStats: Stats = statSync(pathToFile);
	const fileSize: number = fileStats.size;
	const numberOfPacketsToSend: number = Math.ceil(fileSize / (32 * 1024));

	console.log(`Number of packets to send: ${numberOfPacketsToSend}`);


	// Sends the starting packets
	// "START file_name"
	socket.send(`${bitStart} ${fileName}`, config.PORT, config.MULTICAST_ADDR, (e: Error | null): void => {
		if (e) throw e;
	});
	console.log('sends START + filename');


	// Starts reading the file passed as an argument, in 32kB increments
	const rStream: ReadStream = createReadStream(pathToFile, {
		highWaterMark: 32 * 1024,
	});

	// When the stream reads 32kb of data from the file, sends to the multicast group with a delay of DELAY ms
	rStream.on('data', (chunk: string): void => {
		socket.send(
			chunk,
			config.PORT,
			config.MULTICAST_ADDR,
			(e: Error | null): void => {
				if (e) throw e;
				rStream.pause();	// Pauses the stream
			}
		);

		shasum.update(chunk);

		// console.log(`${packetNumber++}: sends ${chunk.length} bytes`);
		console.log(`ETA: ${Math.round((packetNumber++ / numberOfPacketsToSend) * 100)}%`);
		setTimeout((): void => {
			rStream.resume();	// Waits DELAY ms and resumes the stream
		}, config.DELAY);
	});


	// When the reading of the file is finished, sends the packet that indicates the end of the transfer
	rStream.on('close', (): void => {
		socket.send(`${bitStop}`, config.PORT, config.MULTICAST_ADDR, (e: Error | null): void => {
			if (e) throw e;

			console.log('sends STOP');

			socket.close();
		});
	});
};