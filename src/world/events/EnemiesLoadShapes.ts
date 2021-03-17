import {TyEpisodeMapEvent} from "../../Structs";
import {EventBase} from "../EventBase";

export class EnemiesLoadShapes extends EventBase {
    public readonly shapes: number[];
    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.shapes = [e.data1, e.data2, e.data3, e.data4];
    }
}
