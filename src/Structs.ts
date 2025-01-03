import {
    BooleanFormatter,
    l,
    la,
    Primitive,
    StringFormatter,
    Struct,
    USwap16Formatter
} from "@ololoken/struct";
import { PascalDecryptFormatter } from './Decoders';
import {
    BACK_1_HEIGHT,
    BACK_1_WIDTH,
    BACK_2_HEIGHT,
    BACK_2_WIDTH,
    BACK_3_HEIGHT,
    BACK_3_WIDTH,
    BACK_TO_SHAPE_MAX_INDEX,
    MAP_TILES_MAX_INDEX,
    MAP_TILE_HEIGHT,
    MAP_TILE_WIDTH,
    PALETTE_SIZE,
} from './Const';

const [UInt16, Int16] = [Primitive.UInt16LE(), Primitive.Int16LE()],
      [Byte, Char] = [Primitive.UInt8(), Primitive.Int8()],
      [UInt32, Int32] = [Primitive.UInt32LE(), Primitive.Int32LE()];
const asAsciiString = StringFormatter({encoding: 'ascii'});

export type TyWeapon = Readonly<{
    drain: number,
    shotRepeat: number,
    multi: number,
    animation: number,
    max: number,
    tx: number, ty: number,
    aim: number,
    attack: number[],
    delay: number[],
    sx: number[], sy: number[],
    bx: number[], by: number[],
    sg: number[],
    accelerationY: number,
    accelerationX: number,
    circleSize: number,
    sound: number,
    trail: number,
    shipBlastFilter: number
}>

type TyPort = Readonly<{
    nameLength: number,
    name: string,
    opnum: number,
    op1: number[],
    op2: number[],
    price: number,
    graphic: number,
    powerConsumption: number
}>

type TySpecial = Readonly<{
    nameLength: number,
    name: string,
    graphic: number,
    power: number,
    stype: number,
    weapon: number
}>

type TyPower = Readonly<{
    nameLength: number,
    name: string,
    graphic: number,
    power: number,
    speed: number,
    price: number
}>

export type TyShip = Readonly<{
    nameLength: number,
    name: string,
    shipGraphic: number,
    itemGraphic: number,
    bigShipGraphic: number,
    animation: number,
    speed: number,
    damage: number,
    price: number
}>

type TyOption = Readonly<{
    nameLength: number,
    name: string,
    power: number,
    graphic: number,
    price: number,
    tr: number,
    option: number,
    opSpeed: number,
    animation: number,
    gr: number[],
    wpPort: number,
    wpNum: number,
    ammo: number,
    stop: boolean,
    iconGraphic: number
}>

export type TyShield = Readonly<{
    nameLength: number,
    name: string,
    tPower: number,
    mPower: number,
    graphic: number,
    price: number
}>

export enum EnemySize {
    s1x1 = 0,
    s2x2 = 1
}

export type TyEnemy = Readonly<{
    shapesLength: number,
    tur: number[],
    freq: number[],
    xMove: number, yMove: number,
    xAccel: number, yAccel: number,
    xcAccel: number, ycAccel: number,
    xStart: number, yStart: number,
    xcStart: number, ycStart: number,
    armor: number,
    eSize: EnemySize,
    eGraphic: number[],
    explosionType: number,
    animationType: number,
    shapeBank: number,
    xRev: number, yRev: number,
    dgr: number,
    dLevel: number,
    dAnimation: number,
    eLaunchFreq: number,
    eLaunchType: number,
    value: number,
    eEnemyDie: number
}>

export type TyEpisodeItems = Readonly<{
    weaponsCount: number, weapons: TyWeapon[],
    portsCount: number, ports: TyPort[],
    specials: TySpecial[],
    powersCount: number, powers: TyPower[],
    shipsCount: number, ships: TyShip[],
    optionsCount: number, options: TyOption[],
    shieldsCount: number, shields: TyShield[],
    enemiesCount: number, enemies: TyEnemy[]
}>

export type TySong = Readonly<{
    mode: number,
    speed: number,
    tempo: number,
    patternsLength: number,
    channelsDelay: number[],
    regbd: number,
    soundBanksLength: number,
    soundBanks: TySoundBank[],
    positionsLength: number,
    positions: TySongPosition[],
    patterns: number[],
}>

type TySoundBank = Readonly<{
    modMisc: number,
    modVol: number,
    modAd: number,
    modSr: number,
    modWave: number,
    carMisc: number,
    carVol: number,
    carAd: number,
    carSr: number,
    carWave: number,
    feedback: number,
    keyOff: number,
    portamento: number,
    glide: number,
    finetune: number,
    vibrato: number,
    vibDelay: number,
    modTrem: number,
    carTrem: number,
    tremWait: number,
    arpeggio: number,
    arpTab: number[],
    start: number,
    size: number,
    fms: number,
    transp: number,
    midInst: number,
    midVelo: number,
    midKey: number,
    midTrans: number,
    middum1: number,
    middum2: number,
}>

type TySongPosition = Readonly<{
    patnum: number,
    transpose: number
}>

export type TySfxHeader = Readonly<{
    soundsLength: number,
    offsets: number[]
}>

export const TyEpisodeItemsStruct = new Struct<TyEpisodeItems>()
    .single('weaponsCount', UInt16)
    .single('portsCount',  UInt16)
    .single('powersCount',  UInt16)
    .single('shipsCount',  UInt16)
    .single('optionsCount',  UInt16)
    .single('shieldsCount', UInt16)
    .single('enemiesCount',  UInt16)
    .array('weapons', new Struct<TyWeapon>()
        .single('drain', UInt16)
        .single('shotRepeat', Byte)
        .single('multi', Byte)
        .single('animation', UInt16)
        .single('max', Byte)
        .single('tx', Byte).single('ty', Byte)
        .single('aim', Byte)
        .array('attack', Byte, l(8))
        .array('delay', Byte, l(8))
        .array('sx', Char, l(8)).array('sy', Char, l(8))
        .array('bx', Char, l(8)).array('by', Char, l(8))
        .array('sg', UInt16, l(8))
        .single('accelerationY', Char).single('accelerationX', Char)
        .single('circleSize', Byte)
        .single('sound', Byte)
        .single('trail', Byte)
        .single('shipBlastFilter', Byte), items => items.weaponsCount+1)
    .array('ports', new Struct<TyPort>()
        .single('nameLength', Byte)
        .array('name', Byte, la('nameLength'), asAsciiString)
        .single('opnum', Byte)
        .array('op1', UInt16, l(11))
        .array('op2', UInt16, l(11))
        .single('price', UInt16)
        .single('graphic', UInt16)
        .single('powerConsumption', UInt16), items => items.portsCount+1)
    .array('specials', new Struct<TySpecial>()
        .single("nameLength", Byte)
        .array("name", Char, la('nameLength'), asAsciiString)
        .single("graphic", UInt16)
        .single("power", Byte)
        .single("stype", Byte)
        .single("weapon", UInt16), l(47))
    .array('powers', new Struct<TyPower>()
        .single('nameLength', Byte)
        .array('name', Char, la('nameLength'), asAsciiString)
        .single('graphic', UInt16)
        .single('power', Byte)
        .single('speed', Char)
        .single('price', UInt16), items => items.powersCount+1)
    .array('ships', new Struct<TyShip>()
        .single('nameLength', Byte)
        .array('name', Char, la('nameLength'), asAsciiString)
        .single('shipGraphic', UInt16)
        .single('itemGraphic', UInt16)
        .single('animation', Byte)
        .single('speed', Char)
        .single('damage', Byte)
        .single('price', UInt16)
        .single('bigShipGraphic', Byte), items => items.shipsCount+1)
    .array('options', new Struct<TyOption>()
        .single('nameLength', Byte)
        .array('name', Char, la('nameLength'), asAsciiString)
        .single('power', Byte)
        .single('graphic', UInt16)
        .single('price', UInt16)
        .single('tr', Byte)
        .single('option', Byte)
        .single('opSpeed', Char)
        .single('animation', Byte)
        .array('gr', UInt16, l(20))
        .single('wpPort', Byte)
        .single('wpNum', UInt16)
        .single('ammo', Byte)
        .single('stop', Char, BooleanFormatter())
        .single('iconGraphic', Byte), items => items.optionsCount+1)
    .array('shields', new Struct<TyShield>()
        .single('nameLength', Byte)
        .array('name', Char, la('nameLength'), asAsciiString)
        .single('tPower', Byte)
        .single('mPower', Byte)
        .single('graphic', UInt16)
        .single('price', UInt16),items => items.shieldsCount+1)
    .array('enemies', new Struct<TyEnemy>()
        .single('shapesLength', Byte)
        .array('tur', Byte, l(3))
        .array('freq', Byte, l(3))
        .single('xMove', Char).single('yMove', Char)
        .single('xAccel', Char).single('yAccel', Char)
        .single('xcAccel', Char).single('ycAccel', Char)
        .single('xStart', Int16).single('yStart', Int16)
        .single('xcStart', Char).single('ycStart', Char)
        .single('armor', Byte)
        .single('eSize', Byte)
        .array('eGraphic', UInt16, l(20), (data) => data.map(v => v-1))
        .single('explosionType', Byte)
        .single('animationType', Byte)
        .single('shapeBank', Byte)
        .single('xRev', Char).single('yRev', Char)
        .single('dgr', UInt16)
        .single('dLevel', Char)
        .single('dAnimation', Char)
        .single('eLaunchFreq', Byte)
        .single('eLaunchType', UInt16)
        .single('value', Int16)
        .single('eEnemyDie', UInt16), items => items.enemiesCount + 1);

type rgb = {r: number, g: number, b: number};
export type TyPalette = {colors: rgb[]};
export const TyPalettesStruct = new Struct<{palettes: TyPalette[]}>()//palette.dat
    .array('palettes', new Struct<TyPalette>()
        .array('colors', new Struct<rgb>()
            .single('r', Byte)
            .single('g', Byte)
            .single('b', Byte), l(PALETTE_SIZE)), Struct.all);

export const TyPCXOffsetsStruct = new Struct<{imagesLength: number, offsets: number[]}>()//tyrian.pic
    .single('imagesLength', UInt16)
    .array('offsets', Int32, la('imagesLength'));

interface PascalString {
    length: number,
    data: string
}

export const TyStringsStruct = new Struct<{strings: PascalString[]}>()
    .array('strings', new Struct<PascalString>()
        .single('length', Byte)
        .array('data', Char, la('length'), PascalDecryptFormatter([204, 129, 63, 255, 71, 19, 25, 62, 1, 99])), l(Number.MAX_SAFE_INTEGER))

export const TyEpisodeMapsFileHeaderStruct = new Struct<{ length: number, offsets: number[] }>()
    .single('length', UInt16)
    .array('offsets', UInt32, la('length'))

export enum TyEventType {
    UNSUPPORTED = 0,
    STAR_FIELD_SPEED = 1,
    BACK_SPEED_SET = 2,
    BACK_DELAY = 3,
    BACK_DELAY_TYPE = 4,
    ENEMIES_LOAD_SHAPES = 5,
    ENEMY_CREATE_GROUND_25 = 6,//enemy create events _XX suffix is
    ENEMY_CREATE_TOP_50 = 7,//relic of opentyrian and means offset of rendering slot for certain types
    STARS_OFF = 8,
    STARS_ON = 9,
    ENEMY_CREATE_GROUND_75 = 10,
    LEVEL_END = 11,
    ENEMY_CREATE_4x4 = 12, //the big one
    ENEMIES_RANDOM_OFF = 13,
    ENEMIES_RANDOM_ON = 14,
    ENEMY_CREATE_SKY_0 = 15,
    SHOW_MESSAGE = 16,
    ENEMY_CREATE_GROUND_BOTTOM_25 = 17,
    ENEMY_CREATE_SKY_BOTTOM_0 = 18,
    ENEMIES_GLOBAL_MOVE_0 = 19,
    ENEMIES_GLOBAL_MOVE_1 = 20,
    BACK_3_OVER_1 = 21,
    BACK_3_OVER_OFF = 22,
    ENEMY_CREATE_TOP_BOTTOM_50_1 = 23,
    ENEMIES_GLOBAL_ANIMATE = 24,
    ENEMIES_GLOBAL_DAMAGE = 25,
    ENEMY_SMALL_ADJUST_POS = 26,
    ENEMIES_GLOBAL_MOVE_2 = 27,
    ENEMIES_TOP_OVER_OFF = 28,
    ENEMIES_TOP_OVER_ON  = 29,
    BACK_SPEED_SET_2 = 30,
    ENEMIES_FIRE_OVERRIDE = 31,
    ENEMY_CREATE_TOP_BOTTOM_50_2 = 32,
    ENEMY_SPAWN = 33,
    MUSIC_FADE_ = 34,
    MUSIC_TRACK_ = 35,
    LEVEL_READY_TO_END = 36,
    LEVEL_ENEMIES_FREQUENCY = 37,
    EVENTS_JUMP = 38,
    ENEMIES_GLOBAL_LINK_NUM = 39,
    ENEMIES_CONTINUAL_DAMAGE = 40,
    ENEMIES_RESET = 41,
    BACK_3_OVER_2 = 42,
    BACK_2_OVER = 43,
    LEVEL_FILTERS = 44,
    ENEMY_CREATE_ARCADE = 45,
    LEVEL_DIFFICULTY = 46,
    ENEMIES_GLOBAL_DAMAGE_ = 47,
    BACK_2_NOT_TRANSPARENT = 48,
    ENEMY_CREATE_0 = 49,
    ENEMY_CREATE_1 = 50,
    ENEMY_CREATE_2 = 51,
    ENEMY_CREATE_3 = 52,
    EVENTS_FORCED_FORWARD = 53,
    EVENTS_JUMP_WITH_RETURN = 54,
    ENEMIES_GLOBAL_MOVE_3 = 55,
    ENEMY_CREATE_GROUND_BOTTOM_75 = 56,
    EVENTS_JUMP_SUPER_ENEMY = 57,
    WTF_58 = 58,//not used
    WTF_59 = 59,//not used
    ENEMY_SPECIAL_ASSIGN = 60,
    EVENTS_JUMP_GLOBAL_FLAG = 61,
    SOUND_EFFECT = 62,
    EVENTS_JUMP_SINGLE_PLAYER = 63,
    LEVEL_SMOOTHIES = 64,
    BACK_3_X1 = 65,
    EVENTS_JUMP_DIFFICULTY = 66,
    EVENTS_JUMP_TIMER = 67,
    RANDOM_EXPLOSIONS_SWITCH = 68,
    IMPREVIOUS_TICKS = 69,
    EVENTS_JUMP_OPTIONAL = 70,
    EVENTS_JUMP_SECRET = 71,
    BACK_3_X1B = 72,
    ENEMIES_SKY_OVER_SWITCH = 73,
    ENEMIES_GLOBAL_MOVE_4 = 74,
    ENEMIES_MOVE_OVERRIDE = 75,
    EVENTS_JUMP_RETURN = 76,
    BACKGROUND_JUMP = 77,
    GALAGA_SHOT_FREQUENCY_INC = 78,
    BOSS_BAR_LINK_NUM_SET = 79,
    EVENTS_JUMP_MULTIPLAYER = 80,
    BACKGROUND_WRAP = 81,
    PLAYER_SPECIAL_WEAPON_SET = 82,
}

export type TyEpisodeMapEvent = Readonly<{
    time: number,
    type: TyEventType,
    data1: number,
    data2: number,
    data3: number,
    data4: number,
    data5: number,
    data6: number,
}>

const TyEpisodeMapEventStruct = new Struct<TyEpisodeMapEvent>()
    .single('time', UInt16)
    .single('type', Byte)
    .single('data1', Int16)
    .single('data2', Int16)
    .single('data3', Char)
    .single('data5', Char)
    .single('data6', Char)
    .single('data4', Byte);

type TyBackgroundData = Readonly<{
    shapesMapping1: number[],
    shapesMapping2: number[],
    shapesMapping3: number[],
    background1: number[],
    background2: number[],
    background3: number[]
}>

const TyEpisodeMapBackgroundStruct = new Struct<TyBackgroundData>()
    .array('shapesMapping1', UInt16, l(BACK_TO_SHAPE_MAX_INDEX), (data) => USwap16Formatter(data).map(v => v-1))
    .array('shapesMapping2', UInt16, l(BACK_TO_SHAPE_MAX_INDEX), (data) => USwap16Formatter(data).map(v => v-1))
    .array('shapesMapping3', UInt16, l(BACK_TO_SHAPE_MAX_INDEX), (data) => USwap16Formatter(data).map(v => v-1))
    .array('background1', Byte, l(BACK_1_WIDTH*BACK_1_HEIGHT))
    .array('background2', Byte, l(BACK_2_WIDTH*BACK_2_HEIGHT))
    .array('background3', Byte, l(BACK_3_WIDTH*BACK_3_HEIGHT));

export type TyEpisodeMap = Readonly<{
    mapFile: number,
    shapesFile: number,
    backX: number[],
    enemiesRandomCount: number,
    enemiesRandom: number[],
    eventsCount: number,
    events: TyEpisodeMapEvent[],
    background: TyBackgroundData
}>

export const TyEpisodeMapStruct = new Struct<TyEpisodeMap>()
    .single('mapFile', Byte)
    .single('shapesFile', Byte)
    .array('backX', UInt16, l(3))
    .single('enemiesRandomCount', UInt16)
    .array('enemiesRandom', UInt16, la('enemiesRandomCount'))
    .single('eventsCount', UInt16)
    .array('events', TyEpisodeMapEventStruct, la('eventsCount'))
    .single('background', TyEpisodeMapBackgroundStruct);

type TyShapePayload = {width: number, height: number, size: number, data: number[]}
export type TyShape = Readonly<{hasData: number, payload: TyShapePayload[]}>;
export const TyShapeTablesHeaderStruct = new Struct<{tablesCount: number, offsets: number[]}>()
    .single('tablesCount', UInt16)
    .array('offsets', UInt32, la('tablesCount'))
export const TyShapeStruct = new Struct<TyShape>()
    .single('hasData', Byte)
    .array('payload', new Struct<TyShapePayload>()
        .single('width', UInt16)
        .single('height', UInt16)
        .single('size', UInt16)
        .array('data', Byte, la('size')), la('hasData'))
export const TyShapesTableStruct = new Struct<{count: number, shapes: TyShape[]}>()
    .single('count', UInt16)
    .array('shapes', TyShapeStruct, la('count'));

export const TyMapBackgroundShapesStruct = new Struct<{shapes: TyShape[], trailingData: number[]}>()
    .array('shapes', new Struct<TyShape>()
        .single('hasData', Byte, ([isEmpty]) => Boolean(isEmpty) ? 0 : 1)
        .array('payload', new Struct<TyShapePayload>()
            .array('data', Byte, l(MAP_TILE_WIDTH*MAP_TILE_HEIGHT)), la('hasData')),
        l(MAP_TILES_MAX_INDEX))
    //no idea what's stored here
    .array('trailingData', Byte, l(Number.MAX_SAFE_INTEGER));

export const TyCompressedShapesData = (offset: number, end: number) => new Struct<{first: number, offsets: number[], data: number[]}>()
    .single('first', UInt16)
    .goto(l(offset))
    .array('offsets', UInt16, ({first}) => first/UInt16.size)
    .goto(l(offset))
    .array('data', Byte, l(end-offset));

export const TyPCXImage = (offset: number, length: number) =>  new Struct<{img: number[]}>()
    .goto(l(offset))
    .array('img', Byte, l(length));

export const TySoundData = (offset: number, length: number) =>  new Struct<{sound: number[]}>()
    .goto(l(offset))
    .array('sound', Byte, l(length));

export const TyMusicHeaderStruct = new Struct<{length: number, offsets: number[]}>()
    .single('length', UInt16)
    .array('offsets', UInt32, la('length'))

export const TySongStruct = new Struct<TySong>()
    .single('mode', Byte)
    .single('speed', UInt16)
    .single('tempo', Byte)
    .single('patternsLength', Byte)
    .array('channelsDelay', Byte, l(9))
    .single('regbd', Byte)
    .single('soundBanksLength', UInt16)
    .array('soundBanks', new Struct<TySoundBank>()
        .single('modMisc', Byte)
        .single('modVol', Byte)
        .single('modAd', Byte)
        .single('modSr', Byte)
        .single('modWave', Byte)
        .single('carMisc', Byte)
        .single('carVol', Byte)
        .single('carAd', Byte)
        .single('carSr', Byte)
        .single('carWave', Byte)
        .single('feedback', Byte)
        .single('keyOff', Byte)
        .single('portamento', Byte)
        .single('glide', Byte)
        .single('finetune', Byte)
        .single('vibrato', Byte)
        .single('vibDelay', Byte)
        .single('modTrem', Byte)
        .single('carTrem', Byte)
        .single('tremWait', Byte)
        .single('arpeggio', Byte)
        .array('arpTab', Byte, l(12))
        .single('start', UInt16)
        .single('size', UInt16)
        .single('fms', Byte)
        .single('transp', UInt16)
        .single('midInst', Byte)
        .single('midVelo', Byte)
        .single('midKey', Byte)
        .single('midTrans', Byte)
        .single('middum1', Byte)
        .single('middum2', Byte), la('soundBanksLength'))
    .single('positionsLength', UInt16)
    .array('positions', new Struct<TySongPosition>()
        .single('patnum', UInt16)
        .single('transpose', Byte), la('positionsLength'))
    .array('patterns', UInt16, la('patternsLength'))
