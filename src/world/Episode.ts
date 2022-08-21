export class Episode {
    private readonly sections: {
        index: number,
        name: string,
        commands: {handler: (command: string) => void, command: string}[]
    }[] = [];

    public mapOrigin: number = 0;
    public maps: { planet: number, section: number }[] = [];

    public cubeMax: number = 0;
    public cubeList: number[] = [];

    public extraGame: boolean = false;
    public twoPlayerMode: boolean = false;
    public onePlayerAction: boolean = false;

    public levelMain: number = 0;
    public levelNext: number = 0;
    public levelSong: number = 0;
    public levelName: string = '';
    public levelFileNum: number = 0;
    public levelLoadOk: boolean = false;

    public gameJustLoaded: boolean = false;

    public bonusLevelCurrent: boolean = false;
    public normalBonusLevelCurrent: boolean = false;

    public levelTimer: boolean = false;
    public levelTimerCountdown: number = 0;

    public useLastBank: boolean = false;

    public jumpSection: boolean = false;

    public initialDifficulty: number = 0;

    public itemsAvailable: {
        ship: number[],
        weaponFront: number[],
        weaponRear: number[],
        power: number[],
        engine: number[],
        opts: number[][],
        armor: number[],
        shield: number[]
    } = {
        ship: [],
        weaponFront: [],
        weaponRear: [],
        power: [],
        engine: [],
        opts: [],
        armor: [],
        shield: []
    }

    constructor(script: string) {
        let lines = script.split('\n');
        let sectionIndex = 0;
        for (let i = 0, l = lines.length; i < l; i++) {
            switch (true) {
                case lines[i].length === 0: break;//skip empty lines
                case /\*\*(?<index>\d+)(?<name>[^\*]+)/.test(lines[i]): {//new section start
                    let header = lines[i].match(/\*\*(?<index>\d+)(?<name>[^\*]+)/)!.groups!;
                    sectionIndex = parseInt(header['index'], 10);
                    this.sections[sectionIndex] = {
                        index: sectionIndex,
                        name: header['name'],
                        commands: []
                    }
                } break;
                case /\].+\[/.test(lines[i]): {//command
                    switch (lines[i][1]) {
                        case 'A': //todo: animation
                            break;
                        case 'G': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                let mapData = command.split(/\s+/).splice(1).map(d => parseInt(d, 10));
                                this.mapOrigin = mapData[0];
                                this.maps = [];
                                for (let j = 0; j < mapData[1]; j++) {
                                    this.maps[j].planet = mapData[2 + j * 2];
                                    this.maps[j].section = mapData[3 + j * 2];
                                }
                            }, command: lines[i]});
                        } break;
                        case '?': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                this.cubeList = command.match(/\d+/g)!.map(d => parseInt(d, 10)).splice(1);
                            }, command: lines[i]})
                        } break;
                        case '!': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                this.cubeList = command.match(/\d+/g)!.map(d => parseInt(d, 10)).splice(1);
                            }, command: lines[i]});
                        } break;
                        case '+': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                let addCubes: number = command.match(/\d+/g)!.map(d => parseInt(d, 10)).pop()!;
                                this.cubeMax += addCubes;
                                this.cubeMax = Math.max(4, this.cubeMax);
                            }, command: lines[i]});
                        } break;
                        case 'g': {//todo: galaga mode
                        } break;
                        case 'x': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                this.extraGame = true;
                            }, command: lines[i]});
                        } break;
                        case 'e': {//todo: engage mode
                        } break;
                        case 'J': {//jump
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                this.levelMain = command.match(/\d+/g)!.map(d => parseInt(d, 10)).pop()!;
                                this.jumpSection = true;
                            }, command: lines[i]});
                        } break;
                        case '2': {//two-player section jump
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                if (this.twoPlayerMode || this.onePlayerAction) {
                                    this.levelMain = command.match(/\d+/g)!.map(d => parseInt(d, 10)).pop()!;
                                    this.jumpSection = true;
                                }
                            }, command: lines[i]});
                        } break;
                        case 'w': {//todo: Stalker 21.126 section jump
                        } break;
                        case 't': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                if (this.levelTimer || this.levelTimerCountdown == 0) {
                                    this.levelMain = command.match(/\d+/g)!.map(d => parseInt(d, 10)).pop()!;
                                    this.jumpSection = true;
                                }
                            }, command: lines[i]});
                        } break;
                        case 'l': {//todo: all players are gone jump
                        } break;
                        case 's': {//todo: save level
                        } break;
                        case 'b': {//todo: save game last level
                        } break;
                        case 'i': {//todo: set music track
                        } break;
                        case 'I': {//Load Items Available Information
                            let command: string[] = [];
                            do {command.push(lines[++i])} while (lines[i+1].length > 0)
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                for (let c = command.split('\n'), j = 0; j < c.length; j++) {
                                    let item = c[j].match(/(?<name>\w+)[^\d]+(?<d>[\d\s]+)/)!.groups! as {name: string, d: string};
                                    let items = item.d.split(/\s/).map(d => parseInt(d, 10));
                                    switch (item.name) {
                                        case 'Ship': this.itemsAvailable.ship = items; break;
                                        case 'WeapF': this.itemsAvailable.weaponFront = items; break;
                                        case 'WeapR': this.itemsAvailable.weaponRear = items; break;
                                        case 'Power': this.itemsAvailable.power = items; break;
                                        case 'Engine': this.itemsAvailable.engine = items; break;
                                        case 'Opt1': this.itemsAvailable.opts[0] = items; break;
                                        case 'Opt2': this.itemsAvailable.opts[1] = items; break;
                                        case 'Armor': this.itemsAvailable.armor = items; break;
                                        case 'Shield': this.itemsAvailable.shield = items; break;
                                    }
                                }
                            }, command: command.join('\n')})
                        } break;
                        case 'L': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                let parts = command.split(/\s+/);
                                this.levelNext = parseInt(parts[2], 10);
                                this.levelName = parts[3];
                                if (this.levelNext == 0) {
                                    this.levelNext = this.levelMain + 1;
                                }
                                this.levelSong = parseInt(parts[4], 10);
                                this.levelFileNum = parseInt(parts[5], 10);

                                this.levelLoadOk = true;
                                this.bonusLevelCurrent = command.length > 28 && command[28] == '$';
                                this.normalBonusLevelCurrent = command.length > 27 && command[27] == '$';
                                this.gameJustLoaded = false;
                            }, command: lines[i]});
                        } break;
                        case '@': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                this.useLastBank = !this.useLastBank;
                            }, command: lines[i]});
                        } break;
                        case 'Q': {//todo: load and display text and play next level

                        } break;
                        case 'P': {//todo: load and display PCX

                        } break;
                        case 'U': {//todo: load and display another PCX

                        } break;
                        case 'V': {//todo: load and display yet one another PCX

                        } break;
                        case 'R': {//todo: load and display yet another PCX

                        } break;
                        case 'C': {//todo: clear screen

                        } break;
                        case 'B': {//todo: blacken screen

                        } break;
                        case 'F': {//todo: fade-in screen

                        } break;
                        case 'W': {//todo: display warning
                        } break;
                        case 'H': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                if (this.initialDifficulty < 3) {
                                    this.levelMain = parseInt(command.match(/\d+/g)![0], 10);
                                    this.jumpSection = true;
                                }
                            }, command: lines[i]});
                        } break;
                        case 'h': {
                            this.sections[sectionIndex].commands.push({handler: (command: string): void => {
                                    if (this.initialDifficulty > 2) {
                                        //todo: load data
                                    }
                                }, command: lines[i]});
                        } break;
                        case 'S': {//todo: some stuff for network game

                        } break;
                        case 'n': {//todo: reset esc key status

                        } break;
                        case 'M': {//todo: play song

                        } break;
                    }

                } break;
            }
        }
    }
}
