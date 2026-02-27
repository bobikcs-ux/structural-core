const nacl = require('tweetnacl');

// Generate a new Ed25519 key pair
const keyPair = nacl.sign.keyPair();

// Convert to Base64
function toBase64(uint8Array) {
  return Buffer.from(uint8Array).toString('base64');
}

// Convert to Hex (for CORE_PRIVATE_KEY format - 128 hex chars)
function toHex(uint8Array) {
  return Buffer.from(uint8Array).toString('hex');
}

const privateKeyBase64 = toBase64(keyPair.secretKey);
const publicKeyBase64 = toBase64(keyPair.publicKey);
const privateKeyHex = toHex(keyPair.secretKey);

console.log("=".repeat(60));
console.log("ED25519 KEY PAIR GENERATED");
console.log("=".repeat(60));
console.log("");
console.log("PRIVATE KEY (Base64 - 88 chars):");
console.log(privateKeyBase64);
console.log("");
console.log("PRIVATE KEY (Hex - 128 chars, for CORE_PRIVATE_KEY):");
console.log(privateKeyHex);
console.log("");
console.log("PUBLIC KEY (Base64 - 44 chars):");
console.log(publicKeyBase64);
console.log("");
console.log("=".repeat(60));
console.log("VERCEL ENVIRONMENT VARIABLES:");
console.log("=".repeat(60));
console.log("");
console.log("CORE_PRIVATE_KEY=" + privateKeyHex);
console.log("");
console.log("CORE_PUBLIC_KEY=" + publicKeyBase64);
console.log("");
console.log("NEXT_PUBLIC_BOBIKCS_PUBLIC_KEY_BASE64=" + publicKeyBase64);
console.log("");
console.log("SIGNING_KEY_ID=bobikcs-sri-v1");
console.log("");
console.log("=".repeat(60));
console.log("SECURITY WARNING: Keep CORE_PRIVATE_KEY secret!");
console.log("=".repeat(60));
