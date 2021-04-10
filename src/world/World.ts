import {MAP_TILE_HEIGHT, MAP_TILE_WIDTH, TyEpisodeItems, TyEpisodeMap} from "../Structs";
import {EventSystem} from "./EventSystem";
import {enemyCreate, enemiesUpdate, enemiesGlobalMove, enemiesAnimate, hasRegisteredEnemies} from "./WorldEnemies";
import {TyEventType} from "./EventMappings";
import {Rectangle, utils} from "pixi.js";
import {MAIN_HEIGHT, MAIN_WIDTH, SCALE} from "../Tyrian";
import {BackSpeed, IPlayerLayer, LayerCode, Layers, WorldObject} from "./Types";
import {Player} from "./Player";

export class World extends utils.EventEmitter {
    private readonly map: TyEpisodeMap;
    protected readonly items: TyEpisodeItems;
    protected readonly eventSystem: EventSystem;

    protected readonly backSpeed: BackSpeed = [0, 0, 0];
    protected readonly layers: Layers;
    protected readonly actionRect: Rectangle = new Rectangle(0, 0, MAIN_WIDTH, MAIN_HEIGHT).pad(40, 40);
    protected readonly gcBox: Rectangle = new Rectangle(-80, -120, 500, 380);
    protected readonly playerBounds: Rectangle = new Rectangle(MAP_TILE_WIDTH, 15, MAP_TILE_WIDTH*9, 155);

    protected STEP = 1;

    private enemyCreate = enemyCreate;
    private enemiesUpdate = enemiesUpdate;
    private enemiesGlobalMove = enemiesGlobalMove;
    private enemiesAnimate = enemiesAnimate;
    private hasRegisteredEnemies = hasRegisteredEnemies;

    protected readonly playerOne: Player;
    private readonly player: WorldObject;

    private keysPressed: {[code: string]: boolean} = {};

    protected readonly state = {
        randomEnemies: false,
        enemySmallAdjustPos: false,

        backDelayGND: 1,
        backDelayGNDMax: 1,
        backDelaySKY: 1,
        backDelaySKYMax: 1,

        backMoveGND: 1,
        backMoveSKY: 1,
        backMoveTOP: 1,

        stopBackgrounds: false,
        stopBackgroundNum: 0,
    }

    constructor(map: TyEpisodeMap, items: TyEpisodeItems, layers: Layers, playerLayer: IPlayerLayer) {
        super();
        this.map = map;
        this.items = items;
        this.layers = layers;

        this.layers[LayerCode.GND].backPos.set((map.backX[LayerCode.GND]-1)*MAP_TILE_WIDTH, 0);
        this.layers[LayerCode.SKY].backPos.set((map.backX[LayerCode.SKY]-1)*MAP_TILE_WIDTH, 0);
        this.layers[LayerCode.TOP].backPos.set((map.backX[LayerCode.TOP]-1)*MAP_TILE_WIDTH, 0);

        this.playerOne = new Player(130, 155, this.items.ships[1]);
        this.player = playerLayer.registerPlayer(this.playerOne);

        this.eventSystem = new EventSystem(this.map.events);
        this.bindBackEvents();
        this.bindEnemyEvents();
        this.bindLevelEvents();
        this.bindStarEvents();
        this.bindKeyboardEvents();
    }

    private bindBackEvents (): void {
        this.eventSystem.on('BackSpeedSet', e => {
            this.state.backDelayGND = 1;
            this.state.backDelayGNDMax = 1;
            this.state.backDelaySKY = 1;
            this.state.backDelaySKYMax = 1;

            this.state.backMoveGND = e.backSpeed[LayerCode.GND];
            this.state.backMoveSKY = e.backSpeed[LayerCode.SKY];
            this.state.backMoveTOP = e.backSpeed[LayerCode.TOP];

            this.backSpeed[LayerCode.GND] = e.backSpeed[LayerCode.GND];
            this.backSpeed[LayerCode.SKY] = e.backSpeed[LayerCode.SKY];
            this.backSpeed[LayerCode.TOP] = e.backSpeed[LayerCode.TOP];

            if (this.backSpeed[LayerCode.GND] > 0) {
                this.state.stopBackgroundNum = 0;
            }
        });
        this.eventSystem.on('BackDelay', e => {
            switch (e.e.type) {
                case TyEventType.BACK_DELAY:
                    this.state.backMoveGND = 1;
                    this.backSpeed[LayerCode.GND] = this.state.backMoveGND;
                    this.state.backDelayGND = 3;
                    this.state.backDelayGNDMax = 3;
                    this.state.backMoveSKY = 1;
                    this.backSpeed[LayerCode.SKY] = this.state.backMoveSKY;
                    this.state.backDelaySKY = 2;
                    this.state.backDelaySKYMax = 2;
                    this.state.backMoveTOP = 1;
                    this.backSpeed[LayerCode.TOP] = this.state.backMoveTOP;
                    break;
                case TyEventType.BACK_DELAY_TYPE:
                    this.state.stopBackgroundNum = e.e.data1 == 0 ? 1 : e.e.data1;
                    break;
            }
            console.log('BackDelay', e);
        });
        this.eventSystem.on('Back2NotTransparent', e => console.log('Back2NotTransparent', e));
        this.eventSystem.on('Back3EnemyOffset', e => console.log('Back3EnemyOffset', e));
        this.eventSystem.on('BackJump', e => console.log('BackJump', e));
        this.eventSystem.on('BackOverSwitch', e => {
            switch (e.backTopOver) {
                case 0: this.layers[LayerCode.TOP].backSpriteOnTop(false); break;
                case 1: this.layers[LayerCode.TOP].backSpriteOnTop(true); break;
                case 2: break;
            }
            console.log('BackOverSwitch', e);
        });
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
        this.eventSystem.on('EnemiesOverSwitch', e => console.log('EnemiesOverSwitch', e));
        this.eventSystem.on('EnemiesContinualDamage', e => console.log('EnemiesContinualDamage', e));
        this.eventSystem.on('EnemyCreate', e => this.enemyCreate(e));
    }

    public getRequiredShapes (): number[] {
        return this.eventSystem.getEvents(TyEventType.ENEMIES_LOAD_SHAPES)
            .reduce((a, e) => [...a, ...e.shapes], <number[]>[])
            .filter(s => s > 0)
    }

    public update (delta: number): void {
        if (!this.hasRegisteredEnemies() && this.state.stopBackgroundNum == 1) {
            this.state.stopBackgroundNum = 9;
        }
        if (!this.hasRegisteredEnemies() && this.state.stopBackgrounds) {
            this.state.stopBackgrounds = false;
            this.state.backMoveGND = 1;
            this.state.backMoveSKY = 2;
            this.state.backMoveTOP = 3;
        }

        if (this.state.backDelayGNDMax > 1 && this.state.backMoveGND < 2) {
            this.state.backMoveGND = (this.state.backDelayGND == 1) ? 1 : 0;
        }

        if (this.state.backMoveGND != 0) {
            this.eventSystem.update(this.STEP);
        }

        if (--this.state.backDelayGND == 0) {
            this.state.backDelayGND = this.state.backDelayGNDMax;
            this.backSpeed[LayerCode.GND] = this.state.backMoveGND;
        }

        if (--this.state.backDelaySKY == 0) {
            this.state.backDelaySKY = this.state.backDelaySKYMax;
            this.backSpeed[LayerCode.SKY] = this.state.backMoveSKY;
        }

        this.backSpeed[LayerCode.TOP] = this.state.backMoveTOP;

        this.updateBackground(this.STEP);
        this.enemiesUpdate(this.STEP);
        this.playersUpdate(this.STEP);
    }

    private updateBackground (step: number): void {
        let parallax = this.playerOne.position.x/260;

        this.layers[LayerCode.GND].parallaxOffset.x = (-MAP_TILE_WIDTH*(1*parallax+2)*SCALE>>0)/SCALE;
        this.layers[LayerCode.SKY].parallaxOffset.x = (-MAP_TILE_WIDTH*(2*parallax+1)*SCALE>>0)/SCALE;
        this.layers[LayerCode.TOP].parallaxOffset.x = (-MAP_TILE_WIDTH*(3*parallax+0)*SCALE>>0)/SCALE;

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

        this.playerOne.xc += step*this.playerOne.xAccel;
        this.playerOne.yc += step*this.playerOne.yAccel;

        this.playerOne.xc = Math.min(4, Math.max(-4, this.playerOne.xc));
        this.playerOne.yc = Math.min(4, Math.max(-4, this.playerOne.yc));

        this.playerOne.banking = Math.max(-2, Math.min(2, Math.floor(this.playerOne.xc/2)));

        this.playerOne.position.x += step*this.playerOne.xc;
        this.playerOne.position.y += step*this.playerOne.yc;

        this.playerOne.xc = Math.sign(this.playerOne.xc)*(Math.max(0, Math.abs(this.playerOne.xc)-0.45*step));
        this.playerOne.yc = Math.sign(this.playerOne.yc)*(Math.max(0, Math.abs(this.playerOne.yc)-0.45*step));

        if (this.playerBounds.x > this.playerOne.position.x) {
            this.playerOne.position.x = this.playerBounds.x;
        }
        if (this.playerBounds.y > this.playerOne.position.y) {
            this.playerOne.position.y = this.playerBounds.y;
        }
        if (this.playerBounds.x+this.playerBounds.width < this.playerOne.position.x) {
            this.playerOne.position.x = this.playerBounds.x+this.playerBounds.width;
        }
        if (this.playerBounds.y+this.playerBounds.height < this.playerOne.position.y) {
            this.playerOne.position.y = this.playerBounds.y+this.playerBounds.height;
        }

        this.player.position.copyFrom(this.playerOne.position);
        this.player.animationStep.x = Math.round(this.playerOne.banking*2)+this.playerOne.shipGraphic;
    }
}
