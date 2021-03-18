import {TyEpisodeMapEvent} from "../Structs";
import {EventKey} from "./EventMappings";

export abstract class EventBase {
    public abstract readonly key: EventKey; //needs to ignore optimization/minimization of code in webpack or any other tool
    public readonly e: TyEpisodeMapEvent;
    public constructor (e: TyEpisodeMapEvent) {
        this.e = e;
    }
}
