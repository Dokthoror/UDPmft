// Imports dependancies
import * as dgram from 'dgram';
import { NetworkInterfaceInfo, networkInterfaces } from 'os';
import config from './config.json';
import { eventsHandler } from './src/events/eventsHandler';
import Event from './src/modules/Event';


// Searches for the IPv4 addres of the specified interface in ./config.json
const netInterface: NetworkInterfaceInfo[] | undefined = networkInterfaces()[config.INTERFACE];
if (!netInterface) throw new Error(`The network interface ${config.INTERFACE} was not found.`);
export const netAddr = netInterface.find((i: NetworkInterfaceInfo): boolean => i.family == 'IPv4')?.address;


export const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
socket.bind(config.PORT);


// When the socket is ready to listen
socket.on('listening', (): void => {
	eventsHandler.find((e: Event) => e.name == 'listening')?.run();
});


socket.on('message', (message: Buffer, remote: dgram.RemoteInfo): void => {
	eventsHandler.find((e: Event) => e.name == 'message')?.run(message, remote);
});