import {TILE_HEIGHT, TyEpisodeItems, TyEpisodeMap} from "../Structs";
import {EventSystem} from "./EventSystem";
import {Layer} from "../scenes/game/Layer";
import {createEnemy, updateEnemies} from "./WorldEnemies";
import {TyEventType} from "./EventMappings";

type BackSpeed = [number, number, number];

export enum LayerCode {
    GND = 0,
    SKY = 1,
    TOP = 2
}

type Layers = [Layer, Layer, Layer];

export class World {
    private readonly map: TyEpisodeMap;
    protected readonly items: TyEpisodeItems;
    private readonly eventSystem: EventSystem;

    private readonly backSpeed: BackSpeed = [0, 0, 0];
    protected readonly layers: Layers;

    private createEnemy = createEnemy;
    private updateEnemies = updateEnemies;

    constructor(map: TyEpisodeMap, items: TyEpisodeItems, layers: Layers) {
        this.map = map;
        this.items = items;
        this.layers = layers;

        this.eventSystem = new EventSystem(this.map.events);
        this.bindBackEvents();
        this.bindEnemyEvents();
    }

    private bindBackEvents (): void {
        this.eventSystem.on('BackSpeedSet', (e) => {
            this.backSpeed[LayerCode.GND] = e.backSpeed[LayerCode.GND];
            this.backSpeed[LayerCode.SKY] = e.backSpeed[LayerCode.SKY];
            this.backSpeed[LayerCode.TOP] = e.backSpeed[LayerCode.TOP];
        });
    }

    private bindEnemyEvents (): void {
        this.eventSystem.on('EnemyCreate', (e) => this.createEnemy(e));
    }

    public getRequiredShapes (): number[] {
        return this.eventSystem.getEvents(TyEventType.ENEMIES_LOAD_SHAPES)
            .reduce((a, e) => [...a, ...e.shapes], <number[]>[])
            .filter(s => s > 0)
    }

    public update (d: number): void {
        this.eventSystem.update(d*this.backSpeed[LayerCode.GND]*TILE_HEIGHT);
        this.updateBackground(d);
        this.updateEnemies(d);
    }

    private updateBackground (d: number) {
        //todo: add parallax effect here when player will be ready
        this.layers[LayerCode.GND].backPos.y += d*this.backSpeed[LayerCode.GND]*TILE_HEIGHT;
        this.layers[LayerCode.SKY].backPos.y += d*this.backSpeed[LayerCode.SKY]*TILE_HEIGHT;
        this.layers[LayerCode.TOP].backPos.y += d*this.backSpeed[LayerCode.TOP]*TILE_HEIGHT;
    }

}
