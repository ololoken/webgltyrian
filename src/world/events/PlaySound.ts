import {EventBase} from "../EventBase";
import {EventKey} from "../EventMappings";
import {TyEpisodeMapEvent} from "../../Structs";

export class PlaySound extends EventBase {
    key: EventKey = 'PlaySound';
    public readonly sound: number;
    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.sound = e.data1;
    }
}
