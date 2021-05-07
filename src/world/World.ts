import {EnemySize, MAP_TILE_WIDTH, TyEpisodeItems, TyEpisodeMap, TyEventType} from "../Structs";
import {EventSystem} from "./EventSystem";
import {
    enemiesAnimate,
    enemiesGlobalMove,
    EnemyCode,
    EnemyCodeAddFixedMoveY,
    EnemyCodeToLayerMapping,
    enemyCreate,
    enemyLaunch,
    enemyShotsCreate,
    enemySpecialAssign,
    getClosestEnemy,
    hasRegisteredEnemies,
    updateEnemies,
    updateEnemiesShots
} from "./WorldEnemies";
import {Rectangle, utils} from "pixi.js";
import {MAIN_HEIGHT, MAIN_WIDTH, SCALE} from "../Tyrian";
import {
    BackSpeed,
    EnemyRegistered,
    EnemyShotRegistered,
    Explosion,
    ExplosionRepeat,
    ExplosionsRegistered,
    IPlayerLayer,
    IWorldObject,
    LayerCode,
    Layers,
    PlayerShotRegistered
} from "./Types";
import {Player, WeaponCode} from "./Player";
import {Audio} from "../Audio";
import {cache, ExplosionData, SFX_CODE} from "../Resources";

export class World extends utils.EventEmitter {
    private readonly map: TyEpisodeMap;
    protected readonly items: TyEpisodeItems;
    protected readonly eventSystem: EventSystem;

    protected readonly backSpeed: BackSpeed = [0, 0, 0];
    protected readonly layers: Layers;
    protected readonly actionRect: Rectangle = new Rectangle(0, 0, MAIN_WIDTH, MAIN_HEIGHT).pad(40, 40);
    protected readonly gcBox: Rectangle = new Rectangle(-80, -120, 500, 380);

    protected STEP = 1;

    private enemyCreate = enemyCreate;
    private updateEnemies = updateEnemies;
    private enemiesGlobalMove = enemiesGlobalMove;
    private enemiesAnimate = enemiesAnimate;
    private hasRegisteredEnemies = hasRegisteredEnemies;
    private updateEnemiesShots = updateEnemiesShots;
    private getClosestEnemy = getClosestEnemy;
    protected enemyShotsCreate = enemyShotsCreate;
    protected enemyLaunch = enemyLaunch;
    protected enemySpecialAssign = enemySpecialAssign;

    protected readonly playerLayer: IPlayerLayer;
    private readonly playerOne: Player;
    private readonly player: IWorldObject;

    private keysPressed: {[code: string]: boolean} = {};

    protected readonly registeredEnemies: EnemyRegistered[] = [];
    public readonly registeredPlayerShots: PlayerShotRegistered[] = [];
    public readonly registeredEnemyShots: EnemyShotRegistered[] = [];
    public readonly registeredExplosions: ExplosionsRegistered[] = [];
    private readonly repetitiveExplosions: ExplosionRepeat[] = [];

    protected readonly state = {
        randomEnemies: false,
        enemySmallAdjustPos: false,
        enemyContinualDamage: false,

        backDelayGND: 1,
        backDelayGNDMax: 1,
        backDelaySKY: 1,
        backDelaySKYMax: 1,

        backMoveGND: 1,
        backMoveSKY: 1,
        backMoveTOP: 1,

        stopBackgrounds: false,
        stopBackgroundNum: 0,

        cubeMax: 0,

        globalFlags: [false, false, false, false, false, false, false, false, false]
    }

    constructor(map: TyEpisodeMap, items: TyEpisodeItems, layers: Layers, playerLayer: IPlayerLayer) {
        super();
        this.map = map;
        this.items = items;
        this.layers = layers;
        this.playerLayer = playerLayer;

        console.log(this.items);

        this.layers[LayerCode.GND].backPos.set((map.backX[LayerCode.GND]-1)*MAP_TILE_WIDTH, 0);
        this.layers[LayerCode.SKY].backPos.set((map.backX[LayerCode.SKY]-1)*MAP_TILE_WIDTH, 0);
        this.layers[LayerCode.TOP].backPos.set((map.backX[LayerCode.TOP]-1)*MAP_TILE_WIDTH, 0);

        this.playerOne = new Player(130, 155, this.items.ships[1], this.items.weapons[166]);
        this.player = this.playerLayer.registerPlayer(this.playerOne);

        this.eventSystem = new EventSystem(this.map.events);
        this.bindBackEvents();
        this.bindEnemyEvents();
        this.bindLevelEvents();
        this.bindStarEvents();
        this.bindMiscEvents();
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
        this.eventSystem.on('EnemySpecialAssign', e => this.enemySpecialAssign(e));
        this.eventSystem.on('EnemiesReset', e => console.log('EnemiesReset', e));
        this.eventSystem.on('EnemySmallAdjustPos', e => this.state.enemySmallAdjustPos = e.state);
        this.eventSystem.on('EnemySpawn', e => console.log('EnemySpawn', e));
        this.eventSystem.on('EnemyBossLinkNum', e => console.log('EnemyBossLinkNum', e));
        this.eventSystem.on('EnemiesOverSwitch', e => console.log('EnemiesOverSwitch', e));
        this.eventSystem.on('EnemiesContinualDamage', e => console.log('EnemiesContinualDamage', e));
        this.eventSystem.on('EnemyCreate', e => this.enemyCreate(e));
    }

    private bindMiscEvents (): void {
        this.eventSystem.on('PlaySound', e => Audio.getInstance().enqueue(3, cache.sfx[e.sound-1]));
    }

    public getRequiredShapes (): number[] {
        return this.eventSystem.getEvents(TyEventType.ENEMIES_LOAD_SHAPES)
            .reduce((a, e) => [...a, ...e.shapes], <number[]>[])
            .filter(s => s > 0)
    }

    public update (delta: number): void {
        this.updateEventSystem(this.STEP);
        this.updateBackground(this.STEP);
        this.updateEnemies(this.STEP, this.playerOne);
        this.updateEnemiesShots(this.STEP, this.playerOne);
        this.updatePlayers(this.STEP);
        this.updateExplosions(this.STEP);
/*
        // @ts-ignore
        this.rects.forEach(rect => this.playerLayer.removeChild(rect));
        this.registeredEnemies.forEach(e => {
            // @ts-ignore
            let rel = this.layers[EnemyCodeToLayerMapping[e.code]].position;
            let rect = e.getBoundingRect();
            const rectangle = Sprite.from(Texture.WHITE);
            rectangle.position.x = rect.x-rel.x;
            rectangle.position.y = rect.y-rel.y;
            rectangle.width = rect.width;
            rectangle.height = rect.height;
            // @ts-ignore
            this.rects.push(this.playerLayer.addChild(rectangle));
        });
*/
        Audio.getInstance().play();
        Audio.getInstance().dequeue();
    }

    private updateEventSystem (step: number): void {
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

        this.state.backDelayGND -= this.STEP;

        if (this.state.backDelayGND <= 0) {
            this.state.backDelayGND = this.state.backDelayGNDMax;
            this.backSpeed[LayerCode.GND] = this.state.backMoveGND;
        }

        this.state.backDelaySKY -= this.STEP;

        if (this.state.backDelaySKY <= 0) {
            this.state.backDelaySKY = this.state.backDelaySKYMax;
            this.backSpeed[LayerCode.SKY] = this.state.backMoveSKY;
        }

        this.backSpeed[LayerCode.TOP] = this.state.backMoveTOP;
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

    private updatePlayers (step: number): void {
        this.updatePlayerShots(step);
        this.collidePlayerShots();
        this.collideEnemiesShots();

        this.playerOne.update(this.keysPressed, step);
        this.player.animationStep.x = Math.round(this.playerOne.banking*2)+this.playerOne.shipGraphic;
        this.player.position.copyFrom(this.playerOne.position);
    }

    private updatePlayerShots (step: number): void {
        if (this.keysPressed['Space']) {
            this.playerOne.shotsCreate(WeaponCode.SHOT_FRONT, step, 130, 100).forEach(shot => {
                if (this.playerOne.weapons[WeaponCode.SHOT_FRONT].aim > 5) {/*Guided Shot*/
                    shot.aimDelay = 5;
                    shot.aimDelayMax = this.playerOne.weapons[WeaponCode.SHOT_FRONT].aim-shot.aimDelay;
                    shot.aimAtEnemy = this.getClosestEnemy(this.playerOne.position);
                }
                this.registeredPlayerShots.push({id: shot.id, shot, ...this.playerLayer.registerShot(shot)});
            });
        }
        for (let i = this.registeredPlayerShots.length-1; i >= 0; i--) {
            let {shot, name, position, id, animationStep, getBoundingRect} = this.registeredPlayerShots[i];
            this.playerOne.shotUpdate(id, shot, step);
            position.copyFrom(shot.position);
            animationStep.x = shot.animationCycle;

            let readyToGC = !this.gcBox.contains(shot.position.x, shot.position.y);
            if (readyToGC) {
                this.playerOne.shotRemove(id);
                this.registeredPlayerShots.splice(i, 1);
                this.playerLayer.unregisterObject(name);
            }
        }
    }

    private collidePlayerShots (): void {
        for (let i = this.registeredPlayerShots.length-1; i >= 0; i--) {
            let {shot, name: shotName, id, getBoundingRect} = this.registeredPlayerShots[i];
            let hitEnemies = this.registeredEnemies.filter(({getBoundingRect: enemyGetBoundingRect}) => this.intersects(getBoundingRect(), enemyGetBoundingRect()));
            if (hitEnemies.length > 0) {
                let shotExpired = false;
                for (let j = 0; j < hitEnemies.length && !shotExpired; j++) {
                    //todo: chain/infinite/ice shot
                    //not killed but damaged
                    let {enemy, code} = hitEnemies[j];
                    if (enemy.armor > shot.shotDmg) {
                        if (enemy.armor - shot.shotDmg <= enemy.edlevel && Number(!enemy.damaged)^Number(enemy.edani < 0)) {
                            this.registeredEnemies.filter(({enemy: e}) =>
                                enemy === e || ((enemy.linknum !== 0)
                                    && ((e.edlevel > 0 && e.linknum == enemy.linknum)
                                    || (this.state.enemyContinualDamage && enemy.linknum-100 == e.linknum))
                                    || (e.linknum > 40 && e.linknum/20 == enemy.linknum/20 && e.linknum <= enemy.linknum)//WTF?
                                )
                            ).forEach(({code, name: enemyName, enemy: e}) => {
                                e.animationCycle = 0;

                                e.damaged = !e.damaged;

                                if (e.edani != 0) {
                                    e.animationState = Math.abs(e.edani);
                                    e.animationState = 0;
                                    e.animationMax = 0;
                                    e.animationMin = e.edgr;
                                    e.animationCycle = e.animationMin-1;

                                }
                                else if (e.edgr > 0) {
                                    e.graphic[0] = e.edgr;
                                    e.animationCycle = 0;
                                    e.animationState = 0;
                                    e.animationMin = 0;
                                }
                                else {
                                    this.registeredEnemies.splice(this.registeredEnemies.findIndex(({name: n}) => n === enemyName), 1)
                                    this.layers[EnemyCodeToLayerMapping[code]].unregisterObject(enemyName);
                                    //todo: explode
                                }

                                if (e.armor > e.edlevel) {
                                    e.armor = e.edlevel;
                                }

                                switch (enemy.size) {
                                    case EnemySize.s1x1:
                                        this.createExplosion(code, enemy.position.x, enemy.position.y-6, 0, 1, false, false);
                                        break;
                                    case EnemySize.s2x2:
                                        this.createLargeExplosion(code, (enemy.explosionType & 1) === 0, enemy.explosionType >> 1,
                                            enemy.position.x, enemy.position.y);
                                        break;
                                }
                            })
                        }
                        Audio.getInstance().enqueue(5, cache.sfx[SFX_CODE.S_ENEMY_HIT]);
                        if (enemy.armor != 255) {
                            enemy.armor -= shot.shotDmg;
                            this.createExplosion(code, shot.position.x-this.layers[EnemyCodeToLayerMapping[code]].parallaxOffset.x, shot.position.y, 0, 0, false, false);
                        }
                        else {
                            //todo: add "superpixels"
                        }
                        this.playerOne.shotRemove(id);
                        this.registeredPlayerShots.splice(i, 1);
                        this.playerLayer.unregisterObject(shotName);
                        shotExpired = true;
                    }
                    //killed
                    else {
                        this.registeredEnemies.filter(({enemy: e, code}) =>
                            e === enemy || (enemy.linknum !== 0
                                && (e.linknum == enemy.linknum
                                || enemy.linknum-100 == e.linknum
                                || (e.linknum > 40 && e.linknum/20 == enemy.linknum/20 && e.linknum <= enemy.linknum))
                            )).forEach(({enemy: e, code, name}) => {
                            if (e.special) {
                                this.state.globalFlags[e.flagnum-1] = e.setto;
                            }
                            if (e.evalue > 0 && e.evalue < 10000) {
                                if (e.evalue == 1) {
                                    this.state.cubeMax++;
                                }
                                else {
                                    this.playerOne.cash += e.evalue;
                                }
                            }
                            if (e.edlevel == -1 && e.linknum == enemy.linknum) {
                                e.edlevel = 0;
                                e.graphic[0] = e.edgr;
                                e.animationCycle = 0;
                                e.animationState = 0;
                                e.animationMax = 0;
                                e.animationMin = 1;
                                e.damaged = true;
                                e.animationCycle = 0;
                            }
                            else {
                                this.registeredEnemies.splice(this.registeredEnemies.findIndex(({name: n}) => n === name), 1)
                                this.layers[EnemyCodeToLayerMapping[code]].unregisterObject(name);
                            }
                            if (e.size == EnemySize.s2x2) {
                                this.createLargeExplosion(code, (e.explosionType & 1) === 0, e.explosionType >> 1, e.position.x, e.position.y);
                                Audio.getInstance().enqueue(6, cache.sfx[SFX_CODE.S_EXPLOSION_9]);
                            }
                            else {
                                this.createExplosion(code, e.position.x, e.position.y, 0, 1, false, false);
                                Audio.getInstance().enqueue(6, cache.sfx[SFX_CODE.S_EXPLOSION_8]);
                            }
                            shot.shotDmg -= e.armor;
                        });
                    }
                }
            }
        }
    }

    private collideEnemiesShots (): void {
        for (let i = this.registeredEnemyShots.length-1; i >= 0; i--) {
            let {shot, name, getBoundingRect, layer} = this.registeredEnemyShots[i];
            if (this.intersects(this.player.getBoundingRect(), getBoundingRect())) {
                this.registeredEnemyShots.splice(i, 1);
                this.layers[layer].unregisterObject(name);
            }
        }
    }

    private intersects (a: Rectangle, b: Rectangle): boolean {
        return Math.max(a.left, b.left) < Math.min(a.right, b.right) &&
               Math.max(a.top, b.top) < Math.min(a.bottom, b.bottom);
    }

    private createExplosion (code: EnemyCode, x: number, y: number, dY: number, type: number, fixed: boolean, followPlayer: boolean) {
        type = type === 98 ? 6 : type;
        let explosion: Explosion = {
            position: {x, y},
            sprite: ExplosionData[type].sprite,
            ttl: ExplosionData[type].ttl,
            followPlayer, fixed,
            dX: 0, dY,
            animationStep: 0,
        }
        this.registeredExplosions.push({code, explosion, ...this.layers[EnemyCodeToLayerMapping[code]].registerExplosion(explosion)});
    }

    private createLargeExplosion (code: EnemyCode, enemyGround: boolean, explosionNum: number, x: number, y: number): void {
        if (enemyGround) {
            this.createExplosion(code, x - 6, y - 7, 0,  2, false, false);
            this.createExplosion(code, x + 6, y - 7, 0,  4, false, false);
            this.createExplosion(code, x - 6, y + 7, 0,  3, false, false);
            this.createExplosion(code, x + 6, y + 7, 0,  5, false, false);
        }
        else {
            this.createExplosion(code, x - 6, y - 7, 0,  7, false, false);
            this.createExplosion(code, x + 6, y - 7, 0,  9, false, false);
            this.createExplosion(code, x - 6, y + 7, 0,  8, false, false);
            this.createExplosion(code, x + 6, y + 7, 0, 10, false, false);
        }
        let big;
        if (explosionNum > 10) {
            explosionNum -= 10;
            big = true;
        }
        else {
            big = false;
        }

        if (explosionNum) {
            this.repetitiveExplosions.push({
                code,
                ttl: explosionNum,
                delay: 2,
                position: {x, y},
                big
            })
        }
    }

    private updateExplosions (step: number): void {
        for (let i = this.repetitiveExplosions.length-1; i >= 0; i--) {
            let repExplosion = this.repetitiveExplosions[i];

            if (repExplosion.delay > 0) {
                repExplosion.delay -= step;
                continue;
            }

            repExplosion.position.y += this.backSpeed[EnemyCodeToLayerMapping[repExplosion.code]]*EnemyCodeAddFixedMoveY[repExplosion.code];
            let tempX = repExplosion.position.x + ((Math.random() * 12 + 0.5)>>0) - 6;
            let tempY = repExplosion.position.y + ((Math.random() * 14 + 0.5)>>0) - 7;

            if (repExplosion.ttl <= 0) {
                this.repetitiveExplosions.splice(i, 1);
                continue;
            }

            if (repExplosion.big) {
                this.createLargeExplosion(repExplosion.code, false, 2, tempX, tempY);

                if (repExplosion.ttl == 1 || ((Math.random() * 5 + 0.5)>>0) == 1) {
                    Audio.getInstance().enqueue(7, cache.sfx[SFX_CODE.S_EXPLOSION_11]);
                }
                else {
                    Audio.getInstance().enqueue(6, cache.sfx[SFX_CODE.S_EXPLOSION_9]);
                }

                repExplosion.delay = 4 + ((Math.random() * 3 + 0.5)>>0);
            }
            else {
                this.createExplosion(repExplosion.code, tempX, tempY, 0, 1, false, false);
                Audio.getInstance().enqueue(5, cache.sfx[SFX_CODE.S_EXPLOSION_4]);

                repExplosion.delay = 3;
            }

            repExplosion.ttl -= step;
        }
        for (let i = this.registeredExplosions.length-1; i >= 0; i--) {
            let {explosion, position, animationStep, name, code} = this.registeredExplosions[i];

            position.copyFrom(explosion.position);
            animationStep.x = explosion.animationStep+1;

            if (!explosion.fixed) {
                explosion.animationStep += step;
            }
            if (explosion.followPlayer) {
                //todo: follow player
            }
            explosion.position.y += step*(this.backSpeed[EnemyCodeToLayerMapping[code]]*EnemyCodeAddFixedMoveY[code]);
            explosion.position.x += step*explosion.dX;
            explosion.position.y += step*explosion.dY;

            explosion.ttl -= step;

            if (explosion.ttl < 0) {
                this.registeredExplosions.splice(i, 1);
                this.layers[EnemyCodeToLayerMapping[code]].unregisterObject(name);
            }
        }
    }
}
