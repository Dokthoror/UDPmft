// Imports dependancies
import * as dgram from 'dgram';
import eventsHandler from './src/events/eventsHandler';
import Event from './src/modules/Event';
import config from './config.json';


export const socket: dgram.Socket = dgram.createSocket({
	type: 'udp4',
	reuseAddr: true,
});
socket.bind(config.PORT, config.INTERFACE_ADDR);


// When the socket is ready to listen
socket.on('listening', (): void => {
	eventsHandler.find((e: Event) => e.name == 'listening')?.run();
});