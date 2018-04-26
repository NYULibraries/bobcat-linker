# bobcat-persistent-link

[![Coverage Status](https://coveralls.io/repos/github/NYULibraries/bobcat-linker/badge.svg?branch=feature%2Fcode_coverage)](https://coveralls.io/github/NYULibraries/bobcat-linker?branch=feature%2Fcode_coverage)

AWS Lambda functions for BobCat Persistent Linking

## persistent/?{query}

Returns a redirect HTTP response (302) with the corresponding URL in primo-explore according to the query parameters

* Function: `handler.persistent`
* Parameters
  * `institution`
  * `lcn`
  * `isbn`
  * `issn`

### Examples

ISBN/ISSN: Redirects to advanced-mode search view.
* `/persistent?isbn=abcd123456&institution=nyu` redirects to:
`{BASE_SEARCH_URL}?query=isbn,contains,abcd123456&mode=advanced&search_scope=nyu&vid=NYU`

LCN: redirect to Primo NUI's fulldisplay page.
* `/persistent?lcn=aleph_xyz987&institution=nyu` redirects to:
`{BASE_FULL_DISPLAY_URL}?&docid=aleph_xyz987&search_scope=nyu&vid=NYU`

## persistent/oclc?{query}

After fetching corresponding ISBN, ISSN, or title/author data from an OCLC record, returns a redirect HTTP response (302) with the corresponding URL in primo-explore according to the query parameters

* Function: `handler.oclc`
* Parameters:
  * institution
  * oclc

### Examples

OCLC record with ISBN/ISSN data:
* `/persistent?oclc=2468013579&institution=nyu` redirects to: `{BASE_SEARCH_URL}?query=isbn,contains,{fetched_isbn/issn}&mode=advanced&search_scope=nyu&vid=NYU`

OCLC record which lacks ISBN/ISSN data:
* `/persistent?oclc=2468013579&institution=nyu` redirects to: `{BASE_SEARCH_URL}?query=title,exact,{fetched_title},AND&query=creator,exact,{fetched_author}&mode=advanced&search_scope=nyu&vid=NYU`

### Todo:

Live demos
