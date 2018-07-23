const getMarcItemText = xml => ({ tag, code }) => {
  const where = (...fxns) => el => fxns.every(fxn => fxn(el));

  try {
    // get first record's children
    return xml.children[0].children
      // find first datafield element
      .find(where(
        ({ name }) => name === 'datafield',
        ({ attributes }) => attributes.tag === tag),
      ).children
      // find corresponding subfield element
      .find(where(
        ({ name }) => name === 'subfield',
        ({ attributes }) => attributes.code === code,
      ))
      // get text
      .children[0].text.trim();
  } catch(err) { return undefined; }
};

const getTextFromMarcFields = xml => fields => {
  const textGetter = getMarcItemText(xml);

  return (
    fields
      .map(textGetter)
      .filter(el => el)
      .join(' ')
  );
};

const getFromMarc = xml => (...paramsList) => {
  const paramFields = {
    isbn: [{ tag: '020', code: 'a' }],
    issn: [{ tag: '022', code: 'a' }],
    author: [{ tag: '100', code: 'a'}],
    title: [{ tag: '245', code: 'a'}, { tag: '245', code: 'b'}]
  };

  const marcValueGetter = getTextFromMarcFields(xml);

  return (
    paramsList.reduce((merged, key) => {
      const val = marcValueGetter(paramFields[key]);
      return Object.assign(merged, { [key]: val });
    }, {})
  );
};

module.exports = {
  getFromMarc
};
