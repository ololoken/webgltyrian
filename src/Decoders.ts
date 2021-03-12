import {ItemsFormatter, StringFormatter} from "@ololoken/struct";
import {Palette, TyShape} from "./Structs";

export const PascalDecryptFormatter = (key: number[]) : ItemsFormatter<number, string> => (data) => {
    for (let i = data.length-1, l = key.length; i >= 0; --i) {
        data[i] ^= key[i%l];
        data[i] ^= data[i-1];
    }
    return StringFormatter({encoding: 'ascii'})(data);
}

export const PaletteDecoder = (pals: Palette[]) => pals.reduce((table: number[][][], {colors}) => {
    // The VGA hardware palette used only 6 bits per component, so the values need to be rescaled to
    // 8 bits. The naive way to do this is to simply do (c << 2), padding it with 0's, however this
    // makes the maximum value 252 instead of the proper 255. A trick to fix this is to use the upper 2
    // bits of the original value instead. This ensures that the value goes to 255 as the original goes
    // to 63.
    // And I'm too lazy to move it to the PaletteShader
    // todo: move to PaletteShader
    table.push(colors.map(color => [((color.r << 2) | (color.r >> 4)),
                                    ((color.g << 2) | (color.g >> 4)),
                                    ((color.b << 2) | (color.b >> 4))]));
    return table;
}, []).flat(2);

export const TyShapeDecoder: (tyShape: TyShape) => TyShape = tyShape => {
    //unpack shape data
    if (tyShape.hasData) {
        let [pl] = tyShape.payload;
        let l = pl.width * pl.height;
        let t = new Array(l).fill(0);//empty transparent sprite
        for (let ptr = 0, i = 0; i < l;) {
            switch (pl.data[ptr]) {
                case 0xFF: //transparent pixels; next value tells length
                    ptr++;
                    i += pl.data[ptr];
                    break;
                case 0xFE: //next row
                    i += (pl.width - (i % pl.width))
                    break;
                case 0xFD: //one transparent
                    i++;
                    break;
                default:
                    t[i] = pl.data[ptr];
                    i++;
                    break;
            }
            ptr++;
        }
        pl.data = t;
    }
    return tyShape;
}

export const TyShapeW12Decoder: (data: number[]) => TyShape = data => {
    let unpacked: number[] = [],
        height = 0;
    for (let ptr = 0; data[ptr] != 0x0F && ptr < data.length; ++ptr) {
        for (let i = 0; i < (data[ptr] & 0x0F); i++) unpacked.push(0);//set transparent pixels
        let count = (data[ptr] & 0xF0) >> 4;
        for (let i = 0; i < count; i++) unpacked.push(data[++ptr]);//copy N pixels with value following current position
        height++;
    }
    return {hasData: unpacked.length, payload: [{width: 12, height: height, size: data.length, data: unpacked}]};
}
