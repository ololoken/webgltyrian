import {EnemyCreate} from "./events/EnemyCreate";
import {World} from "./World";
import {TyEventType} from "./EventMappings";
import {TyEnemy} from "../Structs";
import {Enemy, LayerCode, WorldObject} from "./Types";

const animationTypes = [
    {cycle: 0, active: 0, fire: 0},
    {cycle: 0, active: 1, fire: 0},
    {cycle: 0, active: 2, fire: 1},
]
const enemies: (WorldObject & {enemy: Enemy, layer: LayerCode})[] = [];

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

function fillEnemyData (e: {data2: number, data3: number, data4: number, data5: number, data6: number}, eDesc: TyEnemy): Enemy {

    let enemy: Enemy = {
        shapesLength: eDesc.shapesLength,
        shapeBank: eDesc.shapeBank,
        explosionType: eDesc.explosionType,
        launchFreq: eDesc.eLaunchFreq,
        launchWait: eDesc.eLaunchFreq,
        launchType: eDesc.eLaunchType % 1000,
        launchSpecial: eDesc.eLaunchType / 1000,
        xAccel: eDesc.xAccel,
        yAccel: eDesc.yAccel,
        xMinBounce: -100000,
        yMinBounce: -100000,
        xMaxBounce: 100000,
        yMaxBounce: 100000,
        tur: [eDesc.tur[0], eDesc.tur[1], eDesc.tur[2]],
        animationActive: animationTypes[eDesc.animationType].active,
        animationCycle: animationTypes[eDesc.animationType].cycle,
        animationFire: animationTypes[eDesc.animationType].fire,
        position: {
            x: eDesc.xStart + (Math.random() * eDesc.xcStart >> 0) + e.data2,
            y: eDesc.yStart + (Math.random() * eDesc.ycStart >> 0) + e.data5,
        },
        exc: eDesc.xMove,
        eyc: eDesc.yMove + e.data3,
        excc: eDesc.xcAccel,
        eycc: eDesc.ycAccel,
        special: false,
        iced: 0,
        exrev: eDesc.xRev,
        eyrev: eDesc.yRev,
        graphic: eDesc.eGraphic,
        size: eDesc.eSize,
        linknum: e.data4,
        damaged: eDesc.dAnimation < 0,
        enemydie: eDesc.eEnemyDie,
        freq: [eDesc.freq[0], eDesc.freq[1], eDesc.freq[2]],
        edani: eDesc.dAnimation,
        edgr: eDesc.dgr,
        edlevel: eDesc.dLevel,
        fixedMoveY: e.data6,
        filter: 0x00,
        evalue: eDesc.value,
        armor: eDesc.armor,
        isScoreItem: eDesc.armor <= 0,

        exccw: Math.abs(eDesc.xcAccel), eyccw: Math.abs(eDesc.ycAccel), //acceleration change wait time current value
        exccwmax: Math.abs(eDesc.xcAccel), eyccwmax: Math.abs(eDesc.ycAccel), //wait time
    }

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

export function createEnemy (this: World, e: EnemyCreate): void {
    switch (e.e.type) {
        case TyEventType.ENEMY_CREATE_TOP_50:
        case TyEventType.ENEMY_CREATE_GROUND_25:
        case TyEventType.ENEMY_CREATE_GROUND_75:
        case TyEventType.ENEMY_CREATE_SKY_0: {
            let enemy = fillEnemyData(e.e, this.items.enemies[e.e.data1]);
            let layer = EventTypeToLayerMapping[e.e.type];
            enemies.push({enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_GROUND_4x4: break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25:
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75:
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_0:
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_50: {
            let enemy = fillEnemyData(e.e, this.items.enemies[e.e.data1]);
            let layer = EventTypeToLayerMapping[e.e.type];
            enemy.position.y = 190 + e.e.data5;
            enemies.push({
                enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
        case TyEventType.ENEMY_CREATE_ARCADE: break;
        case TyEventType.ENEMY_CREATE_0:
        case TyEventType.ENEMY_CREATE_1:
        case TyEventType.ENEMY_CREATE_2:
        case TyEventType.ENEMY_CREATE_3: {
            let enemy = fillEnemyData({...e.e, data3: 0, data6: 0}, this.items.enemies[e.e.data3]);
            let layer = EventTypeToLayerMapping[e.e.type];
            enemies.push({enemy, layer, ...this.layers[layer].registerEnemy(enemy)});
        } break;
    }

}

export function updateEnemies (this: World, BTPS: number): void {
    for (let i = 0, l = enemies.length; i < l; i++) {
        let {enemy, layer, name, position, cycle} = enemies[i];

        updateSpeed(enemy, BTPS);
        updateAnimationCycle(enemy, BTPS);

        //position
        enemy.position.x += BTPS*enemy.exc;
        enemy.position.y += BTPS*enemy.eyc;

        enemy.position.y += BTPS*enemy.fixedMoveY;

        if (layer == LayerCode.GND || layer == LayerCode.TOP) {
            enemy.position.y += BTPS*this.backSpeed[layer];
        }

        //cleanup objects
        let readyToGC = !this.gcBox.contains(enemy.position.x, enemy.position.y)
            || enemy.graphic[Math.floor(enemy.animationCycle)] == 999;

        if (readyToGC) {
            enemies.splice(i--, 1);
            l--;
            this.layers[layer].unregisterEnemy(name);
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
        cycle.set(Math.floor(enemy.animationCycle), 0)
    }
}

function updateAnimationCycle(enemy: Enemy, BTPS: number) {
    if (enemy.animationActive) {
        enemy.animationCycle += BTPS;

        if (enemy.animationCycle > enemy.shapesLength-1) {
            enemy.animationCycle = enemy.animationFire;
        }
    }
}

function updateSpeed (enemy: Enemy, BTPS: number) {
    if (enemy.excc) {
        enemy.exccw -= BTPS;
        if (enemy.exccw <= 0) {
            enemy.exc += BTPS*Math.sign(enemy.excc);
            enemy.exccw = enemy.exccwmax;
            if (Math.abs(enemy.exc) >= Math.abs(enemy.exrev)) {
                enemy.excc = -enemy.excc;
            }
        }
    }

    if (enemy.eycc) {
        enemy.eyccw -= BTPS;
        if (enemy.eyccw <= 0) {
            enemy.eyc += BTPS*Math.sign(enemy.eycc);
            enemy.eyccw = enemy.eyccwmax;
            if (Math.abs(enemy.eyc) >= Math.abs(enemy.eyrev)) {
                enemy.eycc = -enemy.eycc;
            }
        }
    }
}
