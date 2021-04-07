import {EnemyCreate} from "./events/EnemyCreate";
import {World} from "./World";
import {TyEventType} from "./EventMappings";
import {COMP_TILE_HEIGHT, COMP_TILE_WIDTH, TyEnemy} from "../Structs";
import {Enemy, LayerCode, WorldObject} from "./Types";
import {EnemiesGlobalMove} from "./events/EnemiesGlobalMove";
import {EnemiesGlobalAnimate} from "./events/EnemiesGlobalAnimate";

const registeredEnemies: (WorldObject & {enemy: Enemy, layer: LayerCode})[] = [];

const EventTypeToLayerMapping = {
    [TyEventType.ENEMY_CREATE_TOP_50]: LayerCode.TOP,
    [TyEventType.ENEMY_CREATE_GROUND_25]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_GROUND_75]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_GROUND_4x4]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75]: LayerCode.GND,
    [TyEventType.ENEMY_CREATE_SKY_0]: LayerCode.SKY,
    [TyEventType.ENEMY_CREATE_SKY_BOTTOM_0]: LayerCode.SKY,
    [TyEventType.ENEMY_CREATE_SKY_BOTTOM_50]: LayerCode.SKY,
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
    [LayerCode.GND]: 1,
    [LayerCode.SKY]: 0,
    [LayerCode.TOP]: 1,
}

const Enemy4x4TileOffsets = [
    {x: 0, y: 0},
    {x: COMP_TILE_WIDTH*2, y: 0},
    {x: 0, y: -COMP_TILE_HEIGHT*2},
    {x: COMP_TILE_WIDTH*2, y: -COMP_TILE_HEIGHT*2}
];

function fillEnemyData (eventData: {data2: number, data3: number, data4: number, data5: number, data6: number},
                        enemyDesc: TyEnemy): Enemy {
    const animationTypes = [
        {cycle: 0, state: 0, max: -1},
        {cycle: 0, state: 1, max: -1},
        {cycle: 0, state: 2, max: enemyDesc.shapesLength-1},
    ];
    let enemy: Enemy = {
        shapesLength: enemyDesc.shapesLength,
        shapeBank: enemyDesc.shapeBank,
        explosionType: enemyDesc.explosionType,
        launchFreq: enemyDesc.eLaunchFreq,
        launchWait: enemyDesc.eLaunchFreq,
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
            let enemy = fillEnemyData(e, this.items.enemies[e.data1]);
            enemy.position.y += -28-this.backSpeed[layer];
            registeredEnemies.push({enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_GROUND_25:
        case TyEventType.ENEMY_CREATE_GROUND_75: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1]);
            enemy.position.x += 30;
            enemy.position.y += -28-this.backSpeed[layer];
            registeredEnemies.push({enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_SKY_0: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1]);
            enemy.position.x += 30;
            enemy.position.y += -28-this.backSpeed[layer];
            registeredEnemies.push({enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_GROUND_4x4: {
            Enemy4x4TileOffsets.forEach((ep4x4, typeOffset) => {
                let layer = Enemy4x4LayerMapping[e.data6];
                let enemy = fillEnemyData(e, this.items.enemies[e.data1+typeOffset]);
                enemy.position.x += 30+ep4x4.x;
                enemy.position.y += -32+ep4x4.y-this.backSpeed[layer];
                registeredEnemies.push({enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
            });
        } break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25:
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75:
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_0:
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_50: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData(e, this.items.enemies[e.data1]);
            enemy.position.y = 190 + e.data5;
            registeredEnemies.push({enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_ARCADE: break;
        case TyEventType.ENEMY_CREATE_0:
        case TyEventType.ENEMY_CREATE_1:
        case TyEventType.ENEMY_CREATE_2:
        case TyEventType.ENEMY_CREATE_3: {
            let layer = EventTypeToLayerMapping[e.type];
            let enemy = fillEnemyData({...e, data3: 0, data6: 0}, this.items.enemies[e.data3]);
            registeredEnemies.push({enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
    }

}

export function enemiesUpdate (this: World, step: number): void {
    for (let i = 0, l = registeredEnemies.length; i < l; i++) {
        let {enemy, layer, name, position, animationStep} = registeredEnemies[i];

        updateSpeed(enemy, step);
        updateAnimationCycle(enemy, step);

        //position
        enemy.position.x += step*enemy.exc;
        enemy.position.y += step*(enemy.eyc+enemy.fixedMoveY+LayerAddFixedMoveY[layer]*this.backSpeed[layer]);

        //cleanup objects
        let readyToGC = !this.gcBox.contains(enemy.position.x, enemy.position.y)
            || enemy.graphic[enemy.animationCycle>>0] == 999;

        if (readyToGC) {
            registeredEnemies.splice(i--, 1);
            l--;
            this.layers[layer].unregisterObject(name);
            continue;
        }

        //bounces
        if (enemy.position.x <= enemy.xMinBounce || enemy.position.x >= enemy.xMaxBounce) {
            enemy.exc = -enemy.exc;
        }

        if (enemy.position.y <= enemy.yMinBounce || enemy.position.x >= enemy.yMaxBounce) {
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

function updateSpeed (enemy: Enemy, step: number) {
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
            let enemies: typeof registeredEnemies = [];

            switch (true) {
                case e.e.data3 > 79 && e.e.data3 < 90:
                    enemies = registeredEnemies.filter(by => by.enemy.linknum == e.e.data3 - 80);
                    break;
                case e.e.data3 == 0:
                    enemies = registeredEnemies.filter(by => by.enemy.linknum == e.e.data4);
                    break;
                case e.e.data3 == 2:
                    enemies = registeredEnemies.filter(by => by.layer == LayerCode.SKY);
                    break;
                case e.e.data3 == 1:
                    enemies = registeredEnemies.filter(by => by.layer == LayerCode.GND);
                    break;
                case e.e.data3 == 3:
                    enemies = registeredEnemies.filter(by => by.layer == LayerCode.TOP);
                    break;
                case e.e.data3 == 99:
                    enemies = registeredEnemies;
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
            registeredEnemies
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
            registeredEnemies
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
            registeredEnemies
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
            registeredEnemies
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

export function enemiesAnimate (e: EnemiesGlobalAnimate) {
    registeredEnemies
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

