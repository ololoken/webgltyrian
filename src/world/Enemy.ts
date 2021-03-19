export type Enemy = {
    shapeBank: number,
    ex: number; ey: number;//pos
    exc: number; eyc: number;//speed
    exca: number; eyca: number; //random accel
    excc: number; eycc: number; //fixed accel
    exccw: number; eyccw: number; //wait time
    armor: number;
    enemycycle: number;
    graphic: [number, number, number, number, number,
              number, number, number, number, number,
              number, number, number, number, number,
              number, number, number, number, number];
    size: number,
    linknum: number,
    animation: number;
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
    filter: number,
    evalue: number,
    fixedmovey: number,
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
