# 🏠 PG Finder – Find PGs Near You

A full-stack web application that helps students find PG (Paying Guest) accommodations near their college or current location using live GPS tracking and geospatial search.

---

## 🌟 Features

### For Students
- 📍 **Live Location Search** – Grant location access and instantly see PGs within a configurable radius
- 🗺️ **Interactive Map** – Leaflet-powered map showing all PGs with distance markers
- 🔍 **Advanced Filters** – Filter by type (boys/girls/co-ed), price range, amenities, city
- ❤️ **Save PGs** – Save favorite PGs to your dashboard
- ⭐ **Reviews** – Read and write reviews for PGs you've stayed in

### For PG Owners
- 🏠 **List Your PG** – 5-step guided listing form
- 📍 **GPS Pin** – Auto-detect PG location for accurate "nearby" results
- 📊 **Dashboard** – Manage all your listings, view availability & verification status

### Technical
- 🌐 **Geospatial Search** – MongoDB `$near` operator with 2dsphere indexing
- 🔒 **JWT Auth** – Secure token-based authentication
- 📱 **Responsive Design** – Works on mobile and desktop

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, React Router v6, React Leaflet, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (with 2dsphere geospatial index) |
| Auth | JWT (JSON Web Tokens) + bcryptjs |
| Maps | Leaflet.js + OpenStreetMap (free, no API key needed) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1. Clone & Setup

```bash
# Clone the repo (or extract the zip)
cd pg-finder

# Setup Backend
cd backend
cp .env.example .env
# Edit .env and set your MONGODB_URI and JWT_SECRET
npm install

# Setup Frontend
cd ../frontend
cp .env.example .env
npm install
```

---

### 2. Configure Environment Variables

**backend/.env**
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pgfinder
JWT_SECRET=your_super_secret_key_change_this
NODE_ENV=development
```

**frontend/.env**
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

### 3. Seed Sample Data (Optional but Recommended)

```bash
cd backend
node seed.js
```

This creates:
- 5 sample PGs in Bhopal area
- Demo accounts:
  - 👨‍🎓 **Student:** `student@pgfinder.com` / `password123`
  - 🏠 **Owner 1:** `owner1@pgfinder.com` / `password123`
  - 🏠 **Owner 2:** `owner2@pgfinder.com` / `password123`

---

### 4. Run the App

```bash
# Terminal 1 – Backend
cd backend
npm run dev   # uses nodemon for hot reload
# OR
npm start

# Terminal 2 – Frontend
cd frontend
npm start
```

Open **http://localhost:3000** in your browser.

---

## 📁 Project Structure

```
pg-finder/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── middleware/
│   │   └── auth.js            # JWT middleware
│   ├── models/
│   │   ├── User.js            # User schema
│   │   └── PG.js              # PG schema (with 2dsphere index)
│   ├── routes/
│   │   ├── auth.js            # Auth routes (register/login/me)
│   │   └── pgs.js             # PG CRUD + /nearby endpoint
│   ├── seed.js                # Sample data seeder
│   ├── server.js              # Express app entry point
│   └── package.json
│
└── frontend/
    ├── public/
    │   └── index.html
    └── src/
        ├── components/
        │   ├── Navbar.js/.css
        │   └── PGCard.js/.css
        ├── context/
        │   └── AuthContext.js  # Global auth state
        ├── pages/
        │   ├── Home.js/.css    # Landing page with search
        │   ├── Search.js/.css  # Map + filter + PG grid
        │   ├── PGDetail.js/.css
        │   ├── Login.js
        │   ├── Register.js
        │   ├── Auth.css
        │   ├── Dashboard.js/.css
        │   └── AddPG.js/.css   # 5-step PG listing form
        ├── App.js
        ├── index.js
        └── index.css
```

---

## 🗺️ Key API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/save-pg/:id` | Toggle save PG |

### PGs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pgs/nearby?lat=&lng=&radius=` | **Geospatial nearby search** |
| GET | `/api/pgs?city=&type=&minPrice=` | List all with filters |
| GET | `/api/pgs/:id` | Get PG details |
| POST | `/api/pgs` | Create listing (owner only) |
| PUT | `/api/pgs/:id` | Update listing (owner only) |
| DELETE | `/api/pgs/:id` | Delete listing (owner only) |
| POST | `/api/pgs/:id/reviews` | Add review |
| GET | `/api/pgs/owner/my-pgs` | Owner's listings |

---

## 🌐 Using with MongoDB Atlas (Cloud)

1. Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Get your connection string
3. Set in `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/pgfinder
   ```

---

## 🐳 Docker Compose (Optional)

```bash
docker-compose up --build
```

Access at: http://localhost:3000

---

## 📝 Notes

- **No Google Maps API key needed** – Uses free OpenStreetMap via Leaflet
- **Geolocation requires HTTPS** in production (works on localhost)
- PG images are placeholders – integrate Cloudinary or similar for real image uploads
- For production, set `NODE_ENV=production` and use a strong `JWT_SECRET`

---

## 📄 License

MIT License – Free to use and modify.
