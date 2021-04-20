import {Rectangle} from "pixi.js"
import {PlayerGraphic, PlayerShot} from "./Types";
import {MAP_TILE_WIDTH, PORT_CHANNEL, TyShip, TyWeapon} from "../Structs";
import {Audio} from "../Audio";
import {cache} from "../Resources";

export enum WeaponCode {
    SHOT_FRONT,
    SHOT_REAR,
    SHOT_LEFT_SIDEKICK,
    SHOT_RIGHT_SIDEKICK,
    SHOT_MISC,
    SHOT_P2_CHARGE,
    SHOT_P1_SUPERBOMB,
    SHOT_SPECIAL,
    SHOT_NORTSPARKS,
    SHOT_SPECIAL2
}

export class Player implements PlayerGraphic {
    cash: number = 0;
    position: {x: number, y: number} = {x: 0, y: 0};
    xc: number = 0;
    yc: number = 0;
    xAccel: number = 0;
    yAccel: number = 0;

    shipGraphic: number = 1;

    shapeBank: number = 8;
    banking: number = 0;
    private readonly ship: TyShip;
    public readonly hitArea = new Rectangle(0, 0, 0, 0);
    protected static readonly playerBounds: Rectangle = new Rectangle(MAP_TILE_WIDTH, 15, MAP_TILE_WIDTH*9, 155);

    items: [] = [];

    private readonly shotMultiPos: number[] = new Array(10).fill(0);
    private readonly shotRepeat: number[] = new Array(10).fill(0);
    private readonly shotDelay: number[] = new Array(10*8).fill(0);

    public readonly weapons: TyWeapon[] = [];

    public constructor (x: number, y: number, ship: TyShip, weaponMain: TyWeapon) {
        this.position = {x, y};

        this.ship = ship;
        this.weapons[WeaponCode.SHOT_FRONT] = weaponMain;
        console.log(this.weapons);
        this.shipGraphic = this.ship.shipGraphic-1;
    }

    update(keysPressed: { [p: string]: boolean }, step: number) {
        if (keysPressed['ArrowLeft']) {
            this.xAccel = Math.max(-2, this.xAccel-step);
        }
        if (keysPressed['ArrowRight']) {
            this.xAccel = Math.min(2, this.xAccel+step);
        }
        if (!keysPressed['ArrowLeft'] && !keysPressed['ArrowRight']) {
            this.xAccel = 0;
        }

        if (keysPressed['ArrowUp']) {
            this.yAccel = Math.max(-2, this.yAccel-step);
        }
        if (keysPressed['ArrowDown']) {
            this.yAccel = Math.min(2, this.yAccel+step);
        }
        if (!keysPressed['ArrowUp'] && !keysPressed['ArrowDown']) {
            this.yAccel = 0;
        }

        this.xc += step*this.xAccel;
        this.yc += step*this.yAccel;

        this.xc = Math.min(4, Math.max(-4, this.xc));
        this.yc = Math.min(4, Math.max(-4, this.yc));

        this.banking = Math.max(-2, Math.min(2, Math.floor(this.xc/2)));

        this.position.x += step*this.xc;
        this.position.y += step*this.yc;

        this.xc = Math.sign(this.xc)*(Math.max(0, Math.abs(this.xc)-0.45*step));
        this.yc = Math.sign(this.yc)*(Math.max(0, Math.abs(this.yc)-0.45*step));

        if (Player.playerBounds.x > this.position.x) {
            this.position.x = Player.playerBounds.x;
        }
        if (Player.playerBounds.y > this.position.y) {
            this.position.y = Player.playerBounds.y;
        }
        if (Player.playerBounds.x+Player.playerBounds.width < this.position.x) {
            this.position.x = Player.playerBounds.x+Player.playerBounds.width;
        }
        if (Player.playerBounds.y+Player.playerBounds.height < this.position.y) {
            this.position.y = Player.playerBounds.y+Player.playerBounds.height;
        }
    }

    public shotUpdate (id: number, shot: PlayerShot, step: number): void {
        this.shotDelay[id] -= step;
        if (this.shotDelay[id] <= 0) {
            this.shotDelay[id] = 0;
        }
        shot.shotXM += step*shot.shotXC;
        shot.position.x += step*shot.shotXM;
        if (shot.shotXM > 100) {
            if (shot.shotXM == 101) {
                shot.position.x -= 101;
            }
            else {
                shot.position.x -= 120;
            }
        }
        shot.shotYM += step*shot.shotYC;
        shot.position.y += step*shot.shotYM;
        if (shot.shotYM > 100) {
            shot.position.y -= 120;
        }

        if (shot.shotComplicated) {
            shot.shotDevX += step*shot.shotDirX;
            shot.position.x += step*shot.shotDevX;
            if (Math.abs(shot.shotDevX) >= shot.shotCirSizeX) {
                shot.shotDirX = -shot.shotDirX;
            }
            shot.shotDevY += step*shot.shotDirY;
            shot.position.y += step*shot.shotDevY;
            if (Math.abs(shot.shotDevY) >= shot.shotCirSizeY) {
                shot.shotDirY = -shot.shotDirY;
            }
        }

        switch (shot.trail) {
            case 255: break;
            case 98: break;//todo: draw trail using explosion
            default: break;//todo: draw trail using explosion
        }

        if (shot.aimAtEnemy) {
            shot.aimDelay -= step;
            if (shot.aimDelay <= 0) {
                shot.aimDelay = shot.aimDelayMax;
                let isActive = false; //todo: track if enemy is still active; try to retarget?
                if (isActive) {
                    shot.shotXM += step*Math.sign(shot.position.x-shot.aimAtEnemy.position.x);
                    shot.shotYM += step*Math.sign(shot.position.y-shot.aimAtEnemy.position.y);
                }
                else {
                    shot.shotXM += step*Math.sign(shot.shotXM);
                }
            }
        }

        shot.animationCycle += step;
        if (shot.animationCycle >= shot.shotAniMax) {
            shot.animationCycle = 0;
        }
    }

    public shotsCreate (code: WeaponCode, step: number, mouseX: number, mouseY: number): PlayerShot[] {
        let shots: PlayerShot[] = [];//console.log(this.weapons[code]);
        if (this.shotRepeat[code] > 0) {
            this.shotRepeat[code] -= step;
            return shots;
        }
        let id = this.shotDelay.filter(by => by <= 0).pop();
        if (id === undefined) {
            return shots;
        }
        for (let multi_i = 0; multi_i < this.weapons[code].multi; multi_i++) {
            if (this.shotMultiPos[code] == this.weapons[code].max || this.shotMultiPos[code] >= 8) {
                this.shotMultiPos[code] = 0;
            }

            let shot: PlayerShot = <PlayerShot>{id, position: {x: 0, y: 0}};
            shot.chainReaction = 0;
            shot.playerNumber = 1;
            shot.animationCycle = 0;
            shot.shotComplicated = this.weapons[code].circleSize != 0;

            if (this.weapons[code].circleSize == 0) {
                shot.shotDevX = 0;
                shot.shotDirX = 0;
                shot.shotDevY = 0;
                shot.shotDirY = 0;
                shot.shotCirSizeX = 0;
                shot.shotCirSizeY = 0;
            }
            else {
                let circleSize =this.weapons[code].circleSize;

                if (circleSize > 19) {
                    let circsize_mod20 = circleSize % 20;
                    shot.shotCirSizeX = circsize_mod20;
                    shot.shotDevX = circsize_mod20 >> 1;

                    circleSize /= 20;
                    shot.shotCirSizeY = circleSize;
                    shot.shotDevY = circleSize >> 1;
                }
                else {
                    shot.shotCirSizeX = circleSize;
                    shot.shotCirSizeY = circleSize;
                    shot.shotDevX = circleSize >> 1;
                    shot.shotDevY = circleSize >> 1;
                }
                shot.shotDirX = 1;
                shot.shotDirY = -1;
            }

            shot.trail = this.weapons[code].trail;

            if (this.weapons[code].attack[this.shotMultiPos[code]] > 99 && this.weapons[code].attack[this.shotMultiPos[code]] < 250) {
                shot.chainReaction = this.weapons[code].attack[this.shotMultiPos[code]]-100;
                shot.shotDmg = 1;
            }
            else {
                shot.shotDmg = this.weapons[code].attack[this.shotMultiPos[code]];
            }

            shot.shotBlastFilter = this.weapons[code].shipBlastFilter;

            let tmp_by = this.weapons[code].by[this.shotMultiPos[code]];

            shot.position = {
                x: this.position.x + this.weapons[code].bx[this.shotMultiPos[code]],
                y: this.position.y + tmp_by
            };

            shot.shotYC = -this.weapons[code].accelerationY;
            shot.shotXC = this.weapons[code].accelerationX;

            shot.shotXM = this.weapons[code].sx[this.shotMultiPos[code]];

            // Not sure what this field does exactly.
            let delay = this.weapons[code].delay[this.shotMultiPos[code]];

            if (delay == 121)
            {
                shot.trail = 0;
                delay = 255;
            }

            shot.graphic = [this.weapons[code].sg[this.shotMultiPos[code]]-1];
            if (shot.graphic[0] == 0) {
                this.shotDelay[id] = 0;
            }
            else {
                this.shotDelay[id] = delay;
            }
            switch (true) {
                case shot.graphic[0] > 60000: {
                    shot.shapeBank = 5;
                    shot.graphic[0] -= 60000;
                } break;
                case shot.graphic[0] > 1000: {
                    //todo: superpixels
                } break;
                case shot.graphic[0] >= 500: {
                    shot.shapeBank = 12;
                    shot.graphic[0] -= 500;
                } break;
                default: {
                    shot.shapeBank = 7;
                } break;
            }

            if (delay > 100 && delay < 120) {
                shot.shotAniMax = (delay - 100 + 1);
            }
            else {
                shot.shotAniMax = this.weapons[code].animation;
            }

            if (delay == 99 || delay == 98) {
                tmp_by = this.position.x - mouseX;
                if (tmp_by < -5) {
                    tmp_by = -5;
                }
                else if (tmp_by > 5) {
                    tmp_by = 5;
                }
                shot.shotXM += tmp_by;
            }

            if (delay == 99 || delay == 100) {
                tmp_by = this.position.y - mouseY - this.weapons[code].sy[this.shotMultiPos[code]];
                if (tmp_by < -4) {
                    tmp_by = -4;
                }
                else if (tmp_by > 4) {
                    tmp_by = 4;
                }
                shot.shotYM = tmp_by;
            }
            else if (this.weapons[code].sy[this.shotMultiPos[code]] == 98) {
                shot.shotYM = 0;
                shot.shotYC = -1;
            }
            else if (this.weapons[code].sy[this.shotMultiPos[code]] > 100) {
                shot.shotYM = this.weapons[code].sy[this.shotMultiPos[code]];
                shot.position.y -= this.position.y;
            }
            else {
                shot.shotYM = -this.weapons[code].sy[this.shotMultiPos[code]];
            }

            if (this.weapons[code].sx[this.shotMultiPos[code]] > 100) {
                shot.shotXM = this.weapons[code].sx[this.shotMultiPos[code]];
                //shot.position.x -= this.position.x;
                //if (shot.shotXM == 101) {
                //    shot.position.y -= this.position.y;
                //}
            }

            shot.position.y -= 7;
            shot.position.x -= 6;

            this.shotRepeat[code] = this.weapons[code].shotRepeat;
            this.shotMultiPos[code]++;
            shots.push(shot);

            if (this.weapons[code].sound > 0) {
                Audio.getInstance().enqueue(PORT_CHANNEL[code], cache.sfx[this.weapons[code].sound-1]);
            }
        }
        return shots;
    }

    public shotRemove(id: number): void {
        this.shotDelay[id] = 0;
    }
}
