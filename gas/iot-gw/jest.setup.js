// jest.setup.js

// PropertiesService モック
const mockGetProperty = jest.fn();
const mockGetProperties = jest.fn();
const mockSetProperty = jest.fn();

global.PropertiesService = {
  getScriptProperties: () => ({
    getProperty: mockGetProperty,
    getProperties: mockGetProperties,
    setProperty: mockSetProperty,
  })
};

// UrlFetchApp モック
global.UrlFetchApp = {
  fetch: jest.fn((url) => ({
    getContentText: () => `Mock response from ${url}`,
    getResponseCode: () => 200,
  })),
};

// HtmlService モック
global.HtmlService = {
  createHtmlOutput: jest.fn((content) => ({
    setTitle: jest.fn(),
    append: jest.fn(),
    getContent: () => content,
  })),
  createHtmlOutputFromFile: jest.fn(),
};


// ContentService モック
const textOutputMock = {
  content: '',
  mimeType: null,
  getContent: () => {
    return textOutputMock.content;
  },
  setMimeType: (mime) => {
    textOutputMock.mimeType = mime;
    return textOutputMock;
  },
}

global.ContentService = {
  // jest.fn() を使わず、直接関数として定義してみる
  createTextOutput: (content) => {
    textOutputMock.content = content;
    return textOutputMock;
  },
  MimeType: {
    JSON: "application/json",
  },
};

// cCryptoGS モック
global.cCryptoGS = {
  Cipher: jest.fn().mockReturnValue()
};

// Utilities モック
global.Utilities = {
  computeHmacSignature: jest.fn(),
  base64Encode: jest.fn(),
  getUuid: jest.fn(),
  MacAlgorithm: {
    HMAC_SHA_256: 'HMAC_SHA_256',
    HMAC_SHA_512: 'HMAC_SHA_512',
    HMAC_MD5: 'HMAC_MD5'
  },
  sleep: jest.fn(),
}

// GoogleAppsScript 名前空間（型用）
global.GoogleAppsScript = {
  Events: {
    DoGet: { parameter: {} },
    DoPost: { parameter: {}, postData: { contents: "" } },
  },
  HTML: { HtmlOutput: {} },
  Content: { TextOutput: {} },
  URL_Fetch: { HTTPResponse: {} },
};
