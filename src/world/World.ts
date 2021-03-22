import {TILE_HEIGHT, TILE_WIDTH, TyEpisodeItems, TyEpisodeMap} from "../Structs";
import {EventSystem} from "./EventSystem";
import {createEnemy, updateEnemies} from "./WorldEnemies";
import {TyEventType} from "./EventMappings";
import {Rectangle, utils} from "pixi.js";
import {MAIN_HEIGHT, MAIN_WIDTH} from "../Tyrian";
import {BackSpeed, LayerCode, Layers} from "./Types";

export class World extends utils.EventEmitter {
    private readonly map: TyEpisodeMap;
    protected readonly items: TyEpisodeItems;
    private readonly eventSystem: EventSystem;

    protected readonly backSpeed: BackSpeed = [0, 0, 0];
    protected readonly layers: Layers;
    protected readonly actionRect: Rectangle = new Rectangle(0, 0, MAIN_WIDTH, MAIN_HEIGHT).pad(20, 20);
    protected readonly gcBox: Rectangle = new Rectangle(-80, -112, 420, 302)

    private createEnemy = createEnemy;
    private updateEnemies = updateEnemies;

    constructor(map: TyEpisodeMap, items: TyEpisodeItems, layers: Layers) {
        super();
        this.map = map;
        this.items = items;
        this.layers = layers;

        this.layers[LayerCode.GND].backPos.set((map.backX[LayerCode.GND]-1)*TILE_WIDTH, 0);
        this.layers[LayerCode.SKY].backPos.set((map.backX[LayerCode.SKY]-1)*TILE_WIDTH, 0);
        this.layers[LayerCode.TOP].backPos.set((map.backX[LayerCode.TOP]-1)*TILE_WIDTH, 0);

        this.eventSystem = new EventSystem(this.map.events);
        this.bindBackEvents();
        this.bindEnemyEvents();
        this.bindLevelEvents();
    }

    private bindBackEvents (): void {
        this.eventSystem.on('BackSpeedSet', e => {
            this.backSpeed[LayerCode.GND] = e.backSpeed[LayerCode.GND];
            this.backSpeed[LayerCode.SKY] = e.backSpeed[LayerCode.SKY];
            this.backSpeed[LayerCode.TOP] = e.backSpeed[LayerCode.TOP];
        });
    }

    private bindLevelEvents (): void {
        this.eventSystem.on('LevelEnd', e => {
            this.emit('MissionEnd');
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

    public update (deltaSec: number): void {
        //Try to use rule: 1 tyrian speed value = 1 background tile per second
        let BTPPS = deltaSec*TILE_HEIGHT;
        this.eventSystem.update(BTPPS);
        this.updateBackground(BTPPS);
        this.updateEnemies(BTPPS);
    }

    private updateBackground (BTPPS: number) {
        //todo: add parallax effect here when player will be ready
        this.layers[LayerCode.GND].backPos.y += BTPPS*this.backSpeed[LayerCode.GND];
        this.layers[LayerCode.SKY].backPos.y += BTPPS*this.backSpeed[LayerCode.SKY];
        this.layers[LayerCode.TOP].backPos.y += BTPPS*this.backSpeed[LayerCode.TOP];
    }

}
