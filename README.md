# 🔐 Secure Exam Paper Distribution System

A MERN-stack Information Security project that implements a cryptographically secure channel for exam paper distribution between lecturers and exam officers. All papers are encrypted, signed, and integrity-verified end-to-end.

---

## 📁 Project Layout

```text
Project Code/
  client/                         React frontend
    src/
      components/
        Auth/                     Login & Register pages
        Lecturer/                 Upload, encrypt & sign papers
        ExamOfficer/              Receive, verify & decrypt papers
        Admin/                    Audit log dashboard
        shared/                   Navbar, PrivateRoute, etc.
      context/                    AuthContext — global user/session state
      utils/                      Browser-side crypto helpers (AES, RSA, SHA-256)
      hooks/                      Custom React hooks (useAuth, useSubmission)

  server/                         Node.js + Express backend
    config/                       MongoDB connection, environment config
    controllers/                  Route handler logic
      authController.js           Register, login, JWT issuance
      keyController.js            Public key storage and retrieval
      submissionController.js     Upload, verify, decrypt workflows
      auditController.js          Audit log access
    middleware/
      authMiddleware.js           JWT verification + role guard
      errorHandler.js             Global error handler
    models/
      User.js                     User schema (bcrypt password, public key, role)
      Submission.js               Encrypted paper package schema
      AuditLog.js                 Immutable audit record schema
    routes/                       Express routers (auth, keys, submissions, audit)
    utils/
      cryptoHelpers.js            Server-side SHA-256, RSA verify, AES-GCM decrypt
      auditLogger.js              Append-only audit log writer

  docs/                           Security design and project documentation
  storage/                        Local encrypted file storage (dev only)
```

---

## 🛡️ Security Architecture

### Parties
| Role | Responsibility |
|---|---|
| **Lecturer** | Uploads, encrypts, and digitally signs exam papers |
| **Exam Officer** | Receives, verifies signature, and decrypts papers |
| **Admin** | Monitors audit logs and system activity |

### Protocol Workflow

```
LECTURER                          SERVER                        EXAM OFFICER
────────                          ──────                        ────────────
Login → JWT token ─────────────► Verify credentials
Generate RSA key pair
Upload public key ─────────────► Store public key
Upload exam paper (PDF)
Compute SHA-256 hash H(P)
Sign: Sig = Sign(SK_L, H(P))
Encrypt paper: C = AES-256(P)
Encrypt AES key: EK = RSA(PK_EO)
Send { C, EK, Sig, H(P), ... } ► Verify Sig
                                  Check nonce + timestamp
                                  Store encrypted package
                                                              Login → JWT token
                                                              Request submissions
                                  ◄── Send metadata ─────────
                                  ◄── Request verify ─────────
                                  Re-verify Sig
                                  ──► Signature Valid/Invalid ─►
                                  ◄── Send SK_EO ─────────────
                                  Decrypt EK → K_AES
                                  Decrypt C → P
                                  Recompute H'(P)
                                  Check H'(P) == H(P)
                                  ──► Paper + results ────────►
```

### Accept / Reject Rule
```
ACCEPT paper if:  Signature == Valid
              AND Integrity == Passed
              AND Decryption == Successful

REJECT paper if:  Signature == Invalid
               OR Integrity == Failed
               OR Decryption == Failed
```

---

## 🔐 Core Security Features

| Mechanism | Algorithm | Security Property |
|---|---|---|
| Password storage | bcrypt (cost 12) | Credential security |
| Session tokens | JWT (HS256, 8h expiry) | Authentication |
| Paper encryption | AES-256-GCM | Confidentiality |
| Key exchange | RSA-2048 OAEP | Confidentiality |
| Digital signature | RSA + SHA-256 | Non-repudiation, Authentication |
| Integrity check | SHA-256 hash comparison | Integrity |
| Replay prevention | Nonce + timestamp (5 min window) | Replay attack prevention |
| Access control | Role-based JWT middleware | Availability, Authorization |
| Accountability | Append-only audit trail | Non-repudiation |

---

## 🗂️ Data Models

### User
```
_id, name, email, passwordHash, role (LECTURER | EXAM_OFFICER | ADMIN),
publicKey (PEM), isActive, createdAt
```

### Submission (Encrypted Package)
```
submissionId, lecturerId, examOfficerId, courseCode, examTitle,
encryptedPaper (base64),       ← AES-256-GCM ciphertext
encryptedSessionKey (base64),  ← RSA-encrypted AES key
iv (base64),                   ← AES initialization vector
authTag (base64),              ← GCM authentication tag
paperHash (hex),               ← SHA-256 of original plaintext
signature (base64),            ← RSA signature of paperHash
lecturerPublicKey (PEM),       ← snapshot for later verification
nonce, timestamp, status, originalFilename
```

### AuditLog (Immutable)
```
userId, userEmail, role, action, submissionId,
details, outcome (SUCCESS | FAILURE), ipAddress, timestamp
```

---

## 🌐 API Endpoints

### Auth
```
POST   /api/auth/register        Register as LECTURER or EXAM_OFFICER
POST   /api/auth/login           Login and receive JWT
GET    /api/auth/me              Get current user (JWT required)
```

### Keys
```
POST   /api/keys/store           Upload your RSA public key
GET    /api/keys/officers        List all exam officers (Lecturer only)
GET    /api/keys/:userId         Get a user's public key
```

### Submissions
```
POST   /api/submissions/upload              Lecturer submits encrypted paper
GET    /api/submissions/sent               Lecturer views sent papers
GET    /api/submissions/my                 Exam Officer views assigned papers
POST   /api/submissions/verify/:id         Exam Officer verifies signature
POST   /api/submissions/decrypt/:id        Exam Officer decrypts paper
```

### Audit
```
GET    /api/audit/logs           Full audit trail (Admin only)
GET    /api/audit/my             Current user's own activity log
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Install dependencies

```bash
# Backend
cd server && npm install

# Frontend
cd ../client && npm install
```

### 2. Configure environment

```bash
cp server/.env.example server/.env
# Fill in: MONGO_URI, JWT_SECRET
```

### 3. Run

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — frontend (http://localhost:3000)
cd client && npm start
```

---

## 🏗️ Suggested Development Order

1. **Backend setup** — Express server, MongoDB connection, `.env` config
2. **Authentication** — User model (bcrypt), register/login endpoints, JWT middleware
3. **Role-based access** — Role guard middleware, protect all routes
4. **Key management** — RSA key pair generation (client), public key upload/retrieval (server)
5. **Lecturer upload flow** — AES encrypt paper, RSA encrypt session key, sign hash, submit package
6. **Exam Officer flow** — Fetch submissions, verify signature, decrypt paper, integrity check
7. **Audit logging** — Log every action (login, upload, verify, decrypt, failures)
8. **Admin dashboard** — View and filter full audit trail
9. **Attack scenario testing** — Replay attack, tampered ciphertext, wrong key, forged signature

---

## ⚠️ Threat Mitigation

| Attack | Mitigation |
|---|---|
| Eavesdropping | AES-256-GCM encryption — intercepted data is unreadable |
| Tampering | SHA-256 hash + GCM auth tag — any change is detected |
| Impersonation | RSA digital signatures + JWT — identity is cryptographically verified |
| Replay attack | Unique nonce + 5-minute timestamp window — reused packets rejected |
| Brute force | bcrypt (cost 12) + rate limiting (100 req / 15 min) |
| Unauthorized access | Role-based JWT middleware blocks every unguarded route |

---

## 📝 Audit Log Action Types

```
LOGIN                LOGOUT              REGISTER
KEY_GENERATED        SUBMISSION_CREATED  SUBMISSION_VERIFIED
SUBMISSION_DECRYPTED SIGNATURE_INVALID   INTEGRITY_FAILED
REPLAY_DETECTED      UNAUTHORIZED_ACCESS
```

---

## 🔑 Key Design Decisions

- **Hybrid encryption** — RSA alone is too slow for large PDFs; AES handles bulk data, RSA secures the key
- **Client-side private keys** — Private keys are generated and kept in the browser; the server never sees them
- **AES-256-GCM** — Provides both encryption and built-in authentication (auth tag catches ciphertext tampering)
- **Append-only audit log** — Records are never updated or deleted, ensuring a trustworthy non-repudiation trail
- **Nonce uniqueness** — Each submission carries a UUID nonce; duplicate nonces are rejected server-side
