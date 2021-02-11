/**
 * @class Event
 */
export default class Event {
	private _name: string;

	public run: (arg0?: any, arg1?: any) => void;

	/**
	 * Event's contructor
	 * @param name event's name
	 * @param run function to run when the event is triggered
	 */
	public constructor(name: string, run: (arg0?: any, arg1?: any) => void) {
		this._name = name;
		this.run = run;
	}

	public get name(): string {
		return this._name;
	}
}
