// === 1. 必須：モジュール化防止 ===
export { };

// === 2. グローバル宣言 ===
declare global {
  const cCryptoGS: {
    Cipher: new (passphrase: string, algorithm: string) => {
      encrypt(message: string): string;
      decrypt(ciphertext: string): string;
    };
  };
}
