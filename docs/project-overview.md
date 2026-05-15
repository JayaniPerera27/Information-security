# Project Overview

## Topic

Secure Exam Paper Distribution System Between Lecturers and Exam Officers.

## Goal

Design and implement a secure communication mechanism that allows lecturers to submit exam papers to exam officers while preserving confidentiality, integrity, authentication, non-repudiation, availability, and accountability.

## Main Actors

- Lecturer: prepares and securely submits exam papers.
- Exam Officer: receives, verifies, decrypts, and manages exam papers.
- Admin: manages users, roles, public keys, and audit records.

Detailed role permissions are defined in `docs/user-roles.md`.

## High-Level Flow

1. Lecturer logs in.
2. Lecturer uploads an exam paper.
3. The system hashes the paper.
4. The lecturer digitally signs the hash.
5. The system encrypts the paper using AES.
6. The AES key is encrypted using the exam officer's public key.
7. The encrypted package and metadata are stored.
8. Exam officer logs in.
9. Exam officer decrypts the AES key using their private key.
10. The paper is decrypted and verified.
11. Verification result and all important actions are recorded in audit logs.
