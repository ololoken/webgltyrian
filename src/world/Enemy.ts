export type EnemyGraphic = {
    shapeBank: number,
    graphic: [number, number, number, number, number,
              number, number, number, number, number,
              number, number, number, number, number,
              number, number, number, number, number],
    animationCycle: number,
    position: {x: number; y: number;}//pos
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
    shapes: number;
    animationActive: number,
    animationMax: number,
    animationMin: number,
    animationFire: number,
    exrev: number, eyrev: number,
    damaged: boolean,
    type: number,
    edlevel: number,
    edani: number,
    edgr: number,
    evalue: number,
    fixedMoveY: number,
    freq: [number, number, number],
    launchwait: number,
    launchtype: number,
    laumchfreq: number,
    xaccel: number, yaccel: number,
    tur: [number, number, number],
    enemydie: number,
    explosion: number,
    enemyground: boolean;
    scoreitem: boolean;
    special: boolean,
    iced: number,
    lauchspecial: number,

    xminbounce: number, yminbounce: number,
    xmaxbounce: number, ymaxbounce: number,
}
