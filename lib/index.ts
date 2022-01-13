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
export class Ai {
    // reference of board
    readonly board: PointOnBoard[][]
    // size of the board
    readonly boardSize: number
    // role of ai
    readonly role: Player.BLACK | Player.WHITE

    // region global (if can win)
    // an array to store way to win
    protected wins: (boolean|null|undefined)[][][] = []
    // count for 'wins'
    protected winCount = 0
    // endregion
    // region personal (player`s rate to win)
    protected blackWins: number[] = []
    protected whiteWins: number[] = []
    // endregion

    constructor(initBoard: PointOnBoard[][], initRole: Player.BLACK | Player.WHITE) {
        this.board = initBoard
        this.boardSize = initBoard.length
        this.role = initRole

        // region solving 'wins'
        // 0. init 'wins'
        for (let i0 = 0; i0 < this.boardSize; i0 ++) {
            this.wins[i0] = [];
            for (let j0 = 0; j0 < this.boardSize; j0 ++) {
                this.wins[i0][j0] = []
            }
        }
        // 1. wins for 'x-X' ( | )
        for (let i1 = 0; i1 < this.boardSize; i1 ++) {
            for (let j1 = 0; j1 < this.boardSize - 4; j1++) {
                for (let k1 = 0; k1 < 5; k1++) {
                    this.wins[i1][j1 + k1][this.winCount] = true;
                }
                this.winCount++;
            }
        }
        // 2. wins for 'y-Y' ( — )
        for (let i2 = 0; i2 < this.boardSize; i2 ++) {
            for (let j2 = 0; j2 < this.boardSize - 4; j2 ++) {
                for (let k2 = 0; k2 < 5; k2++) {
                    this.wins[j2 + k2][i2][this.winCount] = true;
                }
                this.winCount++;
            }
        }
        // 3. wins for 'xy-XY' ( \ )
        for (let i3 = 0; i3 < this.boardSize - 4; i3 ++) {
            for (let j3 = 0; j3 < this.boardSize - 4; j3 ++) {
                for (let k3 = 0; k3 < 5; k3 ++) {
                    this.wins[i3 + k3][j3 + k3][this.winCount] = true;
                }
                this.winCount++;
            }
        }
        // 4. wins for 'xY-Xy' ( / )
        for (let i4 = 0; i4 < this.boardSize - 4; i4 ++) {
            for (let j4 = this.boardSize - 1; j4 > 3; j4 --) {
                for (let k4 = 0; k4 < 5; k4 ++) {
                    this.wins[i4 + k4][j4 - k4][this.winCount] = true;
                }
                this.winCount++;
            }
        }
        // endregion
        // region init 'blackWins' and 'whiteWins'
        for(let i = 0; i < this.winCount; i ++) {
            this.blackWins[i] = 0
            this.whiteWins[i] = 0
        }
        // endregion
    }

    /**
     * @description once player put on a point, the ai should set this point as "can never win"
     * @param x start from 1
     * @param y start from 1
     */
    updateWins(x: number, y: number) {
        x = x - 1
        y = y - 1
        for(let k = 0; k < this.winCount; k ++) {
            if(this.wins[x][y][k]) {  // can win here
                (this.role === Player.BLACK ? this.whiteWins : this.blackWins)[k] ++  // player`s wins ++
                (this.role === Player.BLACK ? this.blackWins : this.whiteWins)[k] = 6  // ai`s wins set to 6 (which means 'never')
                if((this.role === Player.BLACK ? this.whiteWins : this.blackWins)[k] === 5) {
                    return [false, 'player win']
                }
            }
        }
        return [true, 'continue']
    }

    /**
     * @description simply use the AiringGo`s method to get the best point for next step
     * @returns {[number, number]} [x, y] the point to put (start from 1)
     */
    getBestPoint() {
        const whiteScore = this._emptyScoreContainer()  // an array to store white`s score
        const blackScore = this._emptyScoreContainer()  // an array to store black`s score
        const aiScore = this.role === Player.BLACK ? blackScore : whiteScore  // an alias point to ai`s score array
        const playerScore = this.role === Player.BLACK ? whiteScore : blackScore  // an alias point to player`s score array
        let [u, v] = [0, 0]  // preset the point as [u, v] (of course it should be calculated later)
        let maxScore = 0  // try to get the best point with maxScore (current zero)

        for(let _x = 0; _x < this.boardSize; _x ++) {
            for(let _y = 0; _y < this.boardSize; _y ++) {
                if(this.board[_x][_y] === PointOnBoard.EMPTY) {  // only if it is empty you can try to place here and get the score
                    // region get the score array ( number[][] )
                    for(let k = 0; k < this.winCount; k ++) {
                        if(this.wins[_x][_y][k]) {  // can win here
                            // region black`s score (base + bonus)
                            switch (this.blackWins[k]) {
                                case 1:
                                    blackScore[_x][_y] += 200 + (this.role === Player.BLACK ? 1 : 0) * 20
                                    break
                                case 2:
                                    blackScore[_x][_y] += 400 + (this.role === Player.BLACK ? 1 : 0) * 20
                                    break
                                case 3:
                                    blackScore[_x][_y] += 2000 + (this.role === Player.BLACK ? 1 : 0) * 100
                                    break
                                case 4:
                                    blackScore[_x][_y] += 10000 + (this.role === Player.BLACK ? 1 : 0) * 10000
                                    break
                                default:
                                    break
                            }
                            // endregion

                            // region white`s score (base + bonus)
                            switch (this.whiteWins[k]) {
                                case 1:
                                    whiteScore[_x][_y] += 200 + (this.role === Player.WHITE ? 1 : 0) * 20
                                    break
                                case 2:
                                    whiteScore[_x][_y] += 400 + (this.role === Player.WHITE ? 1 : 0) * 20
                                    break
                                case 3:
                                    whiteScore[_x][_y] += 2000 + (this.role === Player.WHITE ? 1 : 0) * 100
                                    break
                                case 4:
                                    whiteScore[_x][_y] += 10000 + (this.role === Player.WHITE ? 1 : 0) * 10000
                                    break
                                default:
                                    break
                            }
                            // endregion
                        }
                    }
                    // endregion

                    // region compare the score and get the best point

                    // there is another if-else in original code

                    // a better score for ai
                    if(aiScore[_x][_y] > maxScore) {
                        // update without think
                        maxScore = aiScore[_x][_y]
                        u = _x
                        v = _y
                    }
                    // a same score for ai
                    else if(aiScore[_x][_y] === maxScore) {
                        // choose the position where your opponent has fewer points
                        if(playerScore[_x][_y] > playerScore[u][v]) {
                            u = _x
                            v = _y
                        }
                    }
                    // endregion
                }
            }
        }

        return [u+1, v+1]
    }

    /**
     * @description create a empty can to store scores
     * @protected
     */
    protected _emptyScoreContainer() {
        const scoreCan: number[][] = []
        for(let _x = 0; _x < this.boardSize; _x ++) {
            scoreCan[_x] = []
            for(let _y = 0; _y < this.boardSize; _y ++) {
                scoreCan[_x][_y] = 0
            }
        }
        return scoreCan
    }
}