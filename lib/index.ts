/**
 * @description two player
 */
export enum Player {
    'WHITE' = 'WHITE',
    'BLACK' = 'BLACK',
    'SYSTEM' = 'SYSTEM',
}
/**
 * @description the state of board`s point
 */
export enum PointOnBoard {
    'EMPTY' = 0,
    'BLACK' = 1,
    'WHITE' = 2,
}
/**
 * @description type of operation
 */
export enum Operation {
    'INIT' = 'INIT',
    'PUT' = 'PUT',
}
/**
 * @description the result of operation
 */
export enum OperateResult {
    'SUCCESS' = 'SUCCESS',
    'WIN' = 'WIN',
    'ESIZE' = 'Wrong size(required an odd number bigger than 5)',
    'EOUTOFRANGE' = 'out of range',
    'ENOTEMPTY' = 'not empty',
    'EOTHER' = 'strange error',
}
/**
 * @description four directron of line
 */
enum Direction {
    'xX' = 'xX',
    'yY' = 'yY',
    'xyXY' = 'xy-XY',
    'xYXy' = 'xY-Xy'
}
/**
 * @description all the operation in order
 */
export interface Record {
    recoverable: boolean  // if can be recovered
    timestamp: number  // timestamp: Date.now()
    board: string  // JSON.string(this.board)
    detail: {
        player: Player
        operation: Operation
        position: [number, number]
    }
}

/**
 * @description fir class
 * @example
 * const fir = new Fir(7)
 * console.log(fir.board)  // fir.board stores current state of board
 * console.log(fir.record)  // fir.record stores all the operations
 */
export class Fir {
    /**
     * @description board[row][column]
     */
    board: PointOnBoard[][] = []
    /**
     * @description history records of operation
     */
    record: Record[] = []

    /**
     * @description 'x' is from top to bottom and 'y' is from left to right
     * @param size x = y = size
     */
    constructor(size: number = 9) {
        // throw error if the size is even or size is smaller than 5
        if(size % 2 === 0 || size < 5) { throw new Error(OperateResult.ESIZE) }

        // init the board whit all the point 'EMPTY'
        for(let w = 0; w < size; w ++) {
            const _row: PointOnBoard[] = []
            for(let h = 0; h < size; h ++) {
                _row.push(PointOnBoard.EMPTY)
            }
            this.board.push(_row)
        }

        // record this operate (init)
        this._pushRecord(Player.SYSTEM, [size-1, size-1], Operation.INIT, false)
    }

    /**
     * @description one of the player put his chess on the board
     * @param x row (start from 1)
     * @param y column (start from 1)
     * @param operator player
     * @returns {[boolean, OperateResult.WIN | OperateResult.SUCCESS]} [result, reason]
     */
    putChess(x: number, y: number, operator: Player) {
        // fix the offset
        x = x - 1;
        y = y - 1

        // out of range
        if(x < 0 || x >= this.board.length || y < 0 || y >= this.board.length) {
            return [false, OperateResult.EOUTOFRANGE]
        }
        // there is already a chess on the point
        if(this.board[x][y] !== PointOnBoard.EMPTY) {
            return [false, OperateResult.ENOTEMPTY]
        }
        // black player
        else if(operator === Player.BLACK) {
            // this.board[x][y] = PointOnBoard.BLACK
            this.board[x].splice(y, 1, PointOnBoard.BLACK)  // update this way so that 'Vue' can trace the change
            this._pushRecord(Player.BLACK, [x+1, y+1])
            return [true, this._doCheck(x, y) ? OperateResult.WIN : OperateResult.SUCCESS]
        }
        // white player
        else if(operator === Player.WHITE) {
            // this.board[x][y] = PointOnBoard.WHITE
            this.board[x].splice(y, 1, PointOnBoard.WHITE)  // update this way so that 'Vue' can trace the change
            this._pushRecord(Player.WHITE, [x+1, y+1])
            return [true, this._doCheck(x, y) ? OperateResult.WIN : OperateResult.SUCCESS]
        }
        // any other
        else {
            return [false, OperateResult.EOTHER]
        }
    }

    // region some inner method
    /**
     * @description check if the player win after he put this chess
     * @protected
     * @param x row index (start from 0)
     * @param y column index (start from 0)
     * @returns {boolean} ifWin
     */
    protected _doCheck(x: number, y: number) {
        const directions: Direction[] = [Direction.xX, Direction.yY, Direction.xyXY, Direction.xYXy]
        for(let i = 0; i < directions.length; i ++) {
            const line = this._rowInDirection(x, y, directions[i])
            if (this._maxContinue(line, [PointOnBoard.EMPTY]) >= 5) {
                return true
            }
        }
        return false
    }

    /**
     * @description return all the points in specific direction whose distance to target point is smaller than 5.
     * @param x target point`s row index (start from 0)
     * @param y target point`s column index (start from 0)
     * @param direction direction ['|', '—', '\', '/']
     * @protected
     */
    protected _rowInDirection(x: number, y: number, direction: Direction) {
        const xMin = Math.max(0, x - 4)
        const xMax = Math.min(this.board.length - 1, x + 4)
        const yMin = Math.max(0, y - 4)
        const yMax = Math.min(this.board.length - 1, y + 4)

        const points: number[] = []

        switch(direction) {
            case "xX":
                for(let i = xMin; i <= xMax; i ++) {
                    points.push(this.board[i][y])
                }
                return points
            case "yY":
                for(let i = yMin; i <= yMax; i ++) {
                    points.push(this.board[x][i])
                }
                return points
            case "xy-XY":
                const dis_xy = Math.min(x - xMin, y - yMin, 4)  // top-left side
                const dis_XY = Math.min(xMax - x, yMax - y, 4)  // bottom-right side
                for(let i = -dis_xy; i <= dis_XY; i ++) {
                    points.push(this.board[x + i][y + i])
                }
                return points
            case "xY-Xy":
                const dis_xY = Math.min(x - xMin, yMax - y, 4)  // top-right side
                const dis_Xy = Math.min(xMax - x, y - yMin, 4)  // bottom-left side
                for(let i = -dis_xY; i <= dis_Xy; i ++) {
                    points.push(this.board[x + i][y - i])
                }
                return points
            default:
                return points
        }
    }

    /**
     * @description push a record of operation into the record store
     * @protected
     * @param player
     * @param operation
     * @param position
     * @param recoverable
     */
    protected _pushRecord(player: Player, position: [number, number], operation: Operation = Operation.PUT, recoverable = true) {
        this.record.push({
            recoverable,
            timestamp: Date.now(),
            board: JSON.stringify(this.board),
            detail: {
                player, operation, position
            }
        })
    }

    /**
     * @description return the max count of continue item
     * @param line
     * @param except
     * @protected
     */
    protected _maxContinue<T>(line: T[], except: T[] = []) {
        const continueList: number[] = [1]
        for(let i = 1; i < line.length; i ++) {
            if(except.indexOf(line[i]) !== -1) {
                continueList.push(0)
            }
            else if(line[i] === line[i - 1]) {
                continueList[continueList.length - 1] += 1
            }
            else {
                continueList.push(1)
            }
        }
        return Math.max(...continueList)
    }
    // endregion
}

/**
 * @description an ai to play with you
 */
export class AI {
    constructor() {
    }
}