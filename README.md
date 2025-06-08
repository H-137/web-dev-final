# 📍 Study Spaces Map

**Website**: [study.matt-leopold.com](https://study.matt-leopold.com)

This project is an interactive map designed to help students discover the best study spaces on campus and beyond. Users can view study spots, filter by amenities, noise levels, seating types, and even add new locations to the map. Built with a focus on usability, speed, and clean design.

---

## 🚀 Tech Stack

- **Frontend**: [Next.js](https://nextjs.org/) (React Framework)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Mapping**: [OpenLayers](https://openlayers.org/)
- **Backend**: Next.js API Routes (serverless)
- **Database**: [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- **Hosting**: [Vercel](https://vercel.com/)

---

## ✨ Features

- 📍 **Interactive Map** – Clickable, zoomable, mobile-responsive map.
- 🔍 **Filter Study Spots** – By amenities (e.g., water fountains), seating types, and noise levels.
- ✏️ **Add New Locations** – Users can add new study spaces through an intuitive form.
- 📊 **Ratings & Reviews** – Rate locations and leave short reviews.
- 🌗 **Dark Mode** – Full light/dark theme toggle based on user preference.
- 🗺️ **Map Interaction** – Select a spot directly from the map.

---

## 🛠️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/H-137/web-dev-final.git
   cd web-dev-final
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file:
   ```
   MONGODB_URI=your-mongodb-connection-uri (with the API key)
   ```

4. **Run locally:**
   ```bash
   npm run dev
   ```
   Then open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

| Folder | Purpose |
|:-------|:--------|
| `/components` | Reusable React components (Sidebar, FilterPanel, Map, Menu, etc.) |
| `/pages/api` | API routes (e.g., location fetching, submission handling) |
| `/public` | Static assets (e.g., map marker icons) |
| `/styles` | Global styles (mostly handled via Tailwind) |
| `/utils` | Helper functions (e.g., validation, filtering) |

---

## 🧠 Future Enhancements

- Image uploads for study spaces
- Advanced search with text queries
- Admin dashboard for moderating submissions
- Location favoriting (save for later)
- More granular filtering (WiFi, temperature, etc.)

---

## 📜 License

This project is licensed under the MIT License. Feel free to fork, clone, and build upon it!

---

## 👨‍💻 Author

- **Matt Leopold** — [matt-leopold.com](https://matt-leopold.com)
- **Colin Norstad**
- **Kyle Ambrose**