import {EnemyCreate} from "./events/EnemyCreate";
import {LayerCode, World} from "./World";
import {TyEventType} from "./EventMappings";
import {Enemy} from "./Enemy";
import {ObservablePoint} from "pixi.js";

const enemies: {pos: ObservablePoint, enemy: Enemy}[] = [];

export function createEnemy (this: World, e: EnemyCreate): void {
    let typeOffset = 0;

    const index = e.e.data1+typeOffset;
    const eDesc = this.items.enemies[index];
    const aniTypes = [
        {enemycycle: 1, aniactive: 0, animax: 0, aniwhenfire: 0},
        {enemycycle: 0, aniactive: 1, animax: 0, aniwhenfire: 0},
        {enemycycle: 1, aniactive: 2, animax: eDesc.animation, aniwhenfire: 2},
    ]

    let enemy: Enemy = {
        type: index,
        animation: eDesc.animation,
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
        animationCycle: aniTypes[eDesc.animate].enemycycle,
        animationActive: aniTypes[eDesc.animate].aniactive,
        animationMax: aniTypes[eDesc.animate].animax,
        animationFire: aniTypes[eDesc.animate].aniwhenfire,
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
        fixedmovey: e.e.data6,
        filter: 0x00,
        evalue: eDesc.value,
        armor: eDesc.armor,
        scoreitem: eDesc.armor <= 0,

        exca: 0, eyca: 0, //random accel
        exccw: 0, eyccw: 0, //wait time
    }

    switch (e.e.type) {
        case TyEventType.ENEMY_CREATE_TOP_50: break;
        case TyEventType.ENEMY_CREATE_GROUND_25:
            console.log('enemy added');
            enemies.push({pos: this.layers[LayerCode.GND].registerEnemy(enemy), enemy});
            break;
        case TyEventType.ENEMY_CREATE_GROUND_75: break;
        case TyEventType.ENEMY_CREATE_GROUND_4x4: break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_25: break;
        case TyEventType.ENEMY_CREATE_GROUND_BOTTOM_75: break;
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_0: break;
        case TyEventType.ENEMY_CREATE_SKY_BOTTOM_50: break;
        case TyEventType.ENEMY_CREATE_ARCADE: break;
        case TyEventType.ENEMY_CREATE_0: break;
        case TyEventType.ENEMY_CREATE_1: break;
        case TyEventType.ENEMY_CREATE_2: break;
        case TyEventType.ENEMY_CREATE_3: break;
    }
/*
{
    "eventtime": 970,
    "eventtype": 6,
    "eventdat1": 13,
    "eventdat2": 180,
    "eventdat3": 1,
    "eventdat5": -16,
    "eventdat6": 0,
    "eventdat4": 2
  },
  {
    "eventtime": 970,
    "eventtype": 6,
    "eventdat1": 14,
    "eventdat2": 204,
    "eventdat3": 1,
    "eventdat5": -16,
    "eventdat6": 0,
    "eventdat4": 2
  },
 */

}

export function updateEnemies (this: World, d: number): void {
    enemies
        .map(e => {
            //todo: update speed/acceleration/graphic/linked etc.
            e.enemy.position.x += d*e.enemy.exc;
            e.enemy.position.y += d*e.enemy.eyc;
            return e;
        })
        //finally update position
        .forEach(({enemy, pos}, idx) => {
            pos.set(enemy.position.x, enemy.position.y);
        })
}
