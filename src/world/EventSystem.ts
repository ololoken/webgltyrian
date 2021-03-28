import {TyEpisodeMapEvent} from "../Structs";
import {utils} from "pixi.js";
import {CreatedEvent, EventKey, TyEventKindMap} from "./EventMappings";


export class EventSystem extends utils.EventEmitter<EventKey> {
    private readonly events: TyEpisodeMapEvent[];
    public lastOffset: number = -Number.EPSILON;

    constructor (events: TyEpisodeMapEvent[]) {
        super();
        this.events = events;
    }

    /**
     * @param BTPPS number of pixel rows scrolled by ground layer
     */
    public update (step: number): void {
        this.events.forEach(e => {
                let inTime = e.time > this.lastOffset && e.time <= this.lastOffset+step+Number.EPSILON;
                if (!inTime) {
                    return false;
                }
                if (e.type in TyEventKindMap) {
                    let wrappedEvent = new TyEventKindMap[<keyof typeof TyEventKindMap>e.type](e);
                    this.emit(wrappedEvent.key, wrappedEvent);
                }
                else {
                    console.info(`skipping event as unsupported: ${JSON.stringify(e)}`)
                    return false;
                }
            });
        this.lastOffset += step;
    }

    public emit<K extends EventKey> (e: K, ...o: CreatedEvent<K>[]): boolean {
        return super.emit(e, ...o);
    }

    public on<K extends EventKey> (e: K, fn: (e: CreatedEvent<K>) => void, ctx?: any): this {
        return super.on(e, fn, ctx);
    }

    public getEvents<K extends keyof typeof TyEventKindMap> (t: K): InstanceType<typeof TyEventKindMap[K]>[] {
        return <InstanceType<typeof TyEventKindMap[K]>[]>this.events
            .filter(e => e.type == t)
            .map(e => new TyEventKindMap[<keyof typeof TyEventKindMap>e.type](e));
    }
}
