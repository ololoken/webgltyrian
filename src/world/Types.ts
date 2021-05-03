import {ObservablePoint, Rectangle} from "pixi.js";
import {EnemyCode} from "./WorldEnemies";
import {EnemySize} from "../Structs";

export interface IWorldLayer {
    readonly backPos: ObservablePoint;
    readonly parallaxOffset: ObservablePoint;

    backSpriteOnTop (state: boolean): void

    unregisterObject (name: string): void;

    registerEnemy (enemy: IEnemyGraphic): WorldObject;
    registerShot (shot: EnemyShotGraphic): WorldObject;
}

export interface IPlayerLayer {
    unregisterObject (name: string): void;

    registerPlayer(player: PlayerGraphic): WorldObject;
    registerShot(shot: PlayerShotGraphic): WorldObject;
}

export enum LayerCode {
    GND = 0,
    SKY = 1,
    TOP = 2,
}

export type BackSpeed = [number, number, number];

export type Layers = [IWorldLayer, IWorldLayer, IWorldLayer];

export type WorldObject = {
    position: ObservablePoint,
    getBoundingRect: () => Rectangle,
    animationStep: ObservablePoint,
    name: string
}

export interface PlayerGraphic {
    shapeBank: number,
    shipGraphic: number,
    position: {x: number, y: number}
}

export interface IEnemyGraphic {
    shapeBank: number,
    graphic: number[],
    animationCycle: number,
    position: {x: number; y: number}
    size: EnemySize,
    filter: number,
}

export type EnemyShotGraphic = {
    shapeBank: number,
    graphic: number[],
    animationCycle: number,
    position: {x: number; y: number}
}

export interface IEnemy extends IEnemyGraphic {
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
    shotMultiPos: [number, number, number],
    shotWait: [number, number, number],
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

    flagnum: number,
    setto: boolean,

    xMinBounce: number, yMinBounce: number,
    xMaxBounce: number, yMaxBounce: number,
}

export type EnemyShot = EnemyShotGraphic & {
    sxm: number, sym: number,
    sxc: number, syc: number,
    tx: number, ty: number,
    sdmg: number,
    duration: number,
    animax: number,
    fill: number[],
}

export type PlayerShotGraphic = {
    shapeBank: number,
    graphic: number[],
    animationCycle: number,
    position: {x: number; y: number}
}

export type PlayerShot = PlayerShotGraphic & {
    id: number,
    shotXM: number, shotYM: number,
    shotXC: number, shotYC: number,
    shotComplicated: boolean,
    shotDevX: number, shotDevY: number,
    shotDirY: number, shotDirX: number,
    shotCirSizeX: number, shotCirSizeY: number,
    trail: number,
    shotAniMax: number,
    shotDmg: number,
    shotBlastFilter: number,
    chainReaction: number,
    playerNumber: number, aimAtEnemy?: WorldObject,
    aimDelay: number, aimDelayMax: number
}

export type EnemyRegistered = WorldObject & {enemy: IEnemy, code: EnemyCode};
export type EnemyShotRegistered = WorldObject & {shot: EnemyShot, layer: LayerCode};
export type PlayerShotRegistered = WorldObject & {shot: PlayerShot, id: number};
