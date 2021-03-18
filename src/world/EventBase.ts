import {TyEpisodeMapEvent} from "../Structs";
import {EventKey} from "./EventMappings";

export abstract class EventBase {
    public abstract readonly key: EventKey;
    public readonly e: TyEpisodeMapEvent;
    public constructor (e: TyEpisodeMapEvent) {
        this.e = e;
    }
}
