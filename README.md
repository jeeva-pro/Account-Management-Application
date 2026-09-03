# 🔐 Account Management Application

A production-ready, secure account management web application built with React, Django REST Framework, and Supabase PostgreSQL.

![React](https://img.shields.io/badge/React-18-blue?logo=react)
![Django](https://img.shields.io/badge/Django-4.2-green?logo=django)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-blue?logo=supabase)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-black?logo=vercel)
![Railway](https://img.shields.io/badge/Backend-Railway-purple?logo=railway)

---

## 📐 Architecture

```
┌─────────────────┐       HTTPS        ┌─────────────────────┐       SSL        ┌─────────────────┐
│                 │  ──────────────►   │                     │  ────────────►  │                 │
│   React SPA     │                    │   Django REST API   │                  │   Supabase      │
│   (Vercel)      │  ◄──────────────   │   (Railway)         │  ◄────────────   │   PostgreSQL    │
│                 │    JSON responses  │                     │    Query results │                 │
└─────────────────┘                    └─────────────────────┘                  └─────────────────┘
     Frontend                              Backend                                Database
   Port: 5173                            Port: 8000
```

### Key Principles

- **React communicates ONLY with the Django API** — the frontend never connects directly to the database
- **Django handles all business logic and database operations** — authentication, authorization, validation, and data access are all server-side
- **Supabase provides managed PostgreSQL** — a reliable, scalable database with built-in SSL, backups, and connection pooling
- **All communication over HTTPS/SSL in production** — encrypted end-to-end from browser to database

---

## 🛠 Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** + **Vite** | UI framework with fast HMR dev server |
| **React Router v6** | Client-side routing and navigation |
| **Axios** with interceptors | HTTP client with automatic token refresh |
| **Tailwind CSS** | Utility-first styling |
| **React Hot Toast** | User-friendly toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Python 3.11+** | Runtime |
| **Django 4.2** | Web framework |
| **Django REST Framework** | API toolkit |
| **SimpleJWT** | Token-based authentication |
| **drf-spectacular** | OpenAPI/Swagger documentation |

### Database
| Technology | Purpose |
|------------|---------|
| **Supabase PostgreSQL** | Managed database with SSL |

### Deployment
| Service | Component |
|---------|-----------|
| **Vercel** | Frontend hosting (CDN, auto-SSL) |
| **Railway** | Backend hosting (containers, auto-deploy) |
| **Supabase** | Database hosting (managed PostgreSQL) |

---

## 🚀 Local Development Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn
- Git
- Supabase account ([free tier](https://supabase.com) works)

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/account-management.git
cd account-management
```

### 2. Supabase Setup

1. Create a new project at [https://supabase.com](https://supabase.com)
2. Go to **Settings → Database → Connection string**
3. Copy the PostgreSQL connection string (URI format)
4. Replace the `DATABASE_URL` in `backend/.env` with that URI. For this project, the direct connection host is `db.vljhdazovxeirbgawofv.supabase.co`.
5. **Note:** Use the **"Session mode"** connection string for Django, and URL-encode any special characters in the database password.

### 3. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
# Create backend/.env with the required settings from your deployment environment.
# Set DATABASE_URL to your Supabase PostgreSQL URI and generate a SECRET_KEY.

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure frontend environment
# Create frontend/.env with VITE_API_BASE_URL=http://localhost:8000/api

# Start development server
npm run dev
```

The frontend runs at **http://localhost:5173** and the backend at **http://localhost:8000**.

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `django-insecure-change-me-in-production` |
| `DEBUG` | Debug mode | `True` (dev) / `False` (prod) |
| `ALLOWED_HOSTS` | Comma-separated hosts | `localhost,127.0.0.1` |
| `DATABASE_URL` | Supabase PostgreSQL URL | `postgresql://user:pass@host:port/db` |
| `CORS_ALLOWED_ORIGINS` | Allowed frontend origins | `http://localhost:5173` |
| `CSRF_TRUSTED_ORIGINS` | CSRF trusted origins | `http://localhost:5173` |
| `JWT_ACCESS_TOKEN_LIFETIME` | Access token lifetime (min) | `15` |
| `JWT_REFRESH_TOKEN_LIFETIME` | Refresh token lifetime (min) | `10080` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000/api` |

---

## 📡 API Documentation

API documentation is available at **`/api/docs/`** (Swagger UI) when the backend is running.

### Authentication Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| `POST` | `/api/auth/register/` | Register new user | No |
| `POST` | `/api/auth/login/` | Login | No |
| `POST` | `/api/auth/refresh/` | Refresh JWT | No |
| `POST` | `/api/auth/logout/` | Logout (blacklist token) | Yes |
| `POST` | `/api/auth/forgot-password/` | Request password reset | No |
| `POST` | `/api/auth/reset-password/` | Reset password | No |

### Account Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|:-------------:|
| `GET` | `/api/accounts/me/` | Get current user | Yes |
| `GET` | `/api/accounts/profile/` | Get profile | Yes |
| `PUT` | `/api/accounts/profile/` | Update profile (full) | Yes |
| `PATCH` | `/api/accounts/profile/` | Update profile (partial) | Yes |
| `DELETE` | `/api/accounts/profile/` | Delete account | Yes |
| `POST` | `/api/accounts/change-password/` | Change password | Yes |

### Health Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health/` | API health check |
| `GET` | `/api/health/database/` | Database connectivity check |

---

## 🔒 Security

This application implements comprehensive security measures:

- **JWT Authentication** — Short-lived access tokens (15 min) + refresh tokens (7 days) with rotation and blacklisting
- **Password Security** — Django's PBKDF2 hashing, strong validation, common password rejection
- **CORS** — Restricted to specific frontend origins only
- **CSRF** — Properly configured trusted origins
- **Rate Limiting** — Throttling on login, registration, and password endpoints
- **Input Validation** — Server-side validation on all endpoints
- **Authorization** — Object-level permissions — users can only access their own data
- **Production Hardening** — HSTS, secure cookies, SSL redirect, content type nosniff, X-Frame-Options
- **No Secrets in Frontend** — All credentials and keys stored as backend environment variables only
- **Error Handling** — Sanitized error responses that never expose internal details

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test accounts -v 2
```

Tests cover: registration, authentication, JWT, profile CRUD, password management, rate limiting, and authorization.

### Frontend Tests

```bash
cd frontend
npm test
```

---

## 🚀 Production Deployment

### Deploy Backend to Railway

1. Push code to GitHub
2. Create a new Railway project
3. Connect your GitHub repo
4. Set root directory to `/backend`
5. Add all environment variables (see [Environment Variables](#-environment-variables) table above)
6. Set start command:
   ```bash
   python manage.py migrate --noinput && gunicorn config.wsgi:application --bind 0.0.0.0:$PORT
   ```
7. Deploy — Railway will auto-detect Python
8. Note your Railway domain (e.g., `your-app.up.railway.app`)

### Deploy Frontend to Vercel

1. Create a new Vercel project
2. Connect your GitHub repo
3. Set root directory to `/frontend`
4. Set build command: `npm run build`
5. Set output directory: `dist`
6. Add environment variable:
   ```
   VITE_API_BASE_URL=https://your-railway-domain.up.railway.app/api
   ```
7. Deploy

### Post-Deployment

1. Update Railway env vars:
   - `ALLOWED_HOSTS=your-railway-domain.up.railway.app`
   - `CORS_ALLOWED_ORIGINS=https://your-app.vercel.app`
   - `CSRF_TRUSTED_ORIGINS=https://your-app.vercel.app,https://your-railway-domain.up.railway.app`
2. Verify backend: `https://your-railway-domain.up.railway.app/api/health/`
3. Verify frontend: `https://your-app.vercel.app`

---

## ✅ Production Deployment Checklist

### Supabase
- [ ] PostgreSQL database created
- [ ] Connection string copied
- [ ] SSL enabled (default)

### Railway (Backend)
- [ ] Django deployed successfully
- [ ] Gunicorn running
- [ ] All env vars configured
- [ ] `DEBUG=False`
- [ ] `ALLOWED_HOSTS` set
- [ ] CORS restricted to Vercel domain
- [ ] CSRF origins configured
- [ ] Migrations ran successfully
- [ ] `/api/health/` returns OK
- [ ] `/api/docs/` accessible

### Vercel (Frontend)
- [ ] React build successful
- [ ] `VITE_API_BASE_URL` points to Railway
- [ ] SPA routing works (`vercel.json` rewrites)
- [ ] HTTPS enabled (automatic)
- [ ] All pages load correctly

### Security
- [ ] No secrets in GitHub
- [ ] No DB credentials in frontend
- [ ] Passwords hashed (PBKDF2)
- [ ] JWT properly configured
- [ ] Rate limiting active
- [ ] CORS restricted
- [ ] HTTPS everywhere

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| CORS errors | Verify `CORS_ALLOWED_ORIGINS` includes your frontend URL (with `https://`) |
| 401 on API calls | Check that access token is being sent in `Authorization` header |
| Token refresh loop | Clear `localStorage` and login again |
| Database connection error | Verify `DATABASE_URL`, ensure SSL mode, check Supabase is running |
| Static files not loading | Run `python manage.py collectstatic`, ensure whitenoise is configured |
| Vercel routing 404 | Ensure `vercel.json` has the SPA rewrite rule |
| Railway deploy fails | Check `Procfile`, `requirements.txt`, and Python version |
| CSRF errors | Add your domains to `CSRF_TRUSTED_ORIGINS` |

---

## 📝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature

# Make changes and commit
git add .
git commit -m "feat: description of changes"

# Push and create PR
git push origin feature/your-feature
```

> ⚠️ **If secrets are accidentally committed:**
> 1. Remove the secret from the code
> 2. Rotate **ALL** exposed credentials immediately
> 3. Generate new Django `SECRET_KEY`
> 4. Update Supabase database password
> 5. Update all environment variables
> 6. Force-push to remove from Git history (or use `git-filter-branch` / [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/))

---

## 📄 License

MIT License — See [LICENSE](LICENSE) file for details.
