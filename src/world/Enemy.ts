type Enemy = {
    ex: number; ey: number;//pos
    exc: number; eyc: number;//speed
    exca: number; eyca: number; //random accel
    excc: number; eycc: number; //fixed accel
    exccw: number; eyccw: number; //wait time
    armor: number;
    eshotwait: [0, 0, 0];
    eshotmultipos: [0, 0, 0];
    enemycycle: number;
    graphic: number[];
    size: number,
    linknum: number,
    animation: number;
    animationActive: number,
    animationMax: number,
    animationMin: number,
    animationFire: number,
    exrev: number, eyrev: number,
    exccadd: number, eyccadd: number,
    exccwmax: number, eyccwmax: number,
    damaged: boolean,
    type: number,
    edgr: number,
    edlevel: number,
    edani: number,
    filter: number,
    evalue: number,
    fixedmovey: number,
    freq: [0, 0, 0],
    launchwait: number,
    launchtype: number,
    laumchfreq: number,
    xaccel: number, yaccel: number,
    tur: [0, 0, 0],
    enemydie: number,
    explosion: number,
    mapoffset: number,
    enemyground: boolean;
    scoreitem: boolean;
    special: boolean,
    flagnum: number,
    setto: boolean,
    iced: number,
    lauchspecial: number,

    xminbounce: number, yminbounce: number,
    xmaxbounce: number, ymaxbounce: number,
}
