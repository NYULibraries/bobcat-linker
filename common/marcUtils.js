const getMarcItemText = (xml, { tag, code }) => {
  try {
    return xml
      // get first record's children
      .children[0].children
      // find first datafield element
      .find(el =>
        el.name === 'datafield' && el.attributes.tag === tag
      ).children
      // find corresponding subfield element
      .find(el =>
        el.name === 'subfield' && el.attributes.code === code
      )
      // get text
      .children[0].text.trim();
  } catch(err) { return ""; }
};

const getTextFromMarcFields = (xml, fields) =>
  fields
    .reduce((res, field) => `${res} ${getMarcItemText(xml, field)}`, "")
    .trim();

const getFromMarc = (xml, ...paramsList) => {
  const paramFields = {
    isbn: [{ tag: '020', code: 'a' }],
    issn: [{ tag: '022', code: 'a' }],
    author: [{ tag: '100', code: 'a'}],
    title: [{ tag: '245', code: 'a'}, { tag: '245', code: 'b'}]
  };

  return (
    paramsList.reduce((merged, key) => {
      const prop = getTextFromMarcFields(xml, paramFields[key]);
      return Object.assign(merged, { [key]: prop });
    }, {})
  );
};

module.exports = {
  getFromMarc
};
