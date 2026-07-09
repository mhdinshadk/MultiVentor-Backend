# Multi-Vendor Blog & Marketplace Content Platform

A high-performance, premium Multi-Vendor Blog / Marketplace Content Platform built with **Payload CMS 3.x**, **Next.js (App Router)**, **TypeScript**, and **MongoDB**.

---

## 🛠️ Stack & Architecture

- **Backend / CMS**: Payload CMS 3.x (running on Next.js)
- **Frontend**: Next.js App Router, Tailwind CSS, TypeScript
- **Database**: MongoDB (Atlas)
- **Media Storage**: AWS S3 / Cloud Storage via `@payloadcms/storage-s3` (conditional integration)

---

## 🚀 How to Run the Project Locally

### 1. Backend Setup

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Create a `.env` file based on `.env.example`.
4. Configure the environment variables:
   ```env
   DATABASE_URL=your-mongodb-connection-string
   PAYLOAD_SECRET=your-payload-secret
   NEXT_PUBLIC_FRONTEND_URL=http://localhost:3001
   REVALIDATION_SECRET=revalidate-secret
   
   # Optional: Configure S3 Cloud Storage
   S3_BUCKET=your-bucket-name
   S3_ACCESS_KEY_ID=your-access-key-id
   S3_SECRET_ACCESS_KEY=your-secret-access-key
   S3_REGION=your-region
   S3_ENDPOINT=your-s3-endpoint
   S3_FORCE_PATH_STYLE=false
   ```
5. Run the development server (runs on `http://localhost:3000`):
   ```bash
   pnpm run dev
   ```

### 2. Frontend Setup

1. Navigate to the `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   NEXT_PUBLIC_SERVER=http://localhost:3000
   REVALIDATION_SECRET=revalidate-secret
   ```
4. Run the development server (runs on `http://localhost:3001`):
   ```bash
   npm run dev
   ```

---

## 📝 Part 3 — Technical Write-up

### 1. Architecture Decisions: REST API vs Local API vs GraphQL

For this project, we chose the **REST API** interface for communication between Next.js and Payload CMS:
- **Why REST?** 
  - Standard REST endpoints allow us to leverage browser `fetch` cleanly in both Server and Client Components.
  - Payload's REST API supports sophisticated querying mechanisms (`where`, `in`, `equals`, depth controls) out of the box, which allowed us to easily implement complex features like recursive category hierarchy fetching (resolving parent-child relations) in a single request.
  - In a production context, REST endpoints are highly caching-friendly and integrate seamlessly with CDN layers and Next.js’s native caching/revalidation hooks.
- **Why not Local API?**
  - The Local API only works when the backend and frontend are hosted in the exact same Node.js project. Since this workspace separates `backend` and `frontend` into decoupled codebases, they run in separate processes, making the REST API or GraphQL API necessary.
- **Why not GraphQL?**
  - While GraphQL is powerful for custom payload sizing, REST is much simpler to implement, cache-friendly, and more than sufficient for a blog’s read/write operations without requiring complex GraphQL schema generators or client setups.

### 2. Media Cloud Storage Adapter

We integrated `@payloadcms/storage-s3` for media assets:
- **Why S3?**
  - Standard filesystem storage does not persist on modern serverless or ephemeral container hosting (e.g. Vercel, Railway, Render). Storing uploads on local disk would result in lost images after server restarts.
  - S3 is the industry standard for cloud media storage, compatible with AWS, Cloudflare R2, Backblaze B2, and digital asset management.
  - We implemented a **conditional plugin initialization** in `payload.config.ts`. If the `S3_BUCKET` variable is present, it uses the S3 cloud storage plugin; otherwise, it falls back to local disk. This guarantees zero-friction local development without requiring local developers to configure cloud credentials.

### 3. Tradeoffs & Future Enhancements

With more time, we would implement:
1. **Live Preview**: Add Payload's `[livePreview](https://multi-ventor-frontent.vercel.app/)` configuration matching Next.js frontend pages to enable side-by-side editing in real-time.
2. **Deep Nesting Performance**: Instead of resolving category hierarchies recursively in a client-facing Next.js service, we could create a custom API endpoint in Payload or use MongoDB `$graphLookup` queries to fetch nested categories in a single database step.
3. **Advanced Search**: Integrate Payload's search plugin or a third-party engine (Algolia, Meilisearch) for full-text fuzzy searching.

### 4. Harder than Expected: CORS, Draft Access, and PowerShell brackets

1. **CORS & CSRF Integration**: During frontend integration, browser form submissions (comments and newsletters) failed due to CORS blocking. Since Payload's REST API is hosted on port 3000 and Next.js runs on port 3001, browser fetch requests triggered cross-origin preflight checks. We solved this by explicitly configuring the `cors` and `csrf` allowed origins arrays in `payload.config.ts`.
2. **The "Cannot Create Article / Edit Draft" Loop**: When logging in as an `author`, we initially encountered errors saving articles as drafts. We discovered two issues:
   - Authors lacked write permissions for `Media`, which crashed uploads. We resolved this by allowing authors create/update permissions on `Media`.
   - After saving an article as a draft, Payload redirects to the draft's edit page, causing the browser to fetch the draft. However, the `read` access rule (`canReadPublished`) restricted non-admins to only reading `published` articles. Consequently, authors got a "Not Found" error on their own draft. We resolved this by modifying the read access rule to query and allow authors to read documents matching their own Author profile ID.
3. **PowerShell Path Brackets**: When deleting the old `/authors/[id]` directory, standard PowerShell `Remove-Item` commands failed because the bracket syntax `[id]` is interpreted as a wildcard match. We solved this by specifying the `-LiteralPath` parameter to bypass wildcard parsing.
