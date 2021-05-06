import {EnemyCreate} from "./events/EnemyCreate";
import {World} from "./World";
import {COMP_TILE_HEIGHT, COMP_TILE_WIDTH, TyEnemy, TyEventType} from "../Structs";
import {IEnemy, EnemyRegistered, EnemyShot, LayerCode, IWorldObject} from "./Types";
import {EnemiesGlobalMove} from "./events/EnemiesGlobalMove";
import {EnemiesGlobalAnimate} from "./events/EnemiesGlobalAnimate";
import {Player} from "./Player";
import {Audio} from "../Audio";
import {cache} from "../Resources";
import {EnemySpecialAssign} from "./events/EnemySpecialAssign";
import {Enemy} from "./Enemy";

export enum EnemyCode {
    GND_25 = 25,
    GND_75 = 75,
    SKY_0 = 0,
    TOP_50 = 50,
}

export const EnemyCodeToLayerMapping = {
    [EnemyCode.GND_25]: LayerCode.GND,
    [EnemyCode.GND_75]: LayerCode.GND,
    [EnemyCode.SKY_0]: LayerCode.SKY,
    [EnemyCode.TOP_50]: LayerCode.TOP
}

const EventTypeToCodeMapping = {
    [TyEventType.ENEMY_CREATE_TOP_50]: EnemyCode.TOP_50,
    [TyEventType.ENEMY_CREATE_GROUND_25]: EnemyCode.GND_25,
    [TyEventType.ENEMY_CREATE_GROUND_75]: EnemyCode.GND_75,
    [TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25]: EnemyCode.GND_25,
    [TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75]: EnemyCode.GND_75,
    [TyEventType.ENEMY_CREATE_SKY_0]: EnemyCode.SKY_0,
    [TyEventType.ENEMY_CREATE_SKY_BOTTOM_0]: EnemyCode.SKY_0,
    [TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_1]: EnemyCode.TOP_50,
    [TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_2]: EnemyCode.TOP_50,
    [TyEventType.ENEMY_CREATE_0]: EnemyCode.GND_25,
    [TyEventType.ENEMY_CREATE_1]: EnemyCode.SKY_0,
    [TyEventType.ENEMY_CREATE_2]: EnemyCode.TOP_50,
    [TyEventType.ENEMY_CREATE_3]: EnemyCode.GND_75
}

const LayerAddFixedMoveY = {
    [EnemyCode.SKY_0]: 0,
    [EnemyCode.GND_25]: 1,
    [EnemyCode.TOP_50]: 1,
    [EnemyCode.GND_75]: 1
}

const Enemy4x4TileOffsets = [
    {x: 0, y: 0},
    {x: COMP_TILE_WIDTH*2, y: 0},
    {x: 0, y: -COMP_TILE_HEIGHT*2},
    {x: COMP_TILE_WIDTH*2, y: -COMP_TILE_HEIGHT*2}
];

export function enemyCreate (this: World, {e}: EnemyCreate): void {
    if (e.type in EventTypeToCodeMapping) {
        let enemy: IEnemy = new Enemy(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos),
            code: EnemyCode = EventTypeToCodeMapping[<keyof typeof EventTypeToCodeMapping>e.type];
        switch (e.type) {
            case TyEventType.ENEMY_CREATE_TOP_50: {
                enemy.position.y += -32-this.backSpeed[EnemyCodeToLayerMapping[code]];
            } break;
            case TyEventType.ENEMY_CREATE_GROUND_25: {
                enemy.position.x += 30;
                enemy.position.y += -32-this.backSpeed[EnemyCodeToLayerMapping[code]];
            } break;
            case TyEventType.ENEMY_CREATE_GROUND_75: {
                enemy.position.x += 30;
                enemy.position.y += -32-this.backSpeed[EnemyCodeToLayerMapping[code]];
            } break;
            case TyEventType.ENEMY_CREATE_SKY_0: {
                enemy.position.x += 54;
                enemy.position.y += -this.backSpeed[EnemyCodeToLayerMapping[code]];
            } break;
            case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25: {
                enemy.position.x += 30;
                enemy.position.y += 190;
            } break;
            case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75: {
                enemy.position.x += 30;
                enemy.position.y += 190;
            } break;
            case TyEventType.ENEMY_CREATE_SKY_BOTTOM_0: {
                enemy.position.x += 54;
                enemy.position.y = 190 + e.data5;
            } break;
            case TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_1: {
                enemy.position.y = 180 + e.data5;
            } break;
            case TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_2: {
                enemy.position.y = 190;
            } break;
            case TyEventType.ENEMY_CREATE_0:
            case TyEventType.ENEMY_CREATE_1:
            case TyEventType.ENEMY_CREATE_2:
            case TyEventType.ENEMY_CREATE_3: {
                enemy.position.x += 54;
                enemy.position.y += e.data5;
            } break;
        }
        this.registeredEnemies.push({code, enemy, ...this.layers[EnemyCodeToLayerMapping[code]].registerEnemy(enemy)});
    }
    else if (e.type == TyEventType.ENEMY_CREATE_4x4) {
        let code = EnemyCode.GND_25;
        switch (e.data6) {
            case 1: code = EnemyCode.GND_25; break;
            case 2: code = EnemyCode.SKY_0; break;
            case 3: code = EnemyCode.TOP_50; break;
            case 4: code = EnemyCode.GND_75; break;
        }
        this.registeredEnemies.push(...Enemy4x4TileOffsets.map((ep4x4, typeOffset) => {
            let enemy = new Enemy(e, this.items.enemies[e.data1+typeOffset], this.state.enemySmallAdjustPos);
            enemy.position.x += 30+ep4x4.x;
            enemy.position.y += -32+ep4x4.y-this.backSpeed[EnemyCodeToLayerMapping[code]];
            return {code, enemy, ...this.layers[EnemyCodeToLayerMapping[code]].registerEnemy(enemy)};
        }));
    }
    else {
        console.error(`unhandled enemy create event of type "${e.type}"`)
    }

}

export function updateEnemies (this: World, step: number, playerOne: Player): void {
    for (let i = this.registeredEnemies.length-1; i >= 0; i--) {
        let {enemy, name, position, animationStep, code} = this.registeredEnemies[i];

        updateSpeed(playerOne, enemy, step);
        updateAnimationCycle(enemy, step);

        //position
        enemy.position.x += step*enemy.exc;
        enemy.position.y += step*(enemy.eyc+enemy.fixedMoveY+LayerAddFixedMoveY[code]*this.backSpeed[EnemyCodeToLayerMapping[code]]);

        //cleanup objects
        let readyToGC = !this.gcBox.contains(enemy.position.x, enemy.position.y)
            || enemy.graphic[enemy.animationCycle>>0] == 999;

        if (readyToGC) {
            this.registeredEnemies.splice(i, 1);
            this.layers[EnemyCodeToLayerMapping[code]].unregisterObject(name);
            continue;
        }

        //bounces
        if (enemy.position.x <= enemy.xMinBounce || enemy.position.x >= enemy.xMaxBounce) {
            enemy.exc = -enemy.exc;
        }

        if (enemy.position.y <= enemy.yMinBounce || enemy.position.y >= enemy.yMaxBounce) {
            enemy.eyc = -enemy.eyc;
        }

        //keep score item
        if (enemy.isScoreItem) {
            if (enemy.position.x < -5) {
                enemy.position.x++;
            }
            if (enemy.position.x > 245) {
                enemy.position.x--;
            }
        }

        //skip invisible enemies
        if (!this.actionRect.contains(enemy.position.x, enemy.position.y)) {
            continue;
        }

        position.copyFrom(enemy.position);
        animationStep.set(enemy.animationCycle>>0, 0);

        this.registeredEnemyShots.push(...this.enemyShotsCreate(step, enemy, playerOne).map(shot => ({
            shot, layer: EnemyCodeToLayerMapping[code], ...this.layers[EnemyCodeToLayerMapping[code]].registerShot(shot)
        })));
        let launchedEnemy = this.enemyLaunch(step, enemy, playerOne);
        if (launchedEnemy) {
            let launchedEnemyCode: EnemyCode = code == 25 ? 50 : code;
            this.registeredEnemies.push({
                code: launchedEnemyCode,
                enemy: launchedEnemy,
                ...this.layers[EnemyCodeToLayerMapping[launchedEnemyCode]].registerEnemy(launchedEnemy)
            });
        }
    }
}

function updateAnimationCycle (enemy: IEnemy, step: number) {
    if (enemy.animationState == 1) {
        enemy.animationCycle += step;

        if (enemy.animationCycle>>0 == enemy.animationMax) {
            enemy.animationState = 2;//pause or ready to fire?
            return;
        }
        if (enemy.animationCycle > enemy.shapesLength-1) {
            enemy.animationCycle = enemy.animationMin;
        }
    }
}

function updateSpeed (player: Player, enemy: IEnemy, step: number) {
    if (enemy.xAccel && enemy.xAccel - 89 > (11*Math.random())>>0) {
        if (player.position.x > enemy.position.x) {
            if (enemy.exc < enemy.xAccel - 89) {
                enemy.exc += step;
            }
        }
        else {
            if (enemy.exc >= 0 || -enemy.exc < enemy.xAccel - 89) {
                enemy.exc -= step;
            }
        }
    }

    if (enemy.yAccel && enemy.yAccel - 89 > (11*Math.random())>>0) {
        if (player.position.y > enemy.position.y) {
            if (enemy.eyc < enemy.yAccel - 89) {
                enemy.eyc += step;
            }
        }
        else {
            if (enemy.eyc >= 0 || -enemy.eyc < enemy.yAccel - 89) {
                enemy.eyc -= step;
            }
        }
    }

    if (enemy.excc) {
        enemy.exccw -= step;
        if (enemy.exccw <= 0) {
            enemy.exc += step*Math.sign(enemy.excc);
            enemy.exccw = enemy.exccwmax;
            if (Math.abs(enemy.exc) >= Math.abs(enemy.exrev)) {
                enemy.excc = -Math.abs(enemy.exrev)*Math.sign(enemy.excc);
            }
        }
    }

    if (enemy.eycc) {
        enemy.eyccw -= step;
        if (enemy.eyccw <= 0) {
            enemy.eyc += step*Math.sign(enemy.eycc);
            enemy.eyccw = enemy.eyccwmax;
            if (Math.abs(enemy.eyc) >= Math.abs(enemy.eyrev)) {
                enemy.eycc = -Math.abs(enemy.eyrev)*Math.sign(enemy.eycc);
            }
        }
    }
}

export function enemiesGlobalMove (this: World, e: EnemiesGlobalMove): void {
    switch (e.e.type) {
        case TyEventType.ENEMIES_GLOBAL_MOVE_0: {
            let enemies: EnemyRegistered[] = [];

            switch (true) {
                case e.e.data3 > 79 && e.e.data3 < 90:
                    //enemies = registeredEnemies.filter(by => by.enemy.linknum == e.e.data3 - 80);
                    console.info('ENEMIES_GLOBAL_MOVE_0 ignored')
                    break;
                case e.e.data3 == 0:
                    enemies = this.registeredEnemies.filter(by => by.enemy.linknum == e.e.data4);
                    break;
                case e.e.data3 == 2:
                    enemies = this.registeredEnemies.filter(by => by.code == EnemyCode.SKY_0);
                    break;
                case e.e.data3 == 1:
                    enemies = this.registeredEnemies.filter(by => by.code == EnemyCode.GND_25);
                    break;
                case e.e.data3 == 3:
                    enemies = this.registeredEnemies.filter(by => by.code == EnemyCode.TOP_50);
                    break;
                case e.e.data3 == 99:
                    enemies = this.registeredEnemies;
                    break;
                default:
                    console.warn('unhandled move', e);
                    break;
            }

            enemies.forEach(en => {
                if (e.e.data1 != -99) {
                    en.enemy.exc = e.e.data1;
                }
                if (e.e.data2 != -99) {
                    en.enemy.eyc = e.e.data2;
                }
                if (e.e.data6 != 0) {
                    en.enemy.fixedMoveY = e.e.data6;
                }
                if (e.e.data6 == -99) {
                    en.enemy.fixedMoveY = 0;
                }
                if (e.e.data5 > 0) {
                    en.enemy.animationCycle = e.e.data5-1;
                }
            })

        } break;
        case TyEventType.ENEMIES_GLOBAL_MOVE_1: {
            if (e.e.data3 > 79 && e.e.data3 < 90) {
                //todo: after implementation of EnemiesMoveOverride
                console.info("ENEMIES_GLOBAL_MOVE_1 ignored")
                break;
            }
            this.registeredEnemies
                .filter(by => e.e.data4 == 0 || by.enemy.linknum == e.e.data4)
                .forEach(en => {
                    if (e.e.data1 != -99) {
                        en.enemy.excc = e.e.data1;
                        en.enemy.exccw = Math.abs(e.e.data1);
                        en.enemy.exccwmax = Math.abs(e.e.data1);
                    }

                    if (e.e.data2 != -99) {
                        en.enemy.eycc = e.e.data2;
                        en.enemy.eyccw = Math.abs(e.e.data2);
                        en.enemy.eyccwmax = Math.abs(e.e.data2);
                    }

                    if (e.e.data5 > 0) {
                        en.enemy.animationCycle = e.e.data5-1;
                    }

                    if (e.e.data6 > 0) {
                        en.enemy.shapesLength = e.e.data6;
                        en.enemy.animationMin = e.e.data5;
                        en.enemy.animationMax = -1;
                        en.enemy.animationState = 1;
                    }
                });

        } break;
        case TyEventType.ENEMIES_GLOBAL_MOVE_2: {
            if (e.e.data3 > 79 && e.e.data3 < 90) {
                //todo: after implementation of EnemiesMoveOverride
                console.info("ENEMIES_GLOBAL_MOVE_2 ignored")
                break;
            }
            this.registeredEnemies
                .filter(by => e.e.data4 == 0 || by.enemy.linknum == e.e.data4)
                .forEach(en => {
                    if (e.e.data1 != -99) {
                        en.enemy.exrev = e.e.data1;
                    }
                    if (e.e.data2 != -99) {
                        en.enemy.eyrev = e.e.data2;
                    }
                    if (e.e.data3 > 0 && e.e.data3 < 17) {//todo: add filters in rendering
                        en.enemy.filter = e.e.data3;
                    }
                })
        } break;
        case TyEventType.ENEMIES_GLOBAL_MOVE_3: {
            if (e.e.data3 > 79 && e.e.data3 < 90) {
                //todo: after implementation of EnemiesMoveOverride
                console.info("ENEMIES_GLOBAL_MOVE_3 ignored")
                break;
            }
            this.registeredEnemies
                .filter(by => e.e.data4 == 0 || by.enemy.linknum == e.e.data4)
                .forEach(en => {
                    if (e.e.data1 != -99) {
                        en.enemy.xAccel = e.e.data1;
                    }
                    if (e.e.data2 != -99) {
                        en.enemy.yAccel = e.e.data2;
                    }
                })
        } break;
        case TyEventType.ENEMIES_GLOBAL_MOVE_4: {
            this.registeredEnemies
                .filter(by => e.e.data4 == 0 || by.enemy.linknum == e.e.data4)
                .forEach(en => {
                    if (e.e.data5 != -99) {
                        en.enemy.xMinBounce = e.e.data5;
                    }
                    if (e.e.data6 != -99) {
                        en.enemy.yMinBounce = e.e.data6;
                    }
                    if (e.e.data1 != -99) {
                        en.enemy.xMaxBounce = e.e.data1;
                    }
                    if (e.e.data2 != -99) {
                        en.enemy.yMaxBounce = e.e.data2;
                    }
                })
        } break;
    }
}

export function enemiesAnimate (this: World, e: EnemiesGlobalAnimate) {
    this.registeredEnemies
        .filter(by => by.enemy.linknum == e.e.data4)
        .forEach(en => {
            en.enemy.animationState = 1;
            if (e.e.data2 > 0) {
                en.enemy.animationCycle = e.e.data2-1;
                en.enemy.animationMin = e.e.data2-1;
            }
            else {
                en.enemy.animationCycle = 0;
            }
            if (e.e.data1 > 0) {
                en.enemy.shapesLength = e.e.data1;
            }
            if (e.e.data3 == 1) {
                en.enemy.animationMax = en.enemy.shapesLength-1;
            }
            if (e.e.data3 == 2) {
                en.enemy.animationState = 2;
                en.enemy.animationMax = en.enemy.shapesLength-1;
            }
        })
}

export function hasRegisteredEnemies (this: World): boolean {
    return this.registeredEnemies.length > 0;
}

export function updateEnemiesShots (this: World, step: number, playerOne: Player): void {
    for (let i = this.registeredEnemyShots.length-1; i >= 0; i--) {
        let {shot, name, layer, animationStep, position} = this.registeredEnemyShots[i];
        shot.sxm += step*shot.sxc;
        shot.position.x += step*shot.sxm;
        if (shot.tx != 0) {
            if (shot.position.x > playerOne.position.x && shot.sxm > -shot.tx) {
                shot.sxm -= step;
            }
            else if (shot.sxm < shot.tx) {
                shot.sxm += step;
            }
        }
        shot.sym += step*shot.syc;
        shot.position.y += step*shot.sym;
        if (shot.ty != 0) {
            if (shot.position.y > playerOne.position.y && shot.sym > -shot.ty) {
                shot.sym -= step;
            }
            else if (shot.sym < shot.ty) {
                shot.sym += step;
            }
        }
        let readyToGC = shot.duration-- <= 0
            || !this.gcBox.contains(shot.position.x, shot.position.y);
        if (readyToGC) {
            this.registeredEnemyShots.splice(i, 1);
            this.layers[layer].unregisterObject(name);
        }

        if (playerOne.hitArea.contains(shot.position.x, shot.position.y)) {
            //todo: collision
            this.registeredEnemyShots.splice(i, 1);
            this.layers[layer].unregisterObject(name);
        }

        if (shot.animax != 0) {
            shot.animationCycle += step;
            if (shot.animationCycle >= shot.animax) {
                shot.animationCycle = 0;
            }
            animationStep.x = shot.animationCycle;
        }
        position.copyFrom(shot.position);
    }
}

export function getClosestEnemy(this: World, position: {x: number, y: number}): IWorldObject | undefined {
    let found: IWorldObject | undefined;
    let dist = 1<<10;
    for (let i = 0, l = this.registeredEnemies.length; i < l; i++) {
        if (!this.registeredEnemies[i].enemy.isScoreItem) {
            let d = Math.abs(this.registeredEnemies[i].position.x - position.x) + Math.abs(this.registeredEnemies[i].position.y - position.y);
            if (d < dist) {
                found = this.registeredEnemies[i];
            }
        }
    }
    return found;
}

export function enemyShotsCreate (this: World, step: number, enemy: IEnemy, playerOne: Player): EnemyShot[] {
    return enemy.freq.filter(by => by > 0).map((v, i) => {
        let tur = enemy.tur[i];
        enemy.shotWait[i] -= step;
        if (enemy.shotWait[i] > 0 || tur == 0) {
            return [];
        }
        enemy.shotWait[i] = enemy.freq[i];
        let shots: EnemyShot[] = [];
        switch (tur) {
            //todo: magnet
            case 255: // Magneto RePulse!!
            case 254: // Left ShortRange Magnet
                break;
            case 253: // Left ShortRange Magnet
                break;
            case 252: // Savara Boss DualMissile
                break;
            case 251: // Suck-O-Magnet
                break;
            default:
                for (let c = this.items.weapons[tur].multi; c > 0; c--) {

                    if (enemy.animationState == 2) {
                        enemy.animationState = 1;
                    }

                    if (++enemy.shotMultiPos[i] > this.items.weapons[tur].max) {
                        enemy.shotMultiPos[i] = 1;
                    }

                    let shotParams: {sxc: number, syc: number, sxm: number, sym: number} = {
                        syc: 0, sxc: 0, sym: 0, sxm: 0
                    };
                    let tempPos = enemy.shotMultiPos[i] - 1;
                    switch (i) {
                        case 0:
                            shotParams.syc = this.items.weapons[tur].accelerationY;
                            shotParams.sxc = this.items.weapons[tur].accelerationX;

                            shotParams.sxm = this.items.weapons[tur].sx[tempPos];
                            shotParams.sym = this.items.weapons[tur].sy[tempPos];
                            break;
                        case 1:
                            shotParams.sxc = this.items.weapons[tur].accelerationY;
                            shotParams.syc = -this.items.weapons[tur].accelerationY;

                            shotParams.sxm = this.items.weapons[tur].sy[tempPos];
                            shotParams.sym = this.items.weapons[tur].sx[tempPos];
                            break;
                        case 2:
                            shotParams.sxc = -this.items.weapons[tur].accelerationY;
                            shotParams.syc = this.items.weapons[tur].accelerationX;

                            shotParams.sxm = -this.items.weapons[tur].sy[tempPos];
                            shotParams.sym = -this.items.weapons[tur].sx[tempPos];
                            break;
                    }

                    let shot: EnemyShot = {
                        position: {
                            x: enemy.position.x + this.items.weapons[tur].bx[tempPos]+6,
                            y: enemy.position.y + this.items.weapons[tur].by[tempPos]+7,
                        },
                        shapeBank: this.items.weapons[tur].sg[tempPos] >= 500
                            ? 12
                            : 7,
                        graphic: [this.items.weapons[tur].sg[tempPos] >= 500
                            ? this.items.weapons[tur].sg[tempPos]-500
                            : this.items.weapons[tur].sg[tempPos]],
                        animationCycle: 0,
                        sdmg: this.items.weapons[tur].attack[tempPos],
                        tx: this.items.weapons[tur].tx,
                        ty: this.items.weapons[tur].ty,
                        duration: this.items.weapons[tur].delay[tempPos],
                        animax: this.items.weapons[tur].animation,
                        fill: [],
                        ...shotParams,
                    }

                    if (this.items.weapons[tur].aim > 0) {
                        let aim = this.items.weapons[tur].aim;

                        let target_x = playerOne.position.x;
                        let target_y = playerOne.position.y;

                        let relative_x = (target_x + 21) - enemy.position.x;
                        if (relative_x == 0) {
                            relative_x = 1;
                        }
                        let relative_y = target_y - enemy.position.y;
                        if (relative_y == 0) {
                            relative_y = 1;
                        }
                        const longest_side = Math.max(Math.abs(relative_x), Math.abs(relative_y));
                        shot.sxm = relative_x / longest_side * aim;
                        shot.sym = relative_y / longest_side * aim;
                    }
                    shots.push(shot);

                    if (this.items.weapons[tur].sound > 0) {
                        let channel = 0;
                        do {
                            channel = Math.random()*8+0.5 >> 0;
                        } while (channel == 3)
                        Audio.getInstance().enqueue(channel, cache.sfx[this.items.weapons[tur].sound-1]);
                    }
                }
                break;
        }
        return shots;
    }).flat();
}

export function enemyLaunch (this: World, step: number, enemy: IEnemy, playerOne: Player): IEnemy | undefined {
    if (!enemy.launchFreq || !enemy.launchType) {
        return;
    }
    enemy.launchWait -= step;
    if (enemy.launchWait > 0) {
        return;
    }
    enemy.launchWait = enemy.launchFreq;

    if (enemy.launchSpecial != 0 && Math.abs(enemy.position.y - playerOne.position.y) > 5) {
        /*Type  1 : Must be inline with player*/
        return;
    }

    if (enemy.animationState == 2) {
        enemy.animationState = 1;
    }

    let type = enemy.launchType;
    let launchedEnemy = new Enemy({data2: 0, data3: 0, data4: 0, data5: 0, data6: 0}, this.items.enemies[type], this.state.enemySmallAdjustPos);

    launchedEnemy.position.x = enemy.position.x + this.items.enemies[type].xcStart;
    launchedEnemy.position.y = enemy.position.y + this.items.enemies[type].ycStart;
    if (launchedEnemy.size == 0) {
        launchedEnemy.position.y -= 7;
    }

    if (launchedEnemy.launchType > 0 && launchedEnemy.launchFreq == 0) {
        if (launchedEnemy.launchType > 90) {
            launchedEnemy.position.x += (Math.random()*(launchedEnemy.launchType - 90)*2)>>0;
        }
        else {
            let target_x = playerOne.position.x - launchedEnemy.position.x;
            let target_y = playerOne.position.y - launchedEnemy.position.y;
            const longest_side = Math.max(Math.abs(target_x), Math.abs(target_y));
            launchedEnemy.exc = Math.round(target_x/longest_side*launchedEnemy.launchType);
            launchedEnemy.eyc = Math.round(target_y/longest_side*launchedEnemy.launchType);
        }
    }

    if (enemy.launchSpecial == 1 && enemy.linknum < 100) {
        launchedEnemy.linknum = enemy.linknum;
    }
    return launchedEnemy;
}

export function enemySpecialAssign (this: World,e: EnemySpecialAssign) {
    this.registeredEnemies
        .filter(({enemy}) => enemy.linknum == e.e.data4)
        .forEach(({enemy}) => {
            enemy.special = true;
            enemy.flagnum = e.e.data1;
            enemy.setto = e.e.data2 == 1;
        })
}
