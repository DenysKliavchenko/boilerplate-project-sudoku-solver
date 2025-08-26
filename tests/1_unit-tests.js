const chai = require('chai');
const assert = chai.assert;

const SudokuSolver = require('../controllers/sudoku-solver.js');
const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');

suite('Unit Tests', () => {
  const solver = new SudokuSolver();
  const [puzzle, solution] = puzzlesAndSolutions[0];

  test('Logic handles a valid puzzle string of 81 characters', () => {
    assert.deepEqual(solver.validate(puzzle), { valid: true });
  });

  test('Logic handles a puzzle string with invalid characters (not 1-9 or .)', () => {
    const res = solver.validate(puzzle.replace('.', 'X'));
    assert.deepEqual(res, { valid: false, error: 'Invalid characters in puzzle' });
  });

  test('Logic handles a puzzle string that is not 81 characters in length', () => {
    const res = solver.validate(puzzle.slice(0, 80));
    assert.deepEqual(res, { valid: false, error: 'Expected puzzle to be 81 characters long' });
  });

  test('Logic handles a valid row placement', () => {
    assert.isTrue(solver.checkRowPlacement(solver.withPlacement(puzzle, 0, 0, '7'), 0, 0, '7'));
  });

  test('Logic handles an invalid row placement', () => {
    assert.isFalse(solver.checkRowPlacement(solver.withPlacement(puzzle, 0, 0, '5'), 0, 0, '5'));
  });

  test('Logic handles a valid column placement', () => {
    assert.isTrue(solver.checkColPlacement(solver.withPlacement(puzzle, 0, 0, '7'), 0, 0, '7'));
  });

  test('Logic handles an invalid column placement', () => {
    assert.isFalse(solver.checkColPlacement(solver.withPlacement(puzzle, 0, 0, '8'), 0, 0, '8'));
  });

  test('Logic handles a valid region (3x3 grid) placement', () => {
    assert.isTrue(solver.checkRegionPlacement(solver.withPlacement(puzzle, 1, 1, '7'), 1, 1, '7'));
  });

  test('Logic handles an invalid region (3x3 grid) placement', () => {
    assert.isFalse(solver.checkRegionPlacement(solver.withPlacement(puzzle, 1, 1, '5'), 1, 1, '5'));
  });

  test('Valid puzzle strings pass the solver', () => {
    const out = solver.solve(puzzle);
    assert.property(out, 'solution');
    assert.equal(out.solution.length, 81);
  });

  test('Invalid puzzle strings fail the solver', () => {
    const out = solver.solve(puzzle.replace('.', 'X'));
    assert.deepEqual(out, { error: 'Invalid characters in puzzle' });
  });

  test('Solver returns the expected solution for an incomplete puzzle', () => {
    const out = solver.solve(puzzle);
    assert.equal(out.solution, solution);
  });
});
