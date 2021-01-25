// Imports dependancies
import { Socket, createSocket, RemoteInfo } from 'dgram';
import { eventsHandler } from './src/events/eventsHandler';
import Event from './src/modules/Event';
import config from './config.json';
import { NetworkInterfaceInfo, networkInterfaces} from 'os';
import { Stats, statSync } from 'fs';
import { hash } from './src/events/listening/sendFile';

// Searches for the IPv4 addres of the specified interface in ./config.json
export let netAddr: string | undefined;
try {
	const netInterface: NetworkInterfaceInfo[] | undefined = networkInterfaces()[config.INTERFACE];
	netAddr = netInterface!.find((i: NetworkInterfaceInfo): boolean => i.family == 'IPv4')?.address;
} catch (e) {
	throw new Error(`The network interface ${config.INTERFACE} was not found.`);
}


// Gets path to the file to send
export const pathToFile: string = process.argv[2];

// Verifies if the file is not a directory or anything else
const fileStats: Stats = statSync(pathToFile);
if (!fileStats.isFile()) throw new Error('The specified file cannot be sent.');


export const socket: Socket = createSocket({
	type: 'udp4',
	reuseAddr: true,
});
socket.bind(config.PORT, netAddr);


// When the socket is ready to listen
socket.on('listening', (): void => {
	eventsHandler.find((e: Event) => e.name == 'listening')?.run();
});


socket.on('message', (message: Buffer, remote: RemoteInfo) => {
	const data: string = message.toString().split(' ')[0];
	const value: string[] = message.toString().split(' ').slice(1);

	switch (data) {
	case 'SHA1':
		console.log(`Received SHA1 from ${value[0]}: ${value[1]}`);
		if (hash == value[1]) {
			console.log('FILE OK');
		} else {
			console.log('FILE CORRUPTED');
		}
		break;
	
	default:
		break;
	}
});