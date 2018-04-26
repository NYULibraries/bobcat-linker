# bobcat-linker

[![Coverage Status](https://coveralls.io/repos/github/NYULibraries/bobcat-linker/badge.svg?branch=master)](https://coveralls.io/github/NYULibraries/bobcat-linker?branch=master)

AWS Lambda functions for redirects from bobcat permalinks.

## Configuration

### primo-explore

Configuration of views and base urls are handled via exported javascript objects in the `config/` directory.

### Environment

The following environment variables are used for deploying via [serverless](https://github.com/serverless/serverless).

* `LAMBDA_ROLE`: role arn with AWSLambdaBasicExecutionRole. (e.g. `arn:aws:iam::123456789:role/AWSLambdaBasicExecutionRole`)
* `AWS_ACCESS_KEY_ID`
* `AWS_SECRET_ACCESS_KEY`
* `STAGE`: `prod` or `dev`

`WORLDCAT_API_KEY` is fetched from the [SSM Parameter store](https://docs.aws.amazon.com/systems-manager/latest/userguide/systems-manager-paramstore.html) by serverless.

To upload a value to SSM Parameter store using AWS CLI:

```bash
aws ssm put-parameter --name WORLDCAT_API_KEY --value "12345abcdefg12345" --type String
```

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

## Usage

### persistent/?{query}

Returns a redirect HTTP response (302) with the corresponding URL in primo-explore according to the query parameters

* Function: `handler.persistent`
* Parameters
  * `institution`
  * `lcn`
  * `isbn`
  * `issn`

#### Examples

ISBN/ISSN: Redirects to advanced-mode search view.
* `/persistent?isbn=abcd123456&institution=nyu` redirects to:
`{BASE_SEARCH_URL}?query=isbn,contains,abcd123456&mode=advanced&search_scope=nyu&vid=NYU`

LCN: redirect to Primo NUI's fulldisplay page.
* `/persistent?lcn=aleph_xyz987&institution=nyu` redirects to:
`{BASE_FULL_DISPLAY_URL}?&docid=aleph_xyz987&search_scope=nyu&vid=NYU`

### persistent/oclc?{query}

After fetching corresponding ISBN, ISSN, or title/author data from an OCLC record, returns a redirect HTTP response (302) with the corresponding URL in primo-explore according to the query parameters

* Function: `handler.oclc`
* Parameters:
  * institution
  * oclc

#### Examples

OCLC record with ISBN/ISSN data:
* `/persistent?oclc=2468013579&institution=nyu` redirects to: `{BASE_SEARCH_URL}?query=isbn,contains,{fetched_isbn/issn}&mode=advanced&search_scope=nyu&vid=NYU`

OCLC record which lacks ISBN/ISSN data:
* `/persistent?oclc=2468013579&institution=nyu` redirects to: `{BASE_SEARCH_URL}?query=title,exact,{fetched_title},AND&query=creator,exact,{fetched_author}&mode=advanced&search_scope=nyu&vid=NYU`

### Todo:

- [ ] Live demos
- [ ] Handling Lambda errors with [state machines](https://docs.aws.amazon.com/step-functions/latest/dg/tutorial-handling-error-conditions.html) with [serverless step functions](https://github.com/horike37/serverless-step-functions)
