# Security Design

## Security Properties

| Property | Mechanism |
|---|---|
| Confidentiality | AES-256-GCM encryption |
| Secure key transfer | RSA public key encryption |
| Integrity | SHA-256 hash and AES-GCM authentication tag |
| Authentication | Login credentials and digital signatures |
| Non-repudiation | Lecturer digital signature |
| Replay protection | Timestamp and unique submission ID |
| Accountability | Audit logs |
| Authorization | Role-based access control |

## Threats Considered

- Eavesdropping during paper transfer
- Unauthorized paper access
- Paper tampering
- Lecturer impersonation
- Exam officer impersonation
- Replay of an old submission
- Weak password attacks
- Private key compromise
- Missing or incomplete audit trail

## Recommended Algorithms

- Password hashing: bcrypt
- File encryption: AES-256-GCM
- Public key encryption: RSA-OAEP
- Digital signature: RSA-PSS or RSA with SHA-256
- Hashing: SHA-256
- Transport security: HTTPS/TLS in deployment

## Key Management

Each user can generate an RSA public/private key pair from the system.

- The public key is stored in MongoDB with the user account.
- The private key is returned once to the user for download.
- The private key is not stored in MongoDB.
- In the project demonstration, users are responsible for keeping the downloaded private key safe.
- In a real production system, private keys should be protected using secure hardware, an operating-system key store, or another trusted key-management solution.

## Lecturer Upload Workflow

When a lecturer submits an exam paper:

1. The lecturer selects a course/module and exam officer.
2. The lecturer uploads the exam paper and selects their private key file.
3. The backend calculates a SHA-256 hash of the original paper.
4. The hash is digitally signed using the lecturer's private key.
5. A random AES-256 session key and IV are generated.
6. The exam paper is encrypted using AES-256-GCM.
7. The AES session key is encrypted using the selected exam officer's public key with RSA-OAEP.
8. The encrypted paper is stored in local encrypted storage.
9. Submission metadata, encrypted session key, hash, signature, IV, and authentication tag are stored in MongoDB.
10. An audit log is created for the submission event.

## Exam Officer Receive Workflow

When an exam officer receives a submitted paper:

1. The exam officer logs in and views only submissions assigned to their account.
2. The officer can verify the lecturer's digital signature using the lecturer's stored public key.
3. The officer selects their private key file when decrypting the paper.
4. The backend decrypts the AES session key using the exam officer's private key.
5. The backend decrypts the encrypted paper using AES-256-GCM.
6. The backend recalculates the SHA-256 hash of the decrypted paper.
7. The recalculated hash is compared with the original stored hash.
8. The system reports whether the signature is valid, integrity check passed, and decryption succeeded.
9. If all checks pass, the decrypted paper is returned to the officer for download.
10. Verification and decryption events are recorded in audit logs.
