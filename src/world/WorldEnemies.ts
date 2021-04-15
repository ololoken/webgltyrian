import {EnemyCreate} from "./events/EnemyCreate";
import {World} from "./World";
import {TyEventType} from "./EventMappings";
import {COMP_TILE_HEIGHT, COMP_TILE_WIDTH, TyEnemy} from "../Structs";
import {Enemy, EnemyShot, LayerCode, WorldObject} from "./Types";
import {EnemiesGlobalMove} from "./events/EnemiesGlobalMove";
import {EnemiesGlobalAnimate} from "./events/EnemiesGlobalAnimate";
import {Player} from "./Player";

export enum EnemyCode {
    GND_25 = 25,
    GND_75 = 75,
    SKY_0 = 0,
    TOP_50 = 50,
}

//const registeredEnemies: (WorldObject & {enemy: Enemy, layer: LayerCode, code: EnemyCode})[] = [];
const ENEMY_SHOT_MAX = 60;
//const

const EnemyCodeToLayer = {
    [EnemyCode.GND_25]: LayerCode.GND,
    [EnemyCode.GND_75]: LayerCode.GND,
    [EnemyCode.SKY_0]: LayerCode.SKY,
    [EnemyCode.TOP_50]: LayerCode.TOP
}

const EventTypeToLayerMapping = {
    [TyEventType.ENEMY_CREATE_TOP_50]: LayerCode.TOP,
    [TyEventType.ENEMY_CREATE_GROUND_25]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_GROUND_75]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_GROUND_4x4]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_SKY_0]: LayerCode.SKY,
    [TyEventType.ENEMY_CREATE_SKY_BOTTOM_0]: LayerCode.SKY,
    [TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_1]: LayerCode.TOP,
    [TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_2]: LayerCode.TOP,
    [TyEventType.ENEMY_CREATE_0]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_1]: LayerCode.SKY,
    [TyEventType.ENEMY_CREATE_2]: LayerCode.TOP,
    [TyEventType.ENEMY_CREATE_3]: LayerCode.GND
}

const Enemy4x4LayerMapping: LayerCode[] = [
    LayerCode.GND,//0
    LayerCode.GND,//1
    LayerCode.SKY,//2
    LayerCode.TOP,//3
    LayerCode.GND,//4
];

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

function fillEnemyData (eventData: {data2: number, data3: number, data4: number, data5: number, data6: number},
                        enemyDesc: TyEnemy, enemySmallAdjustPos: boolean): Enemy {
    const animationTypes = [
        {cycle: 0, state: 0, max: -1},
        {cycle: 0, state: 1, max: -1},
        {cycle: 0, state: 2, max: enemyDesc.shapesLength-1},
    ];
    const toWait = (tur: number): number => {
        switch (true) {
            case tur == 252: return 1;
            case tur > 0: return 20;
            default: return 255;
        }
    }
    let enemy: Enemy = {
        shapesLength: enemyDesc.shapesLength,
        shapeBank: enemyDesc.shapeBank,
        explosionType: enemyDesc.explosionType,
        launchFreq: enemyDesc.eLaunchFreq,
        launchWait: enemyDesc.eLaunchFreq,
        shotWait: [toWait(enemyDesc.tur[0]), toWait(enemyDesc.tur[1]), toWait(enemyDesc.tur[2])],
        shotMultiPos: [0, 0, 0],
        launchType: enemyDesc.eLaunchType % 1000,
        launchSpecial: enemyDesc.eLaunchType / 1000,
        xAccel: enemyDesc.xAccel,
        yAccel: enemyDesc.yAccel,
        xMinBounce: -Number.MAX_SAFE_INTEGER,
        yMinBounce: -Number.MAX_SAFE_INTEGER,
        xMaxBounce: Number.MAX_SAFE_INTEGER,
        yMaxBounce: Number.MAX_SAFE_INTEGER,
        tur: [enemyDesc.tur[0], enemyDesc.tur[1], enemyDesc.tur[2]],
        animationState: animationTypes[enemyDesc.animationType].state,
        animationCycle: animationTypes[enemyDesc.animationType].cycle,
        animationMax: animationTypes[enemyDesc.animationType].max,
        animationMin: 0,
        position: {
            x: enemyDesc.xStart + (2 * Math.random() * enemyDesc.xcStart >> 0) - enemyDesc.xcStart + 1,
            y: enemyDesc.yStart + (2 * Math.random() * enemyDesc.ycStart >> 0) - enemyDesc.ycStart + 1,
        },
        exc: enemyDesc.xMove,
        eyc: enemyDesc.yMove,
        excc: enemyDesc.xcAccel,
        eycc: enemyDesc.ycAccel,
        special: false,
        iced: 0,
        exrev: enemyDesc.xRev,
        eyrev: enemyDesc.yRev,
        graphic: enemyDesc.eGraphic,
        size: enemyDesc.eSize,
        linknum: eventData.data4,
        damaged: enemyDesc.dAnimation < 0,
        enemydie: enemyDesc.eEnemyDie,
        freq: [enemyDesc.freq[0], enemyDesc.freq[1], enemyDesc.freq[2]],
        edani: enemyDesc.dAnimation,
        edgr: enemyDesc.dgr,
        edlevel: enemyDesc.dLevel,
        fixedMoveY: eventData.data6,
        filter: 0x00,
        evalue: enemyDesc.value,
        armor: enemyDesc.armor,
        isScoreItem: enemyDesc.armor <= 0,

        exccw: Math.abs(enemyDesc.xcAccel), eyccw: Math.abs(enemyDesc.ycAccel), //acceleration change wait time current value
        exccwmax: Math.abs(enemyDesc.xcAccel), eyccwmax: Math.abs(enemyDesc.ycAccel), //wait time
    }

    if (eventData.data2 !== -99) {
        enemy.position.x = eventData.data2;
        enemy.position.y = -28;
    }

    if (enemy.size == 0 && enemySmallAdjustPos) {
        enemy.position.x -= 10;
        enemy.position.y -= 7;
    }

    enemy.position.y += eventData.data5;
    enemy.eyc += eventData.data3;



    switch (enemy.exrev) {
        case -99: enemy.exrev = 0; break;
        case 0: enemy.exrev = 100; break;
    }

    switch (enemy.eyrev) {
        case -99: enemy.eyrev = 0; break;
        case 0: enemy.eyrev = 100; break;
    }

    return enemy;
}

export function enemyCreate (this: World, {e}: EnemyCreate): void {
    switch (e.type) {
        case TyEventType.ENEMY_CREATE_TOP_50: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos);
            enemy.position.y += -32-this.backSpeed[layer];
            this.registeredEnemies.push({code: EnemyCode.TOP_50, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_GROUND_25: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos);
            enemy.position.x += 30;
            enemy.position.y += -32-this.backSpeed[layer];
            this.registeredEnemies.push({code: EnemyCode.GND_25, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_GROUND_75: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos);
            enemy.position.x += 30;
            enemy.position.y += -32-this.backSpeed[layer];
            this.registeredEnemies.push({code: EnemyCode.GND_75, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_SKY_0: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos);
            enemy.position.x += 54;
            enemy.position.y += -this.backSpeed[layer];
            this.registeredEnemies.push({code: EnemyCode.SKY_0, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_GROUND_4x4: {
            let layer = Enemy4x4LayerMapping[e.data6];
            let code = EnemyCode.GND_25;
            switch (e.data6) {
                case 1: code = EnemyCode.GND_25; break;
                case 2: code = EnemyCode.SKY_0; break;
                case 3: code = EnemyCode.TOP_50; break;
                case 4: code = EnemyCode.GND_75; break;
            }
            Enemy4x4TileOffsets.forEach((ep4x4, typeOffset) => {
                let enemy = fillEnemyData(e, this.items.enemies[e.data1+typeOffset], this.state.enemySmallAdjustPos);
                enemy.position.x += 30+ep4x4.x;
                enemy.position.y += -32+ep4x4.y-this.backSpeed[layer];
                this.registeredEnemies.push({code, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
            });
        } break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos);
            enemy.position.x += 30;
            enemy.position.y += 190;
            this.registeredEnemies.push({code: EnemyCode.GND_25, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos);
            enemy.position.x += 30;
            enemy.position.y += 190;
            this.registeredEnemies.push({code: EnemyCode.GND_75, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_0: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos);
            enemy.position.x += 54;
            enemy.position.y = 190 + e.data5;
            this.registeredEnemies.push({code: EnemyCode.SKY_0, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_1: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos);
            enemy.position.x += 54;
            enemy.position.y = 180 + e.data5;
            this.registeredEnemies.push({code: EnemyCode.TOP_50, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_TOP_BOTTOM_50_2: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1], this.state.enemySmallAdjustPos);
            enemy.position.x += 54;
            enemy.position.y = 190;
            this.registeredEnemies.push({code: EnemyCode.TOP_50, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_ARCADE: break;
        case TyEventType.ENEMY_CREATE_0:
        case TyEventType.ENEMY_CREATE_1:
        case TyEventType.ENEMY_CREATE_2:
        case TyEventType.ENEMY_CREATE_3: {
            console.info(`event ignored ${JSON.stringify(e)}`);
            //let layer = EventTypeToLayerMapping[e.type];
            //let enemy = fillEnemyData({...e, data3: 0, data6: 0}, this.items.enemies[e.data3]);
            //registeredEnemies.push({code: 0, enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
    }

}

export function enemiesUpdate (this: World, step: number): void {
    for (let i = 0, l = this.registeredEnemies.length; i < l; i++) {
        let {enemy, layer, name, position, animationStep, code} = this.registeredEnemies[i];

        updateSpeed(this.playerOne, enemy, step);
        updateAnimationCycle(enemy, step);

        //position
        enemy.position.x += step*enemy.exc;
        enemy.position.y += step*(enemy.eyc+enemy.fixedMoveY+LayerAddFixedMoveY[code]*this.backSpeed[layer]);

        //cleanup objects
        let readyToGC = !this.gcBox.contains(enemy.position.x, enemy.position.y)
            || enemy.graphic[enemy.animationCycle>>0] == 999;

        if (readyToGC) {
            this.registeredEnemies.splice(i--, 1);
            l--;
            this.layers[layer].unregisterObject(name);
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

        enemy.freq.forEach((v, i) => {
            if (v) {
                let tur = enemy.tur[i];
                if (--enemy.shotWait[i] == 0 && tur) {
                    enemy.shotWait[i] = enemy.freq[i];

                    switch (tur) {
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

                                if (++enemy.shotMultiPos[i] > this.items.weapons[tur].max)
                                    enemy.shotMultiPos[i] = 1;

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
                                        x: enemy.position.x + this.items.weapons[tur].bx[tempPos],
                                        y: enemy.position.y + this.items.weapons[tur].by[tempPos],
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

                                    let target_x = this.playerOne.position.x;
                                    let target_y = this.playerOne.position.y;

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
                                this.registeredEnemyShots.push({shot, layer, ...this.layers[layer].registerShot(shot)});
                            }
                            break;
                    }
                }
            }
        })

        if (enemy.launchFreq) {
            if (--enemy.launchWait <= 0) {
                enemy.launchWait = enemy.launchFreq;

                if (enemy.launchSpecial != 0) {
                    /*Type  1 : Must be inline with player*/
                    if (Math.abs(enemy.position.y - this.playerOne.position.y) > 5) {
                        continue;
                    }
                }

                if (enemy.animationState == 2) {
                    enemy.animationState = 1;
                }

                if (enemy.launchType == 0) {
                    continue;
                }

                let type = enemy.launchType;
                let shot = fillEnemyData({data2: 0, data3: 0, data4: 0, data5: 0, data6: 0}, this.items.enemies[type], this.state.enemySmallAdjustPos);
                //b = JE_newEnemy(code == 50 ? 75 : enemyOffset - 25, tempW, 0);

                shot.position.x = enemy.position.x + this.items.enemies[type].xcStart;
                shot.position.y = enemy.position.y + this.items.enemies[type].ycStart;
                if (shot.size == 0) {
                    shot.position.y -= 7;
                }

                if (shot.launchType > 0 && shot.launchFreq == 0) {
                    if (shot.launchType > 90) {
                        shot.position.x += (Math.random()*(shot.launchType - 90)*2)>>0;
                    }
                    else {
                        let target_x = this.playerOne.position.x - shot.position.x;
                        let target_y = this.playerOne.position.y - shot.position.y;
                        const longest_side = Math.max(Math.abs(target_x), Math.abs(target_y));
                        shot.exc = Math.round(target_x/longest_side*shot.launchType);
                        shot.eyc = Math.round(target_y/longest_side*shot.launchType);
                    }
                }

                if (enemy.launchSpecial == 1 && enemy.linknum < 100) {
                    shot.linknum = enemy.linknum;
                }
                let shotCode: EnemyCode = code == 25 ? 50 : code;
                let shotLayer: LayerCode = EnemyCodeToLayer[shotCode];
                this.registeredEnemies.push({code: shotCode, enemy: shot, layer: shotLayer, ...this.layers[shotLayer].registerEnemy(shot)});
            }
        }
    }
}

function updateAnimationCycle (enemy: Enemy, step: number) {
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

function updateSpeed (player: Player, enemy: Enemy, step: number) {
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
            let enemies: (WorldObject & {enemy: Enemy, layer: LayerCode, code: EnemyCode})[] = [];

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

export function enemyShotsUpdate (this: World, step: number): void {
    for (let i = 0, l = this.registeredEnemyShots.length; i < l; i++) {
        let {shot, name, layer, animationStep, position} = this.registeredEnemyShots[i];
        shot.sxm += step*shot.sxc;
        shot.position.x += step*shot.sxm;
        if (shot.tx != 0) {
            if (shot.position.x > this.playerOne.position.x && shot.sxm > -shot.tx) {
                shot.sxm -= step;
            }
            else if (shot.sxm < shot.tx) {
                shot.sxm += step;
            }
        }
        shot.sym += step*shot.syc;
        shot.position.y += step*shot.sym;

        if (shot.ty != 0) {
            if (shot.position.y > this.playerOne.position.y && shot.sym > -shot.ty) {
                shot.sym -= step;
            }
            else if (shot.sym < shot.ty) {
                shot.sym += step;
            }
        }
        let readyToGC = shot.duration-- <= 0
            || !this.gcBox.contains(shot.position.x, shot.position.y);
        if (readyToGC) {
            this.registeredEnemyShots.splice(i--, 1);
            l--;
            this.layers[layer].unregisterObject(name);
        }

        if (this.playerOne.hitArea.contains(shot.position.x, shot.position.y)) {
            //todo: collision
            this.registeredEnemyShots.splice(i--, 1);
            l--;
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

export function getClosestEnemy(this: World, position: {x: number, y: number}): WorldObject | undefined {
    let found: WorldObject | undefined;
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
