const chai = require("chai");
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

const { puzzlesAndSolutions } = require('../controllers/puzzle-strings.js');
const [puzzle, solution] = puzzlesAndSolutions[0];

suite('Functional Tests', () => {
  test('Solve a puzzle with valid puzzle string: POST /api/solve', function(done) {
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle })
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'solution');
        assert.equal(res.body.solution, solution);
        done();
      });
  });

  test('Solve a puzzle with missing puzzle string', done => {
    chai.request(server)
      .post('/api/solve')
      .send({})
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Required field missing' });
        done();
      });
  });

  test('Solve a puzzle with invalid characters', done => {
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: puzzle.replace('.', 'X') })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
  });

  test('Solve a puzzle with incorrect length', done => {
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: puzzle.slice(0, 80) })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
  });

  test('Solve a puzzle that cannot be solved', done => {
    const bad = '1'.repeat(81);
    chai.request(server)
      .post('/api/solve')
      .send({ puzzle: bad })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Puzzle cannot be solved' });
        done();
      });
  });

  test('Check a puzzle placement with all fields', done => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: '7' })
      .end((err, res) => {
        assert.deepEqual(res.body, { valid: true });
        done();
      });
  });

  test('Check a puzzle placement with single placement conflict', done => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: '5' })
      .end((err, res) => {
        assert.isFalse(res.body.valid);
        assert.deepEqual(res.body.conflict, ['row']);
        done();
      });
  });

  test('Check a puzzle placement with multiple placement conflicts', done => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: '8' })
      .end((err, res) => {
        assert.isFalse(res.body.valid);
        assert.includeMembers(res.body.conflict, ['row', 'column']);
        done();
      });
  });

  test('Check a puzzle placement with all placement conflicts', done => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'B2', value: '5' })
      .end((err, res) => {
        assert.isFalse(res.body.valid);
        assert.includeMembers(res.body.conflict, ['row', 'column', 'region']);
        done();
      });
  });

  test('Check a puzzle placement with missing required fields', done => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Required field(s) missing' });
        done();
      });
  });

  test('Check a puzzle placement with invalid characters', done => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: puzzle.replace('.', 'X'), coordinate: 'A1', value: '1' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Invalid characters in puzzle' });
        done();
      });
  });

  test('Check a puzzle placement with incorrect length', done => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle: puzzle.slice(0, 80), coordinate: 'A1', value: '1' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Expected puzzle to be 81 characters long' });
        done();
      });
  });

  test('Check a puzzle placement with invalid placement coordinate', done => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'Z9', value: '1' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Invalid coordinate' });
        done();
      });
  });

  test('Check a puzzle placement with invalid placement value', done => {
    chai.request(server)
      .post('/api/check')
      .send({ puzzle, coordinate: 'A1', value: '0' })
      .end((err, res) => {
        assert.deepEqual(res.body, { error: 'Invalid value' });
        done();
      });
  });
});
