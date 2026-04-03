// jest.setup.js

// UrlFetchApp モック
global.UrlFetchApp = {
  fetch: jest.fn((url) => ({
    getContentText: () => `Mock response from ${url}`,
    getResponseCode: () => 200,
  })),
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
