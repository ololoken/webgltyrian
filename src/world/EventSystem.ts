import {TyEpisodeMapEvent} from "../Structs";
import {utils} from "pixi.js";
import {CreatedEvent, EventKey, TyEventKindMap} from "./EventMappings";


export class EventSystem extends utils.EventEmitter<EventKey> {
    private readonly events: TyEpisodeMapEvent[];
    private lastOffset: number = -Number.EPSILON;

    constructor (events: TyEpisodeMapEvent[]) {
        super();
        this.events = events;
    }

    /**
     * @param BTPPS number of pixel rows scrolled by ground layer
     */
    public update (BTPPS: number): void {
        this.events.filter(e => e.time > this.lastOffset && e.time <= this.lastOffset+BTPPS+Number.EPSILON)
            .filter(e => {
                if (e.type in TyEventKindMap) {
                    return true;
                }
                else {
                    console.info(`skipping event as unsupported: ${JSON.stringify(e)}`)
                    return false;
                }
            })
            .map(e => this.wrap(e.type, e))
            .map(e => this.emit(e.key, e));
        this.lastOffset += BTPPS;
    }

    private wrap<K extends keyof typeof TyEventKindMap> (t: K, e: TyEpisodeMapEvent): InstanceType<typeof TyEventKindMap[K]> {
        return <InstanceType<typeof TyEventKindMap[K]>>new TyEventKindMap[t](e);
    }

    public emit<K extends EventKey> (e: K, ...o: CreatedEvent<K>[]): boolean {
        return super.emit(e, ...o);
    }

    public on<K extends EventKey> (e: K, fn: (e: CreatedEvent<K>) => void, ctx?: any): this {
        return super.on(e, fn, ctx);
    }

    public getEvents<K extends keyof typeof TyEventKindMap> (t: K): InstanceType<typeof TyEventKindMap[K]>[] {
        return <InstanceType<typeof TyEventKindMap[K]>[]>this.events.filter(e => e.type == t).map(e => this.wrap(e.type, e));
    }
}
