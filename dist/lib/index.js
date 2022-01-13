"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ai = exports.Fir = exports.OperateResult = exports.Operation = exports.PointOnBoard = exports.Player = void 0;
/**
 * @description two player
 */
var Player;
(function (Player) {
    Player["WHITE"] = "WHITE";
    Player["BLACK"] = "BLACK";
    Player["SYSTEM"] = "SYSTEM";
})(Player = exports.Player || (exports.Player = {}));
/**
 * @description the state of board`s point
 */
var PointOnBoard;
(function (PointOnBoard) {
    PointOnBoard[PointOnBoard["EMPTY"] = 0] = "EMPTY";
    PointOnBoard[PointOnBoard["BLACK"] = 1] = "BLACK";
    PointOnBoard[PointOnBoard["WHITE"] = 2] = "WHITE";
})(PointOnBoard = exports.PointOnBoard || (exports.PointOnBoard = {}));
/**
 * @description type of operation
 */
var Operation;
(function (Operation) {
    Operation["INIT"] = "INIT";
    Operation["PUT"] = "PUT";
})(Operation = exports.Operation || (exports.Operation = {}));
/**
 * @description the result of operation
 */
var OperateResult;
(function (OperateResult) {
    OperateResult["SUCCESS"] = "SUCCESS";
    OperateResult["WIN"] = "WIN";
    OperateResult["ESIZE"] = "Wrong size(required an odd number bigger than 5)";
    OperateResult["EOUTOFRANGE"] = "out of range";
    OperateResult["ENOTEMPTY"] = "not empty";
    OperateResult["EOTHER"] = "strange error";
})(OperateResult = exports.OperateResult || (exports.OperateResult = {}));
/**
 * @description four directron of line
 */
var Direction;
(function (Direction) {
    Direction["xX"] = "xX";
    Direction["yY"] = "yY";
    Direction["xyXY"] = "xy-XY";
    Direction["xYXy"] = "xY-Xy";
})(Direction || (Direction = {}));
/**
 * @description fir class
 * @example
 * const fir = new Fir(7)
 * console.log(fir.board)  // fir.board stores current state of board
 * console.log(fir.record)  // fir.record stores all the operations
 */
var Fir = /** @class */ (function () {
    /**
     * @description 'x' is from top to bottom and 'y' is from left to right
     * @param size x = y = size
     */
    function Fir(size) {
        if (size === void 0) { size = 9; }
        /**
         * @description board[row][column]
         */
        this.board = [];
        /**
         * @description history records of operation
         */
        this.record = [];
        // throw error if the size is even or size is smaller than 5
        if (size % 2 === 0 || size < 5) {
            throw new Error(OperateResult.ESIZE);
        }
        // init the board whit all the point 'EMPTY'
        for (var w = 0; w < size; w++) {
            var _row = [];
            for (var h = 0; h < size; h++) {
                _row.push(PointOnBoard.EMPTY);
            }
            this.board.push(_row);
        }
        // record this operate (init)
        this._pushRecord(Player.SYSTEM, [size - 1, size - 1], Operation.INIT, false);
    }
    /**
     * @description one of the player put his chess on the board
     * @param x row (start from 1)
     * @param y column (start from 1)
     * @param operator player
     * @returns {[boolean, OperateResult.WIN | OperateResult.SUCCESS]} [result, reason]
     */
    Fir.prototype.putChess = function (x, y, operator) {
        // fix the offset
        x = x - 1;
        y = y - 1;
        // out of range
        if (x < 0 || x >= this.board.length || y < 0 || y >= this.board.length) {
            return [false, OperateResult.EOUTOFRANGE];
        }
        // there is already a chess on the point
        if (this.board[x][y] !== PointOnBoard.EMPTY) {
            return [false, OperateResult.ENOTEMPTY];
        }
        // black player
        else if (operator === Player.BLACK) {
            // this.board[x][y] = PointOnBoard.BLACK
            this.board[x].splice(y, 1, PointOnBoard.BLACK); // update this way so that 'Vue' can trace the change
            this._pushRecord(Player.BLACK, [x + 1, y + 1]);
            return [true, this._doCheck(x, y) ? OperateResult.WIN : OperateResult.SUCCESS];
        }
        // white player
        else if (operator === Player.WHITE) {
            // this.board[x][y] = PointOnBoard.WHITE
            this.board[x].splice(y, 1, PointOnBoard.WHITE); // update this way so that 'Vue' can trace the change
            this._pushRecord(Player.WHITE, [x + 1, y + 1]);
            return [true, this._doCheck(x, y) ? OperateResult.WIN : OperateResult.SUCCESS];
        }
        // any other
        else {
            return [false, OperateResult.EOTHER];
        }
    };
    // region some inner method
    /**
     * @description check if the player win after he put this chess
     * @protected
     * @param x row index (start from 0)
     * @param y column index (start from 0)
     * @returns {boolean} ifWin
     */
    Fir.prototype._doCheck = function (x, y) {
        var directions = [Direction.xX, Direction.yY, Direction.xyXY, Direction.xYXy];
        for (var i = 0; i < directions.length; i++) {
            var line = this._rowInDirection(x, y, directions[i]);
            if (this._maxContinue(line, [PointOnBoard.EMPTY]) >= 5) {
                return true;
            }
        }
        return false;
    };
    /**
     * @description return all the points in specific direction whose distance to target point is smaller than 5.
     * @param x target point`s row index (start from 0)
     * @param y target point`s column index (start from 0)
     * @param direction direction ['|', '—', '\', '/']
     * @protected
     */
    Fir.prototype._rowInDirection = function (x, y, direction) {
        var xMin = Math.max(0, x - 4);
        var xMax = Math.min(this.board.length - 1, x + 4);
        var yMin = Math.max(0, y - 4);
        var yMax = Math.min(this.board.length - 1, y + 4);
        var points = [];
        switch (direction) {
            case "xX":
                for (var i = xMin; i <= xMax; i++) {
                    points.push(this.board[i][y]);
                }
                return points;
            case "yY":
                for (var i = yMin; i <= yMax; i++) {
                    points.push(this.board[x][i]);
                }
                return points;
            case "xy-XY":
                var dis_xy = Math.min(x - xMin, y - yMin, 4); // top-left side
                var dis_XY = Math.min(xMax - x, yMax - y, 4); // bottom-right side
                for (var i = -dis_xy; i <= dis_XY; i++) {
                    points.push(this.board[x + i][y + i]);
                }
                return points;
            case "xY-Xy":
                var dis_xY = Math.min(x - xMin, yMax - y, 4); // top-right side
                var dis_Xy = Math.min(xMax - x, y - yMin, 4); // bottom-left side
                for (var i = -dis_xY; i <= dis_Xy; i++) {
                    points.push(this.board[x + i][y - i]);
                }
                return points;
            default:
                return points;
        }
    };
    /**
     * @description push a record of operation into the record store
     * @protected
     * @param player
     * @param operation
     * @param position
     * @param recoverable
     */
    Fir.prototype._pushRecord = function (player, position, operation, recoverable) {
        if (operation === void 0) { operation = Operation.PUT; }
        if (recoverable === void 0) { recoverable = true; }
        this.record.push({
            recoverable: recoverable,
            timestamp: Date.now(),
            board: JSON.stringify(this.board),
            detail: {
                player: player,
                operation: operation,
                position: position
            }
        });
    };
    /**
     * @description return the max count of continue item
     * @param line
     * @param except
     * @protected
     */
    Fir.prototype._maxContinue = function (line, except) {
        if (except === void 0) { except = []; }
        var continueList = [1];
        for (var i = 1; i < line.length; i++) {
            if (except.indexOf(line[i]) !== -1) {
                continueList.push(0);
            }
            else if (line[i] === line[i - 1]) {
                continueList[continueList.length - 1] += 1;
            }
            else {
                continueList.push(1);
            }
        }
        return Math.max.apply(Math, continueList);
    };
    return Fir;
}());
exports.Fir = Fir;
/**
 * @description an ai to play with you
 */
var Ai = /** @class */ (function () {
    // endregion
    function Ai(initBoard, initRole) {
        // region global (if can win)
        // an array to store way to win
        this.wins = [];
        // count for 'wins'
        this.winCount = 0;
        // endregion
        // region personal (player`s rate to win)
        this.blackWins = [];
        this.whiteWins = [];
        this.board = initBoard;
        this.boardSize = initBoard.length;
        this.role = initRole;
        // region solving 'wins'
        // 0. init 'wins'
        for (var i0 = 0; i0 < this.boardSize; i0++) {
            this.wins[i0] = [];
            for (var j0 = 0; j0 < this.boardSize; j0++) {
                this.wins[i0][j0] = [];
            }
        }
        // 1. wins for 'x-X' ( | )
        for (var i1 = 0; i1 < this.boardSize; i1++) {
            for (var j1 = 0; j1 < this.boardSize - 4; j1++) {
                for (var k1 = 0; k1 < 5; k1++) {
                    this.wins[i1][j1 + k1][this.winCount] = true;
                }
                this.winCount++;
            }
        }
        // 2. wins for 'y-Y' ( — )
        for (var i2 = 0; i2 < this.boardSize; i2++) {
            for (var j2 = 0; j2 < this.boardSize - 4; j2++) {
                for (var k2 = 0; k2 < 5; k2++) {
                    this.wins[j2 + k2][i2][this.winCount] = true;
                }
                this.winCount++;
            }
        }
        // 3. wins for 'xy-XY' ( \ )
        for (var i3 = 0; i3 < this.boardSize - 4; i3++) {
            for (var j3 = 0; j3 < this.boardSize - 4; j3++) {
                for (var k3 = 0; k3 < 5; k3++) {
                    this.wins[i3 + k3][j3 + k3][this.winCount] = true;
                }
                this.winCount++;
            }
        }
        // 4. wins for 'xY-Xy' ( / )
        for (var i4 = 0; i4 < this.boardSize - 4; i4++) {
            for (var j4 = this.boardSize - 1; j4 > 3; j4--) {
                for (var k4 = 0; k4 < 5; k4++) {
                    this.wins[i4 + k4][j4 - k4][this.winCount] = true;
                }
                this.winCount++;
            }
        }
        // endregion
        // region init 'blackWins' and 'whiteWins'
        for (var i = 0; i < this.winCount; i++) {
            this.blackWins[i] = 0;
            this.whiteWins[i] = 0;
        }
        // endregion
    }
    /**
     * @description once player put on a point, the ai should set this point as "can never win"
     * @param x start from 1
     * @param y start from 1
     */
    Ai.prototype.updateWins = function (x, y) {
        x = x - 1;
        y = y - 1;
        for (var k = 0; k < this.winCount; k++) {
            if (this.wins[x][y][k]) { // can win here
                (this.role === Player.BLACK ? this.whiteWins : this.blackWins)[k]++; // player`s wins ++
                (this.role === Player.BLACK ? this.blackWins : this.whiteWins)[k] = 6; // ai`s wins set to 6 (which means 'never')
                if ((this.role === Player.BLACK ? this.whiteWins : this.blackWins)[k] === 5) {
                    return [false, 'player win'];
                }
            }
        }
        return [true, 'continue'];
    };
    /**
     * @description simply use the AiringGo`s method to get the best point for next step
     * @returns {[number, number]} [x, y] the point to put (start from 1)
     */
    Ai.prototype.getBestPoint = function () {
        var whiteScore = this._emptyScoreContainer(); // an array to store white`s score
        var blackScore = this._emptyScoreContainer(); // an array to store black`s score
        var aiScore = this.role === Player.BLACK ? blackScore : whiteScore; // an alias point to ai`s score array
        var playerScore = this.role === Player.BLACK ? whiteScore : blackScore; // an alias point to player`s score array
        var _a = [0, 0], u = _a[0], v = _a[1]; // preset the point as [u, v] (of course it should be calculated later)
        var maxScore = 0; // try to get the best point with maxScore (current zero)
        for (var _x = 0; _x < this.boardSize; _x++) {
            for (var _y = 0; _y < this.boardSize; _y++) {
                if (this.board[_x][_y] === PointOnBoard.EMPTY) { // only if it is empty you can try to place here and get the score
                    // region get the score array ( number[][] )
                    for (var k = 0; k < this.winCount; k++) {
                        if (this.wins[_x][_y][k]) { // can win here
                            // region black`s score (base + bonus)
                            switch (this.blackWins[k]) {
                                case 1:
                                    blackScore[_x][_y] += 200 + (this.role === Player.BLACK ? 1 : 0) * 20;
                                    break;
                                case 2:
                                    blackScore[_x][_y] += 400 + (this.role === Player.BLACK ? 1 : 0) * 20;
                                    break;
                                case 3:
                                    blackScore[_x][_y] += 2000 + (this.role === Player.BLACK ? 1 : 0) * 100;
                                    break;
                                case 4:
                                    blackScore[_x][_y] += 10000 + (this.role === Player.BLACK ? 1 : 0) * 10000;
                                    break;
                                default:
                                    break;
                            }
                            // endregion
                            // region white`s score (base + bonus)
                            switch (this.whiteWins[k]) {
                                case 1:
                                    whiteScore[_x][_y] += 200 + (this.role === Player.WHITE ? 1 : 0) * 20;
                                    break;
                                case 2:
                                    whiteScore[_x][_y] += 400 + (this.role === Player.WHITE ? 1 : 0) * 20;
                                    break;
                                case 3:
                                    whiteScore[_x][_y] += 2000 + (this.role === Player.WHITE ? 1 : 0) * 100;
                                    break;
                                case 4:
                                    whiteScore[_x][_y] += 10000 + (this.role === Player.WHITE ? 1 : 0) * 10000;
                                    break;
                                default:
                                    break;
                            }
                            // endregion
                        }
                    }
                    // endregion
                    // region compare the score and get the best point
                    // there is another if-else in original code
                    // a better score for ai
                    if (aiScore[_x][_y] > maxScore) {
                        // update without think
                        maxScore = aiScore[_x][_y];
                        u = _x;
                        v = _y;
                    }
                    // a same score for ai
                    else if (aiScore[_x][_y] === maxScore) {
                        // choose the position where your opponent has fewer points
                        if (playerScore[_x][_y] > playerScore[u][v]) {
                            u = _x;
                            v = _y;
                        }
                    }
                    // endregion
                }
            }
        }
        return [u + 1, v + 1];
    };
    /**
     * @description create a empty can to store scores
     * @protected
     */
    Ai.prototype._emptyScoreContainer = function () {
        var scoreCan = [];
        for (var _x = 0; _x < this.boardSize; _x++) {
            scoreCan[_x] = [];
            for (var _y = 0; _y < this.boardSize; _y++) {
                scoreCan[_x][_y] = 0;
            }
        }
        return scoreCan;
    };
    return Ai;
}());
exports.Ai = Ai;
