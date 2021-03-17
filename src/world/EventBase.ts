import {TyEpisodeMapEvent} from "../Structs";

export abstract class EventBase {
    public readonly e: TyEpisodeMapEvent;
    public constructor (e: TyEpisodeMapEvent) {
        this.e = e;
    }
}
