// Import dependancies
import Event from '../modules/Event';
import listeningEvent from './listening';
import messageEvent from './message';


// Creates and exports the events handler
const eventsHandler: Event[] = [listeningEvent, messageEvent];
export default eventsHandler;