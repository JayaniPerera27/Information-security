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
