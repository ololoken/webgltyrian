import {TILE_HEIGHT, TyEpisodeItems, TyEpisodeMap} from "../Structs";
import {EventSystem} from "./EventSystem";
import {ObservablePoint} from "pixi.js";
import {Layer} from "../scenes/game/Layer";
import {createEnemy} from "./WorldCreateEnemy";
import {TyEventType} from "./EventMappings";

type BackSpeed = [number, number, number];

export enum LayerCode {
    GND = 0,
    SKY = 1,
    TOP = 2
}

type BacksPosition = [ObservablePoint<Layer>, ObservablePoint<Layer>, ObservablePoint<Layer>];

export class World {
    private readonly map: TyEpisodeMap;
    private readonly items: TyEpisodeItems;
    private readonly eventSystem: EventSystem;

    private readonly backSpeed: BackSpeed = [0, 0, 0];
    private readonly backPos: BacksPosition;

    private createEnemy = createEnemy;

    constructor(map: TyEpisodeMap, items: TyEpisodeItems, backPos: BacksPosition) {
        this.map = map;
        this.items = items;
        this.backPos = backPos;

        this.eventSystem = new EventSystem(this.map.events);

        this.eventSystem.on('BackSpeedSet', (e) => {
            this.backSpeed[LayerCode.GND] = e.backSpeed[LayerCode.GND];
            this.backSpeed[LayerCode.SKY] = e.backSpeed[LayerCode.SKY];
            this.backSpeed[LayerCode.TOP] = e.backSpeed[LayerCode.TOP];
        });

        this.eventSystem.on('EnemyCreate', (e) => this.createEnemy(e));
    }

    getRequiredShapes (): number[] {
        return this.eventSystem.getEvents(TyEventType.ENEMIES_LOAD_SHAPES)
            .reduce((a, e) => [...a, ...e.shapes], <number[]>[])
            .filter(s => s > 0)
    }

    public update (d: number): void {
        this.updateEventSystem(d);
        this.updateBackground(d);
    }

    private updateBackground (d: number) {
        //todo: add parallax effect here when player will be ready
        this.backPos[LayerCode.GND].y += d*this.backSpeed[LayerCode.GND];
        this.backPos[LayerCode.SKY].y += d*this.backSpeed[LayerCode.SKY];
        this.backPos[LayerCode.TOP].y += d*this.backSpeed[LayerCode.TOP];
    }

    private updateEventSystem (d: number) {
        this.eventSystem.update(d*this.backSpeed[LayerCode.GND]*TILE_HEIGHT);
    }

}
