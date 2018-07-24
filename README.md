# bobcat-linker

[![Coverage Status](https://coveralls.io/repos/github/NYULibraries/bobcat-linker/badge.svg?branch=master)](https://coveralls.io/github/NYULibraries/bobcat-linker?branch=master)

AWS Lambda functions for redirects from bobcat permalinks.

## Configuration

Configuration of views and base urls are handled via `JSON` objects in the `config/` directory.

## Testing

locally
```bash
yarn test
```

or via docker:
```
docker-compose run test
```

Coverage reports are generated with
```bash
yarn coverage
```
& uploaded to coveralls.io with:
```bash
COVERALLS_REPO_TOKEN={token} yarn coveralls
```

or, via docker:
```bash
COVERALLS_REPO_TOKEN={token} docker-compose run test yarn coveralls
```

## Deploy

locally:
```bash
yarn deploy
```

docker:
```bash
docker-compose run deploy
```

### Environment

The following environment variables are used for deploying via [serverless](https://github.com/serverless/serverless).

* `LAMBDA_ROLE`: role arn with AWSLambdaBasicExecutionRole. (e.g. `arn:aws:iam::123456789:role/AWSLambdaBasicExecutionRole`)
* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `STAGE`: `prod` or `dev`
* `WORLDCAT_API_KEY`

Note: to upload a value to SSM Parameter store using AWS CLI:
```bash
aws ssm put-parameter --name WORLDCAT_API_KEY --value "12345abcdefg12345" --type String
```

## Usage

### persistent/?{query}

Returns a redirect HTTP response (302) with the corresponding URL in primo-explore according to the query parameters

* Function: `handler.persistent`
* Parameters
  * `institution`
  * `lcn`
  * `isbn`
  * `issn`
  * `oclc`
* On error: Redirects to Primo New UI search page of corresponding institution, or to default institution (NYU) view search page if institution parameter is missing.

#### Examples

ISBN/ISSN: Redirects to advanced-mode search view.
* `/persistent?isbn=9781784392406` redirects to:
`{{ BASE_SEARCH_URL }}?query=isbn,contains,abcd123456&mode=advanced&search_scope=nyu&vid=NYU`

[Live link](https://xsxfl2h9e2.execute-api.us-east-1.amazonaws.com/dev/persistent?isbn=9781784392406&institution=nyu)

LCN: redirect to Primo NUI's fulldisplay page of item.
* `/persistent?lcn=nyu_aleph005819529` redirects to:
`{{ BASE_FULL_DISPLAY_URL }}?&docid=nyu_aleph005819529&search_scope=nyu&vid=NYU`

[Live link](https://xsxfl2h9e2.execute-api.us-east-1.amazonaws.com/dev/persistent?lcn=nyu_aleph005819529&institution=nyu)

OCLC record with corresponding ISBN/ISSN data. ISBN/ISSN lookups are handled through the [WorldCat Metadata API](https://www.oclc.org/developer/develop/web-services/worldcat-metadata-api.en.html)
* `/persistent?oclc=915038328` redirects to: `{{ BASE_SEARCH_URL }}?query=isbn,contains,{{ fetched isbn/issn }}&mode=advanced&search_scope=nyu&vid=NYU`

[Live link](https://xsxfl2h9e2.execute-api.us-east-1.amazonaws.com/dev/persistent?oclc=915038328&institution=nyu)

OCLC record with corresponding title and/or author data. Title and author lookups are handled through the [WorldCat Metadata API](https://www.oclc.org/developer/develop/web-services/worldcat-metadata-api.en.html)
* `/persistent?oclc=732098558` redirects to: `{{ BASE_SEARCH_URL }}?query=title,exact,{{ fetched_title }},AND&query=creator,exact,{{ fetched_author }}&mode=advanced&search_scope=nyu&vid=NYU`

[Live link](https://xsxfl2h9e2.execute-api.us-east-1.amazonaws.com/dev/persistent?oclc=732098558&institution=nyu)

### Library.nyu.edu implementation

[See the Wiki](https://github.com/NYULibraries/bobcat-linker/wiki/BobCat-Persistent-Linking)

### Todo:

- [x] Live demos
- [ ] Handling Lambda errors with [state machines](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-handling-error-conditions.html) with [serverless step functions](https://github.com/horike37/serverless-step-functions)
