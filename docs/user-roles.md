# User Roles and Responsibilities

## Purpose

This system uses role-based access control to make sure each user can only perform actions required for their responsibility. This is important because exam papers are highly confidential and should not be visible or editable by unauthorized users.

## Roles

| Role | Main Responsibility |
|---|---|
| Admin | Manage users, roles, public keys, and audit logs |
| Lecturer | Upload, encrypt, sign, and submit exam papers |
| Exam Officer | Receive, verify, decrypt, and manage submitted exam papers |

## Admin

The admin is responsible for managing the system and maintaining accountability.

### Admin Can

- Create lecturer and exam officer accounts.
- Assign user roles.
- View all registered users.
- Manage or verify public keys.
- View audit logs.
- Check failed login attempts and suspicious actions.
- Disable or remove users if required.

### Admin Cannot

- Read decrypted exam paper content unless explicitly authorized.
- Submit exam papers as a lecturer.
- Decrypt papers assigned to exam officers.

### Security Reason

The admin should manage the system, but should not automatically gain access to confidential exam paper content. This supports confidentiality and separation of duties.

## Lecturer

The lecturer is responsible for preparing and securely submitting exam papers.

### Lecturer Can

- Log in to the system.
- Upload exam papers.
- Select the relevant course or module.
- Select the assigned exam officer.
- Generate or register a public key.
- Digitally sign exam paper submissions.
- View their own submitted papers and submission status.

### Lecturer Cannot

- View exam papers submitted by other lecturers.
- Decrypt submitted papers after they are sent to the exam officer.
- Access admin audit management features.
- Access exam officer-only verification functions.

### Security Reason

The lecturer must prove authorship of the submitted paper using a digital signature. This supports authentication, integrity, and non-repudiation.

## Exam Officer

The exam officer is responsible for receiving and verifying submitted exam papers.

### Exam Officer Can

- Log in to the system.
- View submissions assigned to them.
- Verify lecturer digital signatures.
- Decrypt exam papers intended for them.
- Accept or reject submissions based on verification results.
- View verification status and submission history.

### Exam Officer Cannot

- View submissions assigned to other exam officers.
- Modify exam paper content.
- Submit papers as a lecturer.
- Manage users or system-wide audit settings.

### Security Reason

Only the intended exam officer should be able to decrypt a submitted paper. This supports confidentiality and controlled access.

## Access Control Matrix

| Feature | Admin | Lecturer | Exam Officer |
|---|---:|---:|---:|
| Login | Yes | Yes | Yes |
| Manage users | Yes | No | No |
| Assign roles | Yes | No | No |
| Register public key | Yes | Yes | Yes |
| Upload exam paper | No | Yes | No |
| Sign exam paper | No | Yes | No |
| View own submissions | No | Yes | No |
| View assigned submissions | No | No | Yes |
| Verify digital signature | No | No | Yes |
| Decrypt assigned paper | No | No | Yes |
| View audit logs | Yes | No | No |

## Minimum User Data

Each user account should store:

- Full name
- Email address
- Password hash
- Role
- Public key
- Account status
- Created date and updated date

## Role-Based Routing

After login, users should be redirected based on their role:

| Role | Dashboard |
|---|---|
| Admin | `/admin` |
| Lecturer | `/lecturer` |
| Exam Officer | `/exam-officer` |

## Implementation Notes

- Passwords must be stored as hashes, not plain text.
- JWT tokens should include the user ID and role.
- Backend middleware should check whether the logged-in user is allowed to access each route.
- Frontend pages should hide unavailable options, but backend authorization is still required.
- Every important action should be stored in audit logs.
