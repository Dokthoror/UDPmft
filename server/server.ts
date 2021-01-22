// Imports dependancies
import { Socket, createSocket } from 'dgram';
import { eventsHandler } from './src/events/eventsHandler';
import Event from './src/modules/Event';
import config from './config.json';
import { NetworkInterfaceInfo, networkInterfaces} from 'os';
import { access } from 'fs';
import { F_OK } from 'constants';


// Searches for the IPv4 addres of the specified interface in ./config.json
const netInterface: NetworkInterfaceInfo[] | undefined = networkInterfaces()[config.INTERFACE];
if (!netInterface) throw new Error(`The network interface ${config.INTERFACE} was not found.`);
export const netAddr = netInterface.find((i: NetworkInterfaceInfo): boolean => i.family == 'IPv4')?.address;


const pathToFile: string = process.argv[2];
access(pathToFile, F_OK, (e: NodeJS.ErrnoException | null): void => {
	if (e) throw e;
});


export const socket: Socket = createSocket({
	type: 'udp4',
	reuseAddr: true,
});
socket.bind(config.PORT, netAddr);


// When the socket is ready to listen
socket.on('listening', (): void => {
	eventsHandler.find((e: Event) => e.name == 'listening')?.run();
});