// Imports dependancies
import { F_OK } from 'constants';
import * as dgram from 'dgram';
import { access, Stats, statSync } from 'fs';
import { NetworkInterfaceInfo, networkInterfaces } from 'os';
import config from './config.json';
import { eventsHandler } from './src/events/eventsHandler';
import Event from './src/modules/Event';


// Searches for the IPv4 addres of the specified interface in ./config.json
export let netAddr: string | undefined;
try {
	const netInterface: NetworkInterfaceInfo[] | undefined = networkInterfaces()[config.INTERFACE];
	netAddr = netInterface!.find((i: NetworkInterfaceInfo): boolean => i.family == 'IPv4')?.address;
} catch (e) {
	throw new Error(`The network interface ${config.INTERFACE} was not found.`);
}


// Gets the target directory where the file is uploaded
export let pathToDir: string = process.argv[2];

// Verifies if the file is a directory
const fileStats: Stats = statSync(pathToDir);
if (!fileStats.isDirectory()) throw new Error('The specified file is not a directory.');

// Removes last character if it's a '/'
if (pathToDir.slice(-1) == '/') pathToDir = pathToDir.substring(0, pathToDir.length - 1);


export const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
socket.bind(config.PORT);


// When the socket is ready to listen
socket.on('listening', (): void => {
	eventsHandler.find((e: Event) => e.name == 'listening')?.run();
});


socket.on('message', (message: Buffer, remote: dgram.RemoteInfo): void => {
	eventsHandler.find((e: Event) => e.name == 'message')?.run(message, remote);
});