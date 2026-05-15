# Secure Exam Paper Distribution System

MERN-based Information Security project for secure exam paper submission between lecturers and exam officers.

## Project Layout

```text
Project Code/
  client/             React frontend
  server/             Node.js + Express backend
  docs/               Security design and project documentation
  storage/            Local encrypted file storage for development
```

## Core Security Features

- Lecturer and exam officer authentication
- Role-based access control
- AES encryption for exam papers
- RSA encryption for AES session keys
- Digital signatures for sender verification and non-repudiation
- Hashing/integrity verification
- Audit logs for accountability

## Suggested Development Order

1. Set up backend API and MongoDB connection.
2. Add authentication and roles.
3. Add key generation/public key storage.
4. Add lecturer paper upload workflow.
5. Add encryption, signing, and metadata storage.
6. Add exam officer receive, decrypt, and verify workflow.
7. Add audit logs and admin viewing.
8. Test normal and attack scenarios.
