import {MAP_TILE_HEIGHT, MAP_TILE_WIDTH, TyEpisodeItems, TyEpisodeMap} from "../Structs";
import {EventSystem} from "./EventSystem";
import {enemyCreate, enemiesUpdate, enemiesGlobalMove, enemiesAnimate} from "./WorldEnemies";
import {TyEventType} from "./EventMappings";
import {Rectangle, utils} from "pixi.js";
import {FPS, MAIN_HEIGHT, MAIN_WIDTH} from "../Tyrian";
import {BackSpeed, LayerCode, Layers, WorldObject} from "./Types";
import {Player} from "./Player";

export class World extends utils.EventEmitter {
    private readonly map: TyEpisodeMap;
    protected readonly items: TyEpisodeItems;
    protected readonly eventSystem: EventSystem;

    protected readonly backSpeed: BackSpeed = [0, 0, 0];
    protected readonly layers: Layers;
    protected readonly actionRect: Rectangle = new Rectangle(0, 0, MAIN_WIDTH, MAIN_HEIGHT).pad(40, 40);
    protected readonly gcBox: Rectangle = new Rectangle(-80, -120, 500, 360);

    protected BTPPS = 0;
    protected readonly STEP = 1;

    private enemyCreate = enemyCreate;
    private enemiesUpdate = enemiesUpdate;
    private enemiesGlobalMove = enemiesGlobalMove;
    private enemiesAnimate = enemiesAnimate;

    private readonly playerOne: Player;
    private readonly player: WorldObject;

    private keysPressed: {[code: string]: boolean} = {};

    protected readonly state = {
        randomEnemies: false,
        enemySmallAdjustPos: false,
        topEnemyOver: false,
    }

    constructor(map: TyEpisodeMap, items: TyEpisodeItems, layers: Layers) {
        super();
        this.map = map;
        this.items = items;
        this.layers = layers;

        this.layers[LayerCode.GND].backPos.set((map.backX[LayerCode.GND]-1)*MAP_TILE_WIDTH, 0);
        this.layers[LayerCode.SKY].backPos.set((map.backX[LayerCode.SKY]-1)*MAP_TILE_WIDTH, 0);
        this.layers[LayerCode.TOP].backPos.set((map.backX[LayerCode.TOP]-1)*MAP_TILE_WIDTH, 0);

        this.playerOne = new Player(100, 100, this.items.ships[1]);
        this.player = this.layers[LayerCode.SKY].registerPlayer(this.playerOne);

        this.eventSystem = new EventSystem(this.map.events);
        this.bindBackEvents();
        this.bindEnemyEvents();
        this.bindLevelEvents();
        this.bindStarEvents();
        this.bindKeyboardEvents();
    }

    private bindBackEvents (): void {
        this.eventSystem.on('BackSpeedSet', e => {
            this.backSpeed[LayerCode.GND] = e.backSpeed[LayerCode.GND];
            this.backSpeed[LayerCode.SKY] = e.backSpeed[LayerCode.SKY];
            this.backSpeed[LayerCode.TOP] = e.backSpeed[LayerCode.TOP];
        });
        this.eventSystem.on('BackDelay', e => {
            console.log('BackDelay', e);
        });
        this.eventSystem.on('Back2NotTransparent', e => console.log('Back2NotTransparent', e));
        this.eventSystem.on('Back3EnemyOffset', e => console.log('Back3EnemyOffset', e));
        this.eventSystem.on('BackJump', e => console.log('BackJump', e));
        this.eventSystem.on('BackOverSwitch', e => console.log('BackOverSwitch', e));
        this.eventSystem.on('BackWrap', e => console.log('BackWrap', e));
        this.eventSystem.on('BackWrap', e => console.log('BackWrap', e));
    }

    private bindStarEvents (): void {
        this.eventSystem.on('StarsSwitch', e => console.log('StarsSwitch', e));
        this.eventSystem.on('StarsSpeedSet', e => console.log('StarsSpeedSet', e));
    }

    private bindLevelEvents (): void {
        this.eventSystem.on('LevelSmoothies', e => console.log('LevelSmoothies', e));
        this.eventSystem.on('LevelFilters', e => console.log('LevelFilters', e));
        this.eventSystem.on('LevelEnemiesFrequency', e => console.log('LevelEnemiesFrequency', e));
        this.eventSystem.on('LevelDifficulty', e => console.log('LevelDifficulty', e));
        this.eventSystem.on('LevelEnd', e => {
            this.emit('MissionEnd');
        });
    }

    private bindEnemyEvents (): void {
        this.eventSystem.on('EnemiesRandomSwitch', e => this.state.randomEnemies = e.state);
        this.eventSystem.on('EnemiesMoveOverride', e => console.log('EnemiesMoveOverride', e))
        this.eventSystem.on('EnemiesGlobalAnimate', e => this.enemiesAnimate(e));
        this.eventSystem.on('EnemiesGlobalDamage', e => console.log('EnemiesGlobalDamage', e));
        this.eventSystem.on('EnemiesGlobalLinkNum', e => console.log('EnemiesGlobalLinkNum', e));
        this.eventSystem.on('EnemiesGlobalMove', e => this.enemiesGlobalMove(e));
        this.eventSystem.on('EnemySpecialAssign', e => console.log('EnemySpecialAssign', e));
        this.eventSystem.on('EnemiesReset', e => console.log('EnemiesReset', e));
        this.eventSystem.on('EnemySmallAdjustPos', e => this.state.enemySmallAdjustPos = e.state);
        this.eventSystem.on('EnemySpawn', e => console.log('EnemySpawn', e));
        this.eventSystem.on('EnemyBossLinkNum', e => console.log('EnemyBossLinkNum', e));
        this.eventSystem.on('EnemiesOverSwitch', e => this.state.topEnemyOver = e.state);
        this.eventSystem.on('EnemiesContinualDamage', e => console.log('EnemiesContinualDamage', e));
        this.eventSystem.on('EnemyCreate', e => this.enemyCreate(e));
    }

    public getRequiredShapes (): number[] {
        return this.eventSystem.getEvents(TyEventType.ENEMIES_LOAD_SHAPES)
            .reduce((a, e) => [...a, ...e.shapes], <number[]>[])
            .filter(s => s > 0)
    }

    public update (delta: number): void {
        //Try to use rule: 1 tyrian speed value = 1 background tile per second
        this.BTPPS += MAP_TILE_HEIGHT/FPS*delta;
        for (;  this.BTPPS >= 1; this.BTPPS -= 1) {
            this.eventSystem.update(this.STEP);
            this.updateBackground(this.STEP);
            this.enemiesUpdate(this.STEP);
            this.playersUpdate(this.STEP);
        }
    }

    private updateBackground (step: number): void {
        //todo: add parallax effect here when player will be ready
        this.layers[LayerCode.GND].backPos.y += step*this.backSpeed[LayerCode.GND];
        this.layers[LayerCode.SKY].backPos.y += step*this.backSpeed[LayerCode.SKY];
        this.layers[LayerCode.TOP].backPos.y += step*this.backSpeed[LayerCode.TOP];
    }

    private bindKeyboardEvents (): void {
        window.addEventListener('keydown', (e) => {
            this.keysPressed[e.code] = true;
            e.preventDefault();
        })
        window.addEventListener('keyup', (e) => {
            this.keysPressed[e.code] = false;
            e.preventDefault();
        })
    }

    private playersUpdate (step: number): void {
        if (this.keysPressed['ArrowLeft']) {
            this.playerOne.xAccel = Math.max(-2, this.playerOne.xAccel-step);
        }
        if (this.keysPressed['ArrowRight']) {
            this.playerOne.xAccel = Math.min(2, this.playerOne.xAccel+step);
        }
        if (!this.keysPressed['ArrowLeft'] && !this.keysPressed['ArrowRight']) {
            this.playerOne.xAccel = 0;
        }

        if (this.keysPressed['ArrowUp']) {
            this.playerOne.yAccel = Math.max(-2, this.playerOne.yAccel-step);
        }
        if (this.keysPressed['ArrowDown']) {
            this.playerOne.yAccel = Math.min(2, this.playerOne.yAccel+step);
        }
        if (!this.keysPressed['ArrowUp'] && !this.keysPressed['ArrowDown']) {
            this.playerOne.yAccel = 0;
        }

        this.playerOne.xc += this.playerOne.xAccel;
        this.playerOne.yc += this.playerOne.yAccel;

        this.playerOne.xc = Math.min(4, Math.max(-4, this.playerOne.xc-Math.sign(this.playerOne.xc)));
        this.playerOne.yc = Math.min(4, Math.max(-4, this.playerOne.yc-Math.sign(this.playerOne.yc)));

        this.playerOne.banking = Math.max(-2, Math.min(2, Math.floor(this.playerOne.xc/2)));

        this.playerOne.position.x += this.playerOne.xc;
        this.playerOne.position.y += this.playerOne.yc;

        this.player.position.copyFrom(this.playerOne.position);
        this.player.animationStep.x = this.playerOne.banking*2+this.playerOne.shipGraphic;
    }
}
