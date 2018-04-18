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

  describe("null query", () => {
    it('should redirect to nyu search', (done) => {
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

  describe('institution view', () => {
    institutions.forEach((institution) => {
      it(`should redirect to ${institution} search`, (done) => {
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

    it('should redirect to nyu if institution invalid', (done) => {
      lambda.event({
        "resource": "/persistent",
        "path": "/persistent",
        "httpMethod": "GET",
        "queryStringParameters": {
          institution: "banana"
        }
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
