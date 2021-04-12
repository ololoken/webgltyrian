import {Rectangle} from "pixi.js"
import {PlayerGraphic} from "./Types";
import {TyShip} from "../Structs";

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

    items: [] = [];

    public constructor (x: number, y: number, ship: TyShip) {
        this.position = {x, y};

        this.ship = ship;
        this.shipGraphic = this.ship.shipGraphic-1;
    }
}
