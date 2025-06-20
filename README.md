# Langar Dashboard

A lightweight web application to manage and track meal preparation and distribution for large-scale dining operations, such as Langar (community kitchen). This project includes an **Admin Dashboard** to manage meals, menu items, and pot assignments, and a **Public Dashboard** to display real-time delivery progress by dining hall.

---

## 🚀 Features

### 🔐 Admin Dashboard (`/admin`)
Accessible only by authorized personnel.

- **Create Meals** – Define meals (e.g., Breakfast, Lunch).
- **Add Menu Items** – Add dishes (e.g., Rice, Daal).
- **Add Dining Halls** – Add serving areas or locations.
- **Assign Menu Items to Meals** – Set how many pots of each dish are prepared for a meal.
- ** to Dining Halls** – Distribute dishes to each hall.
- **Track Delivered Pots** – Update delivery counts as pots are distributed.
- **Complete Meal** – Locks the meal to prevent changes once service ends.

### 📊 Public Dashboard (`/`)
- **Meal Selector** – View data for a selected meal.
- **Menu Overview** – Shows each dish and total pots prepared.
- **Grouped Pot Assignments** – For each dining hall, view assigned and delivered pots per dish.

---

## 🛠 Tech Stack

- **React + TypeScript** for UI
- **Firebase Firestore** for realtime data
- **Custom CSS (no Tailwind)** for styling
- **Vite** for fast local development

---

## 📁 Folder Structure

```
src/
  components/          → Reusable form and table components
  pages/
    Dashboard.tsx      → Public view for kitchen/dining tracking
    AdminDashboard.tsx → Admin tools and forms
  firebase.ts          → Firestore config
  styles/              → Custom CSS modules
```

---

## 🧪 Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/dashboard.git
   cd dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   Create a `.env` file in the root with the following:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the app**
   ```bash
   npm run dev
   ```

---

## 📝 Notes

- Only **finalized meals** are visible on the public dashboard.
- All updates reflect in **real-time** via Firestore subscriptions.
- The live stream section is a placeholder for future video integration.

---

## 🙏 Acknowledgements

Built for efficient and transparent food distribution during high-volume events like **Jalsa Salana** and other community gatherings.
