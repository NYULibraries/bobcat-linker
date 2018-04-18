const LambdaTester = require('lambda-tester');
const persistent = require('../handler').persistent;

const rootURL = "http://bobcat.library.nyu.edu/primo-explore/search?query=";

const institutions = [
  'nyu',
  'ns',
  'cu',
  'nyuad',
  'nyush',
  'bhs',
  'nyhs',
  'hsl'
];

describe('persistent', () => {

  let lambda;
  beforeEach(() => {
    lambda = LambdaTester(persistent);
  });

  describe('institution view', () => {
    institutions.forEach((institution) => {
      it(`should handle ${institution} parameter`, (done) => {
        lambda.event({
          "resource": "/persistent",
          "path": "/persistent",
          "httpMethod": "GET",
          "queryStringParameters": {
            institution
          }
        })
        .expectResult(result => {
          expect(result.statusCode).toEqual(302);
          expect(result.headers.Location).toEqual(`${rootURL}&vid=${institution.toUpperCase()}`);
        })
        .verify(done);
      });
    });

    it('should default to nyu without an institution parameter', (done) => {
      lambda.event({
        "resource": "/persistent",
        "path": "/persistent",
        "httpMethod": "GET",
        "queryStringParameters": null
      })
      .expectResult(result => {
        expect(result.statusCode).toEqual(302);
        expect(result.headers.Location).toEqual(`${rootURL}&vid=NYU`);
      })
      .verify(done);
    });
  });

  describe('isbn', () => {

  });

});
