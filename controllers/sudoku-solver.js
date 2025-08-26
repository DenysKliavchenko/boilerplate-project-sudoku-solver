'use strict';

class SudokuSolver {
  validate(puzzleString) {
    if (puzzleString === undefined || puzzleString === null) {
      return { valid: false, error: 'Required field missing' };
    }
    if (/[^1-9.]/.test(puzzleString)) {
      return { valid: false, error: 'Invalid characters in puzzle' };
    }
    if (puzzleString.length !== 81) {
      return { valid: false, error: 'Expected puzzle to be 81 characters long' };
    }
    return { valid: true };
  }

  toGrid(puzzleString) {
    const grid = [];
    for (let r = 0; r < 9; r++) {
      grid.push(puzzleString.slice(r * 9, r * 9 + 9).split(''));
    }
    return grid;
  }

  fromGrid(grid) {
    return grid.map(row => row.join('')).join('');
  }

  withPlacement(puzzleString, row, column, value) {
    const grid = this.toGrid(puzzleString);
    grid[row][column] = String(value);
    return this.fromGrid(grid);
  }

  checkRowPlacement(puzzleString, row, column, value) {
    const grid = this.toGrid(puzzleString);
    const v = String(value);

    try {
      const rowData = grid[row].join('');
      console.log('[checkRowPlacement]', { row, column, value: v, rowData });
    } catch (_) {}

    for (let c = 0; c < 9; c++) {
      if (c === column) continue;
      if (grid[row][c] === v) {
        try { console.log('[checkRowPlacement] DUP at', { r: row, c, cell: grid[row][c] }); } catch (_) {}
        return false;
      }
    }
    return true;
  }

  checkColPlacement(puzzleString, row, column, value) {
    const grid = this.toGrid(puzzleString);
    const v = String(value);

    try {
      const colData = [];
      for (let r = 0; r < 9; r++) colData.push(grid[r][column]);
      console.log('[checkColPlacement]', { row, column, value: v, colData: colData.join('') });
    } catch (_) {}

    for (let r = 0; r < 9; r++) {
      if (r === row) continue;
      if (grid[r][column] === v) {
        try { console.log('[checkColPlacement] DUP at', { r, c: column, cell: grid[r][column] }); } catch (_) {}
        return false;
      }
    }
    return true;
  }

  checkRegionPlacement(puzzleString, row, column, value) {
    const grid = this.toGrid(puzzleString);
    const v = String(value);
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(column / 3) * 3;

    try {
      const regionRows = [];
      for (let r = br; r < br + 3; r++) regionRows.push(grid[r].slice(bc, bc + 3).join(''));
      console.log('[checkRegionPlacement]', { row, column, value: v, blockTopLeft: [br, bc], blockData: regionRows });
    } catch (_) {}

    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if (r === row && c === column) continue;
        if (grid[r][c] === v) {
          try { console.log('[checkRegionPlacement] DUP at', { r, c, cell: grid[r][c] }); } catch (_) {}
          return false;
        }
      }
    }
    return true;
  }

  isConsistent(puzzleString) {
    const grid = this.toGrid(puzzleString);
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const v = grid[r][c];
        if (v === '.') continue;
        grid[r][c] = '.';
        const snapshot = this.fromGrid(grid);
        const ok =
          this.checkRowPlacement(snapshot, r, c, v) &&
          this.checkColPlacement(snapshot, r, c, v) &&
          this.checkRegionPlacement(snapshot, r, c, v);
        grid[r][c] = v;
        if (!ok) return false;
      }
    }
    return true;
  }

  candidatesFor(grid, row, column) {
    const present = new Set();

    for (let c = 0; c < 9; c++) {
      if (grid[row][c] !== '.') present.add(grid[row][c]);
    }
    for (let r = 0; r < 9; r++) {
      if (grid[r][column] !== '.') present.add(grid[r][column]);
    }
    const br = Math.floor(row / 3) * 3;
    const bc = Math.floor(column / 3) * 3;
    for (let r = br; r < br + 3; r++) {
      for (let c = bc; c < bc + 3; c++) {
        if (grid[r][c] !== '.') present.add(grid[r][c]);
      }
    }

    const candidates = [];
    for (let n = 1; n <= 9; n++) {
      const ch = String(n);
      if (!present.has(ch)) candidates.push(ch);
    }
    return candidates;
  }

  solve(puzzleString) {
    const v = this.validate(puzzleString);
    if (!v.valid) return { error: v.error };

    if (!this.isConsistent(puzzleString)) {
      return { error: 'Puzzle cannot be solved' };
    }

    const grid = this.toGrid(puzzleString);

    const trySolve = () => {
      let best = null;
      let bestCandidates = null;

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === '.') {
            const cand = this.candidatesFor(grid, r, c);
            if (cand.length === 0) return false;
            if (!best || cand.length < bestCandidates.length) {
              best = [r, c];
              bestCandidates = cand;
              if (cand.length === 1) break;
            }
          }
        }
        if (best && bestCandidates.length === 1) break;
      }

      if (!best) return true;

      const [r, c] = best;
      for (const ch of bestCandidates) {
        const current = this.fromGrid(grid);
        if (
          this.checkRowPlacement(current, r, c, ch) &&
          this.checkColPlacement(current, r, c, ch) &&
          this.checkRegionPlacement(current, r, c, ch)
        ) {
          grid[r][c] = ch;
          if (trySolve()) return true;
          grid[r][c] = '.';
        }
      }

      return false;
    };

    const solvable = trySolve();
    if (!solvable) return { error: 'Puzzle cannot be solved' };
    return { solution: this.fromGrid(grid) };
  }
}

module.exports = SudokuSolver;
