function Grid(size, previousState) {
  this.size = size;
  this.cells = previousState ? this.fromState(previousState) : this.empty();
}

// Build a grid of the specified size
Grid.prototype.empty = function () {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(null);
    }
  }

  return cells;
};

Grid.prototype.fromState = function (state) {
  var cells = [];

  for (var x = 0; x < this.size; x++) {
    var row = cells[x] = [];

    for (var y = 0; y < this.size; y++) {
      var tile = state[x][y];
      row.push(tile ? new Tile(tile.position, tile.value) : null);
    }
  }

  return cells;
};

// Find the first available random position
Grid.prototype.randomAvailableCell = function () {
  var cells = this.availableCells();

  if (cells.length) {
    return cells[Math.floor(Math.random() * cells.length)];
  }
};

Grid.prototype.worstAvailableTile = function () {
  var badCells = this.mostBlockingCells();
  var worstCell = this.highestNeighbourSumCell(badCells);
  var value = this.worstValueForCell(worstCell);
  return new Tile(worstCell, value);
}

Grid.prototype.mostBlockingCells = function () {
  var bestCells = [];
  var bestFullness = -1;

  var useRows = true;

  var checkRows = function() {
    for (var i = 0; i < this.size; i++) {
      // check i-th row
      var numInRow = this.cellsInRow(i);
      if (numInRow != this.size && numInRow > bestFullness) {
        bestFullness = numInRow;
        bestCells = this.emptyCellsInRow(i);
      }
    }
  }

  var checkColumns = function() {
    for (var i = 0; i < this.size; i++) {
      var numInCol = this.cellsInColumn(i);
      if (numInCol != this.size && numInCol > bestFullness) {
        bestFullness = numInCol;
        bestCells = this.emptyCellsInColumn(i);
      }
    }
  }

  if (this.numFullRows() < this.numFullColumns()) {
    checkColumns.apply(this);
  } else {
    checkRows.apply(this);
  }

  if (bestFullness == 0) {
    bestCells = this.availableCells();
  }

  return bestCells;
};

Grid.prototype.cellsInRow = function (row) {
  var numCells = 0;
  for (var x = 0; x < this.size; x++) {
    if (this.cells[x][row]) {
      numCells++;
    }
  }

  return numCells;
}

Grid.prototype.emptyCellsInRow = function (row) {
  cells = [];
  for (var x = 0; x < this.size; x++) {
    if (this.cells[x][row] == null) {
      cells.push({x: x, y: row});
    }
  }

  return cells;
}

Grid.prototype.numFullRows = function() {
  var count = 0;
  for (var i = 0; i < this.size; i++) {
    if (this.emptyCellsInRow(i) == this.size) {
      count++;
    }
  }

  return count;
}

Grid.prototype.cellsInColumn = function (col) {
  var numCells = 0;
  for (var y = 0; y < this.size; y++) {
    if (this.cells[col][y]) {
      numCells++;
    }
  }

  return numCells;
}

Grid.prototype.emptyCellsInColumn = function (col) {
  var cells = [];
  for (var y = 0; y < this.size; y++) {
    if (this.cells[col][y] == null) {
      cells.push({x: col, y: y});
    }
  }

  return cells;
}

Grid.prototype.numFullColumns = function() {
  var count = 0;
  for (var i = 0; i < this.size; i++) {
    if (this.emptyCellsInColumn(i) == this.size) {
      count++;
    }
  }

  return count;
}

// Returns the worst possible available tile
Grid.prototype.highestNeighbourSumCell = function (cells) {
  var highestNeigbourSum = -1;
  var bestCell = null;


  for (var i = 0; i < cells.length; i++) {
    var cell = cells[i];
    var neighbourSum = this.cellNeighbourSum(cell);

    if (neighbourSum > highestNeigbourSum) {
      highestNeigbourSum = neighbourSum;
      bestCell = cell;
    }
  }

  return bestCell;
};

Grid.prototype.cellNeighbourSum = function (cell) {
  var sum = 0;
  var neighbours = [
    {x: cell.x - 1, y: cell.y},
    {x: cell.x + 1, y: cell.y},
    {x: cell.x, y: cell.y + 1},
    {x: cell.x, y: cell.y - 1}
  ];

  for (var i = 0; i < neighbours.length; i++) {
    var neighbourContent = this.cellContent(neighbours[i]);
    if (neighbourContent) {
      sum += neighbourContent.value + 0.5;
    }
  }

  return sum;
}

Grid.prototype.worstValueForCell = function (cell) {
  var neighboursTwo = false;
  var neighboursFour = false;

  var neighbours = [
    {x: cell.x - 1, y: cell.y},
    {x: cell.x + 1, y: cell.y},
    {x: cell.x, y: cell.y + 1},
    {x: cell.x, y: cell.y - 1}
  ];

  for (var i = 0; i < neighbours.length; i++) {
    var neighbourContent = this.cellContent(neighbours[i]);
    if (neighbourContent) {
      if (neighbourContent.value == 2) {
        neighboursTwo = true;
      }

      if (neighbourContent.value == 4) {
        neighboursFour = true;
      }
    }
  }

  if (neighboursTwo && !neighboursFour) {
    return 4;
  }

  return 2;
}

Grid.prototype.availableCells = function () {
  var cells = [];

  this.eachCell(function (x, y, tile) {
    if (!tile) {
      cells.push({ x: x, y: y });
    }
  });

  return cells;
};

// Call callback for every cell
Grid.prototype.eachCell = function (callback) {
  for (var x = 0; x < this.size; x++) {
    for (var y = 0; y < this.size; y++) {
      callback(x, y, this.cells[x][y]);
    }
  }
};

// Check if there are any cells available
Grid.prototype.cellsAvailable = function () {
  return !!this.availableCells().length;
};

// Check if the specified cell is taken
Grid.prototype.cellAvailable = function (cell) {
  return !this.cellOccupied(cell);
};

Grid.prototype.cellOccupied = function (cell) {
  return !!this.cellContent(cell);
};

Grid.prototype.cellContent = function (cell) {
  if (this.withinBounds(cell)) {
    return this.cells[cell.x][cell.y];
  } else {
    return null;
  }
};

// Inserts a tile at its position
Grid.prototype.insertTile = function (tile) {
  this.cells[tile.x][tile.y] = tile;
};

Grid.prototype.removeTile = function (tile) {
  this.cells[tile.x][tile.y] = null;
};

Grid.prototype.withinBounds = function (position) {
  return position.x >= 0 && position.x < this.size &&
         position.y >= 0 && position.y < this.size;
};

Grid.prototype.serialize = function () {
  var cellState = [];

  for (var x = 0; x < this.size; x++) {
    var row = cellState[x] = [];

    for (var y = 0; y < this.size; y++) {
      row.push(this.cells[x][y] ? this.cells[x][y].serialize() : null);
    }
  }

  return {
    size: this.size,
    cells: cellState
  };
};
