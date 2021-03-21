import {EnemyCreate} from "./events/EnemyCreate";
import {LayerCode, World} from "./World";
import {TyEventType} from "./EventMappings";
import {Enemy} from "./Enemy";
import {ObservablePoint} from "pixi.js";

const enemies: {pos: ObservablePoint, enemy: Enemy, layer: LayerCode, id: string}[] = [];

export function createEnemy (this: World, e: EnemyCreate): void {
    let typeOffset = 0;

    const index = e.e.data1+typeOffset;
    const eDesc = this.items.enemies[index];
    const aniTypes = [
        {cycle: 1, active: 0, max: 0, fire: 0},
        {cycle: 1, active: 1, max: 0, fire: 0},
        {cycle: 1, active: 2, max: eDesc.shapes, fire: 2},
    ]

    let enemy: Enemy = {
        type: index,
        shapes: eDesc.shapes,
        animationMin: 1,
        shapeBank: eDesc.shapeBank,
        enemyground: 0 == (eDesc.explosionType & 1),
        explosion: eDesc.explosionType >> 1,
        laumchfreq: eDesc.eLaunchFreq,
        launchwait: eDesc.eLaunchFreq,
        launchtype: eDesc.eLaunchType % 1000,
        lauchspecial: eDesc.eLaunchType / 1000,
        xaccel: eDesc.xAccel,
        yaccel: eDesc.yAccel,
        xminbounce: -100000,
        yminbounce: -100000,
        xmaxbounce: 100000,
        ymaxbounce: 100000,
        tur: [eDesc.tur[0], eDesc.tur[1], eDesc.tur[2]],
        animationActive: aniTypes[eDesc.animationType].active,
        animationCycle: aniTypes[eDesc.animationType].cycle,
        animationMax: aniTypes[eDesc.animationType].max,
        animationFire: aniTypes[eDesc.animationType].fire,
        position: {
            x: eDesc.xStart + (Math.random() * eDesc.xcStart >> 0) + e.e.data2,
            y: eDesc.yStart + (Math.random() * eDesc.ycStart >> 0) + e.e.data5,
        },
        exc: eDesc.xMove,
        eyc: eDesc.yMove + e.e.data3,
        excc: eDesc.xcAccel,
        eycc: eDesc.ycAccel,
        special: false,
        iced: 0,
        exrev: eDesc.xRev,
        eyrev: eDesc.yRev,
        graphic: [eDesc.eGraphic[0],  eDesc.eGraphic[1],  eDesc.eGraphic[2],  eDesc.eGraphic[3],  eDesc.eGraphic[4],
                  eDesc.eGraphic[5],  eDesc.eGraphic[6],  eDesc.eGraphic[7],  eDesc.eGraphic[8],  eDesc.eGraphic[9],
                  eDesc.eGraphic[10], eDesc.eGraphic[11], eDesc.eGraphic[12], eDesc.eGraphic[13], eDesc.eGraphic[14],
                  eDesc.eGraphic[15], eDesc.eGraphic[16], eDesc.eGraphic[17], eDesc.eGraphic[18], eDesc.eGraphic[19]],
        size: eDesc.eSize,
        linknum: e.e.data4,
        damaged: eDesc.dAnimation < 0,
        enemydie: eDesc.eEnemyDie,
        freq: [eDesc.freq[0], eDesc.freq[1], eDesc.freq[2]],
        edani: eDesc.dAnimation,
        edgr: eDesc.dgr,
        edlevel: eDesc.dLevel,
        fixedMoveY: e.e.data6,
        filter: 0x00,
        evalue: eDesc.value,
        armor: eDesc.armor,
        scoreitem: eDesc.armor <= 0,

        exccw: Math.abs(eDesc.xcAccel), eyccw: Math.abs(eDesc.ycAccel), //wait time
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

    switch (e.e.type) {
        case TyEventType.ENEMY_CREATE_TOP_50: break;
        case TyEventType.ENEMY_CREATE_GROUND_25:
            /*enemies.push({
                enemy,
                pos: this.layers[LayerCode.GND].registerEnemy(enemy).position,
            });*/
            break;
        case TyEventType.ENEMY_CREATE_GROUND_75: break;
        case TyEventType.ENEMY_CREATE_GROUND_4x4: break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25: break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75: break;
        case TyEventType.ENEMY_CREATE_SKY_0:
            enemies.push({
                enemy,
                layer: LayerCode.SKY,
                ...this.layers[LayerCode.SKY].registerEnemy(enemy),
            });
            break;
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_0: break;
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_50: break;
        case TyEventType.ENEMY_CREATE_ARCADE: break;
        case TyEventType.ENEMY_CREATE_0: break;
        case TyEventType.ENEMY_CREATE_1: break;
        case TyEventType.ENEMY_CREATE_2: break;
        case TyEventType.ENEMY_CREATE_3: break;
    }

}

export function updateEnemies (this: World, d: number): void {
    for (let i = 0, l = enemies.length; i < l; i++) {
        let {enemy, layer, id, pos} = enemies[i];
        //todo: update speed/acceleration/graphic/linked etc.

        updateSpeed(enemy, d);
        updateGraphic(enemy, d);

        enemy.position.x += d*enemy.exc;
        enemy.position.y += d*enemy.eyc;

        enemy.position.y += d*enemy.fixedMoveY;

        let readyToGC = !this.gcBox.contains(enemy.position.x, enemy.position.y)
            || enemy.graphic[Math.floor(enemy.animationCycle) - 1] == 999;

        if (readyToGC) {
            enemies.splice(i--, 1);
            l--;
            this.layers[layer].unregisterEnemy(id);
            continue;
        }

        /*X bounce*/
        if (enemy.position.x <= enemy.xminbounce || enemy.position.x >= enemy.xmaxbounce)
            enemy.exc = -enemy.exc;

        /*Y bounce*/
        if (enemy.position.y <= enemy.yminbounce || enemy.position.x >= enemy.ymaxbounce)
            enemy.eyc = -enemy.eyc;


        //skip invisible enemies
        if (!this.actionRect.contains(enemy.position.x, enemy.position.y)) {
            continue;
        }

        this.layers[layer].updateEnemy(id, enemy);
        pos.copyFrom(enemy.position);
    }
}

function updateGraphic(enemy: Enemy, d: number) {
    if (enemy.animationActive) {
        enemy.animationCycle += d;

        if (Math.floor(enemy.animationCycle) == enemy.animationMax) {
            enemy.animationActive = enemy.animationFire;
        }
        else if (enemy.animationCycle > enemy.shapes) {
            enemy.animationCycle = enemy.animationMin;
        }
    }
}

function updateSpeed (enemy: Enemy, d: number) {
    if (enemy.excc) {
        enemy.exccw -= d;
        if (enemy.exccw <= 0) {
            enemy.exc += d*enemy.excc;
            if (Math.abs(enemy.exc) >= Math.abs(enemy.exrev)) {
                enemy.excc = -enemy.excc;
            }
        }
    }

    if (enemy.eycc) {
        enemy.eyccw -= d;
        if (enemy.eyccw <= 0) {
            enemy.eyc += d*enemy.eycc;
            if (Math.abs(enemy.eyc) >= Math.abs(enemy.eyrev)) {
                enemy.eycc = -enemy.eycc;
            }
        }
    }
}
