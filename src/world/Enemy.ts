import {IEnemy} from "./Types";
import {EnemySize, TyEnemy} from "../Structs";

export class Enemy implements IEnemy {
    animationCycle: number;
    animationMax: number;
    animationMin: number;
    animationState: number;
    armor: number;
    damaged: boolean;
    edani: number;
    edgr: number;
    edlevel: number;
    enemydie: number;
    evalue: number;
    exc: number;
    excc: number;
    exccw: number;
    exccwmax: number;
    explosionType: number;
    exrev: number;
    eyc: number;
    eycc: number;
    eyccw: number;
    eyccwmax: number;
    eyrev: number;
    filter: number;
    fixedMoveY: number;
    flagnum: number;
    freq: [number, number, number];
    graphic: number[];
    iced: number;
    isScoreItem: boolean;
    launchFreq: number;
    launchSpecial: number;
    launchType: number;
    launchWait: number;
    linknum: number;
    position: { x: number; y: number };
    setto: boolean;
    shapeBank: number;
    shapesLength: number;
    shotMultiPos: [number, number, number];
    shotWait: [number, number, number];
    size: EnemySize;
    special: boolean;
    tur: [number, number, number];
    xAccel: number;
    xMaxBounce: number;
    xMinBounce: number;
    yAccel: number;
    yMaxBounce: number;
    yMinBounce: number;

    public constructor (eventData: {data2: number, data3: number, data4: number, data5: number, data6: number}, enemyDesc: TyEnemy, enemySmallAdjustPos: boolean) {
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
        this.shapesLength = enemyDesc.shapesLength;
        this.shapeBank = enemyDesc.shapeBank;
        this.explosionType = enemyDesc.explosionType;
        this.launchFreq = enemyDesc.eLaunchFreq;
        this.launchWait = enemyDesc.eLaunchFreq;
        this.shotWait = [toWait(enemyDesc.tur[0]), toWait(enemyDesc.tur[1]), toWait(enemyDesc.tur[2])];
        this.shotMultiPos = [0, 0, 0];
        this.launchType = enemyDesc.eLaunchType % 1000;
        this.launchSpecial = enemyDesc.eLaunchType / 1000;
        this.xAccel = enemyDesc.xAccel;
        this.yAccel = enemyDesc.yAccel;
        this.xMinBounce = -Number.MAX_SAFE_INTEGER;
        this.yMinBounce = -Number.MAX_SAFE_INTEGER;
        this.xMaxBounce = Number.MAX_SAFE_INTEGER;
        this.yMaxBounce = Number.MAX_SAFE_INTEGER;
        this.tur = [enemyDesc.tur[0], enemyDesc.tur[1], enemyDesc.tur[2]];
        this.animationState = animationTypes[enemyDesc.animationType].state;
        this.animationCycle = animationTypes[enemyDesc.animationType].cycle;
        this.animationMax = animationTypes[enemyDesc.animationType].max;
        this.animationMin = 0;
        this.position = {
            x: enemyDesc.xStart + (2 * Math.random() * enemyDesc.xcStart >> 0) - enemyDesc.xcStart + 1,
            y: enemyDesc.yStart + (2 * Math.random() * enemyDesc.ycStart >> 0) - enemyDesc.ycStart + 1,
        };
        this.exc = enemyDesc.xMove;
        this.eyc = enemyDesc.yMove;
        this.excc = enemyDesc.xcAccel;
        this.eycc = enemyDesc.ycAccel;
        this.special = false;
        this.iced = 0;
        this.exrev = enemyDesc.xRev;
        this.eyrev = enemyDesc.yRev;
        this.graphic = enemyDesc.eGraphic;
        this.size = enemyDesc.eSize;
        this.linknum = eventData.data4;
        this.damaged = enemyDesc.dAnimation < 0;
        this.enemydie = enemyDesc.eEnemyDie;
        this.freq = [enemyDesc.freq[0], enemyDesc.freq[1], enemyDesc.freq[2]];
        this.edani = enemyDesc.dAnimation;
        this.edgr = enemyDesc.dgr;
        this.edlevel = enemyDesc.dLevel;
        this.fixedMoveY = eventData.data6;
        this.filter = 0x00;
        this.evalue = enemyDesc.value;
        this.armor = enemyDesc.armor;
        this.isScoreItem = enemyDesc.armor <= 0;

        this.flagnum = 0;
        this.setto = false;

        this.exccw = Math.abs(enemyDesc.xcAccel);
        this.eyccw = Math.abs(enemyDesc.ycAccel); //acceleration change wait time current value
        this.exccwmax = Math.abs(enemyDesc.xcAccel);
        this.eyccwmax = Math.abs(enemyDesc.ycAccel); //wait time

        if (eventData.data2 !== -99) {
            this.position.x = eventData.data2;
            this.position.y = -28;
        }

        if (this.size == 0 && enemySmallAdjustPos) {
            this.position.x -= 10;
            this.position.y -= 7;
        }

        this.position.y += eventData.data5;
        this.eyc += eventData.data3;

        switch (this.exrev) {
            case -99: this.exrev = 0; break;
            case 0: this.exrev = 100; break;
        }

        switch (this.eyrev) {
            case -99: this.eyrev = 0; break;
            case 0: this.eyrev = 100; break;
        }
    }
}
