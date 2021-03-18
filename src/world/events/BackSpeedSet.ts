import {TyEpisodeMapEvent} from "../../Structs";
import {EventBase} from "../EventBase";
import {EventKey} from "../EventMappings";

export class BackSpeedSet extends EventBase {
    key: EventKey = 'BackSpeedSet'
    public readonly backSpeed: [number, number, number];
    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.backSpeed = [e.data1, e.data2, e.data3];
    }
}
