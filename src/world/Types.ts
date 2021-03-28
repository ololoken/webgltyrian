import {ObservablePoint} from "pixi.js";

export interface WorldLayer {
    readonly backPos: ObservablePoint;
    registerEnemy (enemy: EnemyGraphic): WorldObject;
    unregisterEnemy (name: string): void;

    registerPlayer(player: PlayerGraphic): WorldObject;
}

export enum LayerCode {
    GND = 0,
    SKY = 1,
    TOP = 2
}

export type BackSpeed = [number, number, number];

export type Layers = [WorldLayer, WorldLayer, WorldLayer];

export type WorldObject = {
    position: ObservablePoint,
    animationStep: ObservablePoint,
    name: string
}

export interface PlayerGraphic {
    shapeBank: number,
    shipGraphic: number,
    position: {x: number, y: number}
}

export type EnemyGraphic = {
    shapeBank: number,
    graphic: number[],
    animationCycle: number,
    position: {x: number; y: number}
    size: number,
    filter: number,
}

export type Enemy = EnemyGraphic & {
    exc: number; eyc: number;//speed
    excc: number; eycc: number; //fixed accel
    exccw: number; eyccw: number; //wait time
    exccwmax: number; eyccwmax: number;
    armor: number;
    linknum: number,
    shapesLength: number;
    animationState: number,
    animationMin: number, animationMax: number;
    exrev: number, eyrev: number,
    damaged: boolean,
    edlevel: number,
    edani: number,
    edgr: number,
    evalue: number,
    fixedMoveY: number,
    freq: [number, number, number],
    launchWait: number,
    launchType: number,
    launchFreq: number,
    xAccel: number, yAccel: number,
    tur: [number, number, number],
    enemydie: number,
    explosionType: number,
    isScoreItem: boolean;
    special: boolean,
    iced: number,
    launchSpecial: number,

    xMinBounce: number, yMinBounce: number,
    xMaxBounce: number, yMaxBounce: number,
}

