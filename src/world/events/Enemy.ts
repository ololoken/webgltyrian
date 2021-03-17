import {TyEpisodeMapEvent} from "../../Structs";
import {EventBase} from "../EventBase";

export class Enemy extends EventBase {
    public readonly ex: number;
    public readonly ey: number;
    public readonly episodeEnemyIndex: number;
    public readonly shapesIndex: number;

    public constructor(e: TyEpisodeMapEvent) {
        super(e);
        this.ex = e.data2;
        this.ey = 0;
        this.episodeEnemyIndex = e.data1;
        this.shapesIndex = 0;
    }
}
