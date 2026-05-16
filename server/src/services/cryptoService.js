const crypto = require("crypto");

const generateRsaKeyPair = () => {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: "spki",
      format: "pem"
    },
    privateKeyEncoding: {
      type: "pkcs8",
      format: "pem"
    }
  });

  return { publicKey, privateKey };
};

const hashBuffer = (buffer) => {
  return crypto.createHash("sha256").update(buffer).digest("hex");
};

const signHash = (hash, privateKey) => {
  return crypto.sign("sha256", Buffer.from(hash, "hex"), {
    key: privateKey,
    padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
    saltLength: 32
  }).toString("base64");
};

const encryptFileBuffer = (buffer) => {
  const sessionKey = crypto.randomBytes(32);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", sessionKey, iv);
  const encryptedFile = Buffer.concat([cipher.update(buffer), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return {
    encryptedFile,
    sessionKey,
    iv: iv.toString("base64"),
    authTag: authTag.toString("base64")
  };
};

const encryptSessionKey = (sessionKey, publicKey) => {
  return crypto.publicEncrypt(
    {
      key: publicKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256"
    },
    sessionKey
  ).toString("base64");
};

module.exports = {
  generateRsaKeyPair,
  hashBuffer,
  signHash,
  encryptFileBuffer,
  encryptSessionKey
};
