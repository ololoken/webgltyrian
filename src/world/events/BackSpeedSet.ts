import {TyEpisodeMapEvent} from "../../Structs";
import {EventBase} from "../EventBase";

export class BackSpeedSet extends EventBase {
    public readonly backSpeed: [number, number, number];
    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.backSpeed = [e.data1, e.data2, e.data3];
    }
}
