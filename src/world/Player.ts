import {Rectangle} from "pixi.js"
import {PlayerGraphic} from "./Types";
import {MAP_TILE_WIDTH, TyShip} from "../Structs";

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

    public constructor (x: number, y: number, ship: TyShip) {
        this.position = {x, y};

        this.ship = ship;
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
}
