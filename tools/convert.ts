import {readFileSync, writeFileSync} from 'fs';
import {
    Struct,
    Primitive,
    StringFormatter,
    BooleanFormatter,
    ItemsFormatter,
    l,
    la, USwap16Formatter
} from '@ololoken/struct';
import {TextDecoder} from "util";

const [UInt16, Int16, Byte, Char, UInt32, Int32] = [Primitive.UInt16LE(), Primitive.Int16LE(), Primitive.UInt8(), Primitive.Int8(), Primitive.UInt32LE(), Primitive.Int32LE()];
const asAsciiString = StringFormatter({encoding: 'ascii'});
/*
let itemsStruct = new Struct<any>()
    .single('weaponsCount', UInt16)
    .single('portsCount',  UInt16)
    .single('powersCount',  UInt16)
    .single('shipsCount',  UInt16)
    .single('optionsCount',  UInt16)
    .single('shieldsCount', UInt16)
    .single('enemiesCount',  UInt16)
    .array('weapons', new Struct<any>()
        .single('drain', UInt16)
        .single('shotRepeat', Byte)
        .single('multi', Byte)
        .single('animation', UInt16)
        .single('max', Byte)
        .single('tx', Byte)
        .single('ty', Byte)
        .single('aim', Byte)
        .array('attack', Byte, l(8))
        .array('del', Byte, l(8))
        .array('sx', Char, l(8))
        .array('sy', Char, l(8))
        .array('bx', Char, l(8))
        .array('by', Char, l(8))
        .array('sg', UInt16, l(8))
        .single('accelerationY', Char)
        .single('accelerationX', Char)
        .single('circleSize', Byte)
        .single('sound', Byte)
        .single('trail', Byte)
        .single('shipBlastFilter', Byte), items => items.weaponsCount+1)
    .array('ports', new Struct<any>()
        .single('nameLength', Byte)
        .array('name', Byte, la('nameLength'), asAsciiString)
        .single('opnum', Byte)
        .array('op1', UInt16, l(11))
        .array('op2', UInt16, l(11))
        .single('price', UInt16)
        .single('graphic', UInt16)
        .single('powerConsumption', UInt16), items => items.portsCount+1)
    .array('specials', new Struct<any>()
        .single("nameLen", Byte)
        .array("name", Char, la('nameLen'), asAsciiString)
        .single("itemGraphic", UInt16)
        .single("pwr", Byte)
        .single("stype", Byte)
        .single("wpn", UInt16), l(47))
    .array('powers', new Struct<any>()
        .single('nameLen', Byte)
        .array('name', Char, la('nameLen'), asAsciiString)
        .single('itemGraphic', UInt16)
        .single('pwr', Byte)
        .single('speed', Char)
        .single('price', UInt16), items => items.powersCount+1)
    .array('ships', new Struct<any>()
        .single('nameLen', Byte)
        .array('name', Char, la('nameLen'), asAsciiString)
        .single('shipGraphic', UInt16)
        .single('itemGraphic', UInt16)
        .single('ani', Byte)
        .single('spd', Char)
        .single('dmg', Byte)
        .single('price', UInt16)
        .single('bigShipGraphic', Byte), items => items.shipsCount+1)
    .array('options', new Struct<any>()
        .single('nameLen', Byte)
        .array('name', Char, la('nameLen'), asAsciiString)
        .single('pwr', Byte)
        .single('itemGraphic', UInt16)
        .single('price', UInt16)
        .single('tr', Byte)
        .single('option', Byte)
        .single('opspd', Char)
        .single('ani', Byte)
        .array('gr', UInt16, l(20))
        .single('wport', Byte)
        .single('wpnum', UInt16)
        .single('ammo', Byte)
        .single('stop', Char, BooleanFormatter())
        .single('icongr', Byte), items => items.optionsCount+1)
    .array('shields', new Struct<any>()
            .single('nameLen', Byte)
            .array('name', Char, la('nameLen'), asAsciiString)
            .single('tpwr', Byte)
            .single('mpwr', Byte)
            .single('itemGraphic', UInt16)
            .single('price', UInt16),items => items.shieldsCount+1)
    .array('enemies', new Struct<any>()
        .single('ani', Byte)
        .array('tur', Byte, l(3))
        .array('freq', Byte, l(3))
        .single('xmove', Char)
        .single('ymove', Char)
        .single('xaccel', Char)
        .single('yaccel', Char)
        .single('xcaccel', Char)
        .single('ycaccel', Char)
        .single('startx', Int16)
        .single('starty', Int16)
        .single('startxc', Char)
        .single('startyc', Char)
        .single('armor', Byte)
        .single('esize', Byte)
        .array('eGraphic', UInt16, l(20))
        .single('explosionType', Byte)
        .single('animate', Byte)
        .single('shapeBank', Byte)
        .single('xrev', Char)
        .single('yrev', Char)
        .single('dgr', UInt16)
        .single('dlevel', Char)
        .single('dani', Char)
        .single('elaunchfreq', Byte)
        .single('elauchtype', UInt16)
        .single('value', Int16)
        .single('eenemydie', UInt16), items => items.enemiesCount + 1);

let PascalDecryptFormatter = (key: number[]) : ItemsFormatter<number, string> => (data) => {
    for (let i = data.length-1, l = key.length; i >= 0; --i) {
        data[i] ^= key[i%l];
        data[i] ^= data[i-1];
    }
    return new TextDecoder('ascii').decode(new Int8Array(data), {stream: false});
}

interface LevelScriptChunk {
    length: number,
    data: string
}

let levelScriptStruct = new Struct<{strings: LevelScriptChunk[]}>()
    .array('strings', new Struct<LevelScriptChunk>()
        .single('length', Byte)
        .array('data', Char, la('length'), PascalDecryptFormatter([204, 129, 63, 255, 71, 19, 25, 62, 1, 99])), l(Number.MAX_SAFE_INTEGER))

let episodeMapsFileHeaderStruct = new Struct<{ length: number, offsets: number[] }>()
    .single('length', UInt16)
    .array('offsets', UInt32, la('length'))

let episodeMapEventStruct = new Struct<any>()
        .single('eventtime', UInt16)
        .single('eventtype', Byte)
        .single('eventdat1', Int16)
        .single('eventdat2', Int16)
        .single('eventdat3', Char)
        .single('eventdat5', Char)
        .single('eventdat6', Char)
        .single('eventdat4', Byte);

let episodeMapDataStruct = new Struct<any>()
    .array('shapeMap1', UInt16, l(128), USwap16Formatter)
    .array('shapeMap2', UInt16, l(128), USwap16Formatter)
    .array('shapeMap3', UInt16, l(128), USwap16Formatter)
    .array('map1', Byte, l(14*300))
    .array('map2', Byte, l(14*600))
    .array('map3', Byte, l(15*600));

let episodeMapStruct = new Struct<any>()
    .single('mapFile', Byte)
    .single('shapeFile', Byte)
    .single('mapX1', UInt16)
    .single('mapX2', UInt16)
    .single('mapX3', UInt16)
    .single('enemyMax', UInt16)
    .array('enemy', UInt16, la('enemyMax'))
    .single('eventsLength', UInt16)
    .array('events', episodeMapEventStruct, la('eventsLength'))
    .single('map', episodeMapDataStruct);

type Shape = {isEmpty: boolean, data: number[]};
let allShapesStruct = new Struct<{shapes: Shape[]}>()
    .array('shapes', new Struct<Shape>()
        .single('isEmpty', Byte, BooleanFormatter())
        .array('data', Byte, ({isEmpty}) => isEmpty ? 0 : 24 * 28), l(Number.MAX_SAFE_INTEGER));

const itemsDataFile = readFileSync(`data/tyrian.hdt`);
const d = ({buffer}: Buffer) => new DataView(buffer, 0, buffer.byteLength);
let episodes = [1, 2, 3, 4].map(episode => {
    let lvlData = readFileSync(`data/tyrian${episode}.lvl`);
    const mapsFileHeader = episodeMapsFileHeaderStruct.unpack(d(lvlData));

    let itemsData: Buffer;
    if (episode < 4) {
        let itemsOffset = itemsDataFile.readInt32LE(0);
        itemsData = itemsDataFile.slice(itemsOffset);
    }
    else {//episode 4 items data is stored in level file
        itemsData = lvlData.slice([...mapsFileHeader.offsets].pop());
    }

    let maps = mapsFileHeader.offsets.filter((v, idx) => 0 === idx%2 && idx < mapsFileHeader.length-2)
        .map(mapOffset => episodeMapStruct.unpack(d(lvlData), mapOffset));
    let shapes = maps.reduce((acc, map) => {
        let charBuffer = Buffer.alloc(1);
        charBuffer.writeUInt8(map.shapeFile);
        acc[map.shapeFile] = allShapesStruct.unpack(d(readFileSync(`data/shapes${charBuffer.toString('ascii').toLowerCase()}.dat`))).shapes;
        return acc;
    }, [])

    return {
        episode,
        header: mapsFileHeader,
        script: levelScriptStruct.unpack(d(readFileSync(`data/levels${episode}.dat`))).strings.map(s => s.data).join('\n'),
        maps,
        shapes,
        items: itemsStruct.unpack(d(itemsData))
    }
});

let map = episodes[0].maps[8];
const mapShape1At = (shapes: any, map: any, offset: number) => shapes[map.shapeFile][map.map.shapeMap1[map.map.map1[offset]]-1];
const mapShape2At = (shapes: any, map: any, offset: number) => shapes[map.shapeFile][map.map.shapeMap2[map.map.map2[offset]]-1];
const mapShape3At = (shapes: any, map: any, offset: number) => shapes[map.shapeFile][map.map.shapeMap3[map.map.map3[offset]]-1];
console.log(episodes[0].shapes[map.shapeFile][map.map.shapeMap2[map.map.map2[4]]-1]);
console.log(mapShape2At(episodes[0].shapes, episodes[0].maps[8], 4));

let pcxStruct = new Struct<{imagesLength: number, offsets: number[]}>()//tyrian.pic
    .single('imagesLength', UInt16)
    .array('offsets', Int32, la('imagesLength'));

let pcxFileData = readFileSync(`data/tyrian.pic`);

let picsHeader = pcxStruct.unpack(d(pcxFileData));
let pics: number[][] = [];
for (let i = 0, arr = [...picsHeader.offsets, pcxFileData.length]; i < arr.length-1; i++) {
    pics.push(new Struct<{img: number[]}>()
            .goto(() => arr[i])
            .array('img', Byte, l(arr[i+1]-arr[i])).unpack(d(pcxFileData)).img)
}
let img = pics[0], unpackedImg: number[] = [];

for (let i = 0, dPtr = 0, sPtr = 0; i < 320*200;) {
    if ((img[sPtr] & 0xC0) === 0xC0) {
        console.log(img[sPtr], (img[sPtr] & 0xC0), (img[sPtr] & 0x3F))
        i += (img[sPtr] & 0x3F);
        for (let j = 0; j < (img[sPtr] & 0x3F); j++) {
            unpackedImg[j + dPtr] = img[sPtr + 1];
        }
        dPtr += (img[sPtr] & 0x3F);
        sPtr += 2;
    } else {
        i++;
        unpackedImg[dPtr++] = img[sPtr++];
    }
    if (i && (i % 320 == 0)) {
        //s += screen->pitch - 320;
        console.log(320-(dPtr%320))
        dPtr += (320-(dPtr%320));
    }

}

*/
const spriteStruct = new Struct<any>()
    .single('hasData', Byte)
    .array('payload', new Struct<any>()
        .single('width', UInt16)
        .single('height', UInt16)
        .single('size', UInt16)
        .array('data', Byte, la('size')), ({hasData}) => hasData)
const spritesTableStruct = new Struct<any>()
    .single('count', UInt16)
    .array('sprites', spriteStruct, la('count'));
const mainShapesStruct = new Struct<{tablesCount: number, offsets: number[]}>()
    .single('tablesCount', UInt16)
    .array('offsets', UInt32, la('tablesCount'))
//tyrian.shp
const mainShapesData = new DataView(readFileSync('data/tyrian.shp').buffer);
const tables: any[] = [];
//const spritesTable = mainShapesStruct.unpack(mainShapesData).offsets.map(offset => spritesTableStruct.unpack(mainShapesData, offset));
mainShapesStruct.unpack(mainShapesData).offsets.map((offset, idx, offsets) => {
    switch (true) {
        case idx < 7:// fonts, interface, option sprites
            tables[idx] = spritesTableStruct.unpack(mainShapesData, offset).sprites;
            tables[idx].forEach((tySprite: any, id: number) => {
                if (!tySprite.hasData) return;
                let l = tySprite.payload[0].width * tySprite.payload[0].height;
                let t = new Array(l).fill(1);//empty transparent sprite
                for (let ptr = 0, i = 0; i < l;) {
                    switch (tySprite.payload[0].data[ptr]) {
                        case 0xFF: //transparent pixels; next value tells length
                            ptr++;
                            i += tySprite.payload[0].data[ptr];
                            break;
                        case 0xFE: //next row
                            i += (tySprite.payload[0].width - (i % tySprite.payload[0].width))
                            break;
                        case 0xFD: //one transparent
                            i++;
                            break;
                        default:
                            t[i] = tySprite.payload[0].data[ptr];
                            i++;
                            break;
                    }
                    ptr++;
                }
                tySprite.payload[0].tmp = tySprite.payload[0].data;
                tySprite.payload[0].data = t;
            })
    }
})
const FontSprite: number[] = [
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  26,  33,  60,  61,  62,  -1,  32,  64,  65,  63,  84,  29,  83,  28,  80, //  !"#$%&'()*+,-./
    79,  70,  71,  72,  73,  74,  75,  76,  77,  78,  31,  30,  -1,  85,  -1,  27, // 0123456789:;<=>?
    -1,   0,   1,   2,   3,   4,   5,   6,   7,   8,   9,  10,  11,  12,  13,  14, // @ABCDEFGHIJKLMNO
    15,  16,  17,  18,  19,  20,  21,  22,  23,  24,  25,  68,  82,  69,  -1,  -1, // PQRSTUVWXYZ[\]^_
    -1,  34,  35,  36,  37,  38,  39,  40,  41,  42,  43,  44,  45,  46,  47,  48, // `abcdefghijklmno
    49,  50,  51,  52,  53,  54,  55,  56,  57,  58,  59,  66,  81,  67,  -1,  -1, // pqrstuvwxyz{|}~⌂

    86,  87,  88,  89,  90,  91,  92,  93,  94,  95,  96,  97,  98,  99, 100, 101, // ÇüéâäàåçêëèïîìÄÅ
    102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, // ÉæÆôöòûùÿÖÜ¢£¥₧ƒ
    118, 119, 120, 121, 122, 123, 124, 125, 126,  -1,  -1,  -1,  -1,  -1,  -1,  -1, // áíóúñÑªº¿
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
    -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,  -1,
];
let sp = tables[1][FontSprite['Q'.charCodeAt(0)]].payload[0];
let s = '';
for (let i = 0; i < sp.width*sp.height; i++) {
    if (i%sp.width == 0) s+='\n'
    s += sp.data[i].toString().padStart(3);
}
console.log(s, ...tables[1].keys());

for (let i = 0; i < tables[0].length; i++) {
    console.log(`l ${tables[0].length} w ${tables[0][i].payload[0].width}h ${tables[0][i].payload[0].height}`);
}

Object.entries(process.memoryUsage()).forEach(item => console.log(`${item[0]}: ${(item[1] / 1024 / 1024).toFixed(4)} MB`))
