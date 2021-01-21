// Imports dependancies
import * as dgram from 'dgram';
import config from './config.json';
import eventsHandler from './src/events/eventsHandler';
import Event from './src/modules/Event';


export const socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
socket.bind(config.PORT);


// When the socket is ready to listen
socket.on('listening', (): void => {
	eventsHandler.find((e: Event) => e.name == 'listening')?.run();
});


socket.on('message', (message: Buffer, remote: dgram.RemoteInfo): void => {
	eventsHandler.find((e: Event) => e.name == 'message')?.run(message, remote);
});