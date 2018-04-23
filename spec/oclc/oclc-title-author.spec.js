const { BASE_SEARCH_URL, INSTITUTIONS, ADVANCED_MODE,
        BASE_API_URL } = require("../helpers/constants");
const { oclc } = require("../helpers/constants").lambdas;
const worldCatISSN = require('../helpers/worldcat-issn.fixture.js');
const nock = require('nock');
