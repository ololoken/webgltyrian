import {TyEpisodeMapEvent} from "../../Structs";
import {EventBase} from "../EventBase";

export class BackSpeedSet extends EventBase {
    public readonly back1Speed: number;
    public readonly back2Speed: number;
    public readonly back3Speed: number;
    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.back1Speed = e.data1;
        this.back2Speed = e.data2;
        this.back3Speed = e.data3;
    }
}
