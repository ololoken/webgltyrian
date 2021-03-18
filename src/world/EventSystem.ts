import {TyEpisodeMapEvent} from "../Structs";
import {utils} from "pixi.js";
import {CreatedEvent, EventKey, TyEventKindMap} from "./EventMappings";


export class EventSystem extends utils.EventEmitter<EventKey> {
    private readonly events: TyEpisodeMapEvent[];
    private lastTime: number = -Number.EPSILON;

    constructor (events: TyEpisodeMapEvent[]) {
        super();
        this.events = events;
    }

    public update (dt: number): void {
        this.events.filter(e => e.time > this.lastTime && e.time <= this.lastTime+dt)
            .filter(e => {
                if (e.type in TyEventKindMap) {
                    return true;
                }
                else {
                    console.log(`skipping event as unsupported: ${JSON.stringify(e)}`)
                    return false;
                }
            })
            .map(e => this.wrap(e.type, e))
            .map(e => this.emit(e.key, e));
        this.lastTime += dt;
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
