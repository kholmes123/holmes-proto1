
# Secure Document Processing Gateway – Project Structure Recommendations

## Overview
Your project is structured as a modular, multi-service Node.js and Python-based secure document gateway that supports PII detection, redaction, and watermarking. This document summarizes the current structure and provides recommendations to improve maintainability, scalability, and security.

---

## ✅ Current Architecture Highlights

### 1. Microservices in `services/`
- **api-gateway**: Entry point and router, possibly handles authentication.
- **file-redaction**: Regex-based PII redaction logic.
- **pii-detection**: Houses models and detection logic.
- **pii-nlp**: Python-based NLP detection (future NLP integrations).
- **text-extraction**: For extracting text from various formats.
- **watermarking**: Uses OmniSeal to embed/retrieve watermarks.

### 2. Directory Organization
- Each service has:
  - `controllers/`
  - `routes/`
  - `utils/`
  - `uploads/` or `temp/`
  - `package.json`
- `test data/`: Contains test DOCX files.
- `scratchpad area/`: For dev notes.
- `tests/`: Placeholder for test scripts.

---

## 🔧 Recommended Improvements

### 1. Standardize Entry Points
Add a consistent `index.js` or `server.js` in each service:

```javascript
require('dotenv').config();
const express = require('express');
const routes = require('./routes');

const app = express();
app.use(express.json());
app.use('/api', routes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Service running on port ${PORT}`));
```

---

### 2. Use `.env.sample` for Secrets Template
Create `.env.sample` at the root of each service:

```bash
PORT=3001
PURECIPHER_API_KEY=your_api_key_here
PRIVATE_SEED=your_private_seed
```

> ✅ Helpful for onboarding new developers without sharing secrets.

---

### 3. In-Memory File Handling
Avoid persistent storage of sensitive documents. Replace disk writes with in-memory streams using `multer.memoryStorage()`:

```javascript
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });
```

> Only write files to disk when explicitly needed (e.g., downloads, debugging).

---

### 4. README in Each Microservice
Example template:

```markdown
# file-redaction Service

## Overview
Handles regex-based PII detection and document redaction.

## How to Run
```bash
npm install
npm start
```

## API Endpoints
- `POST /redact`

## Status
Stable, tested with DOCX files.
```

---

### 5. Add Docker Support (Optional but Recommended)
Create a `Dockerfile` for each microservice:

```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "start"]
```

Top-level `docker-compose.yml` example:

```yaml
version: '3.8'
services:
  api-gateway:
    build: ./services/api-gateway
    ports:
      - "3000:3000"
  file-redaction:
    build: ./services/file-redaction
    ports:
      - "3001:3001"
  watermarking:
    build: ./services/watermarking
    ports:
      - "3002:3002"
  pii-nlp:
    build: ./services/pii-nlp
    ports:
      - "5000:5000"
```

> Add `depends_on:` for interdependent services.

---

## Next Steps
Let me know if you'd like:
- Code review of specific services (e.g., `gatewayService.js`)
- Help writing `Dockerfile`/`docker-compose.yml`
- Starter test files or scripts
- API gateway improvements (authentication, logging, etc.)

---

This document captures current progress and provides an upgrade path as you continue adding file formats, encryption, and authentication features.
