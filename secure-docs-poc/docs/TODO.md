
# ✅ Project TODO List for Secure Document Gateway

This checklist tracks implementation goals across different microservices. Link issues to items where appropriate.

---

## 🛠️ Setup & Infrastructure

- [ ] Create and test Dockerfile for each microservice
- [ ] Build top-level docker-compose.yml to coordinate services
- [ ] Create .env.sample files for all services
- [ ] Standardize entry point files (`index.js` or `server.js`) in each service

---

## 🔒 Authentication

- [ ] Implement authentication middleware in `api-gateway`
- [ ] Add user registration and login endpoints
- [ ] Pass authenticated user ID into watermark metadata

---

## 🧠 PII Detection

- [x] Implement regex-based PII detection
- [ ] Enhance placeholder generator to reuse the same tag for repeated PII
- [ ] Add account number detection to regex patterns
- [ ] Integrate NLP-based detection using Python service (`pii-nlp`)
- [ ] Add ability to select detection method via API

---

## 📝 Document Processing

- [ ] Finalize DOCX redaction logic
- [ ] Add support for PDF redaction
- [ ] Add support for Excel (XLSX) redaction

---

## 🔐 Watermarking

- [x] Integrate OmniSeal `/unified/embed` API
- [ ] Add verification step to confirm watermark content
- [ ] Include original file name, username, and comments in watermark
- [ ] Extract watermark and serve separately with watermarked file

---

## 🧪 Testing & Frontend

- [ ] Build a simple frontend form to upload and trigger end-to-end flow
- [ ] Allow downloads of original, redacted, and extracted watermark text
- [ ] Build test coverage for all major services

---

## 🗂 Documentation & Project Management

- [x] Create project structure recommendations document
- [ ] Add README.md files to each service
- [ ] Set up GitHub Project board
- [ ] Convert all major TODO items into GitHub issues
