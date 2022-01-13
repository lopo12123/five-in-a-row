/**
 * @description two player
 */
export declare enum Player {
    'WHITE' = "WHITE",
    'BLACK' = "BLACK",
    'SYSTEM' = "SYSTEM"
}
/**
 * @description the state of board`s point
 */
export declare enum PointOnBoard {
    'EMPTY' = 0,
    'BLACK' = 1,
    'WHITE' = 2
}
/**
 * @description type of operation
 */
export declare enum Operation {
    'INIT' = "INIT",
    'PUT' = "PUT"
}
/**
 * @description the result of operation
 */
export declare enum OperateResult {
    'SUCCESS' = "SUCCESS",
    'WIN' = "WIN",
    'ESIZE' = "Wrong size(required an odd number bigger than 5)",
    'EOUTOFRANGE' = "out of range",
    'ENOTEMPTY' = "not empty",
    'EOTHER' = "strange error"
}
/**
 * @description four directron of line
 */
declare enum Direction {
    'xX' = "xX",
    'yY' = "yY",
    'xyXY' = "xy-XY",
    'xYXy' = "xY-Xy"
}
/**
 * @description all the operation in order
 */
export interface Record {
    recoverable: boolean;
    timestamp: number;
    board: string;
    detail: {
        player: Player;
        operation: Operation;
        position: [number, number];
    };
}
/**
 * @description fir class
 * @example
 * const fir = new Fir(7)
 * console.log(fir.board)  // fir.board stores current state of board
 * console.log(fir.record)  // fir.record stores all the operations
 */
export declare class Fir {
    /**
     * @description board[row][column]
     */
    board: PointOnBoard[][];
    /**
     * @description history records of operation
     */
    record: Record[];
    /**
     * @description 'x' is from top to bottom and 'y' is from left to right
     * @param size x = y = size
     */
    constructor(size?: number);
    /**
     * @description one of the player put his chess on the board
     * @param x row (start from 1)
     * @param y column (start from 1)
     * @param operator player
     * @returns {[boolean, OperateResult.WIN | OperateResult.SUCCESS]} [result, reason]
     */
    putChess(x: number, y: number, operator: Player): (boolean | OperateResult)[];
    /**
     * @description check if the player win after he put this chess
     * @protected
     * @param x row index (start from 0)
     * @param y column index (start from 0)
     * @returns {boolean} ifWin
     */
    protected _doCheck(x: number, y: number): boolean;
    /**
     * @description return all the points in specific direction whose distance to target point is smaller than 5.
     * @param x target point`s row index (start from 0)
     * @param y target point`s column index (start from 0)
     * @param direction direction ['|', '—', '\', '/']
     * @protected
     */
    protected _rowInDirection(x: number, y: number, direction: Direction): number[];
    /**
     * @description push a record of operation into the record store
     * @protected
     * @param player
     * @param operation
     * @param position
     * @param recoverable
     */
    protected _pushRecord(player: Player, position: [number, number], operation?: Operation, recoverable?: boolean): void;
    /**
     * @description return the max count of continue item
     * @param line
     * @param except
     * @protected
     */
    protected _maxContinue<T>(line: T[], except?: T[]): number;
}
/**
 * @description an ai to play with you
 */
export declare class Ai {
    readonly board: PointOnBoard[][];
    readonly boardSize: number;
    readonly role: Player.BLACK | Player.WHITE;
    protected wins: (boolean | null | undefined)[][][];
    protected winCount: number;
    protected blackWins: number[];
    protected whiteWins: number[];
    constructor(initBoard: PointOnBoard[][], initRole: Player.BLACK | Player.WHITE);
    /**
     * @description once player put on a point, the ai should set this point as "can never win"
     * @param x start from 1
     * @param y start from 1
     */
    updateWins(x: number, y: number): (string | boolean)[];
    /**
     * @description simply use the AiringGo`s method to get the best point for next step
     * @returns {[number, number]} [x, y] the point to put (start from 1)
     */
    getBestPoint(): number[];
    /**
     * @description create a empty can to store scores
     * @protected
     */
    protected _emptyScoreContainer(): number[][];
}
export {};
