import { useState } from "react";
import CreateMealForm from "../components/CreateMealForm";
import AddMenuItemForm from "../components/AddMenuItemForm";
import AddDiningHallForm from "../components/AddDiningHallForm";
import AssignMenuItemsToMeal from "../components/AssignMenuItemsToMeal";
import AssignPotsToDiningHalls from "../components/AssignPotsToDiningHalls";
import UpdateDeliveredPots from "../components/UpdateDeliveredPots";
import CompleteMeal from "../components/CompleteMeal";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey(prev => prev + 1);

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Dashboard</h1>

      <div className={styles.cardGroup}>
        <div className={styles.card}>
          <CreateMealForm onCreate={triggerRefresh} />
        </div>
        <div className={styles.card}>
          <AddMenuItemForm onCreate={triggerRefresh} />
        </div>
        <div className={styles.card}>
          <AddDiningHallForm onCreate={triggerRefresh} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Assign Menu Items to Meal</h2>
        <div className={styles.card}>
          <AssignMenuItemsToMeal refreshKey={refreshKey} onUpdate={triggerRefresh} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Assign Pots to Dining Halls</h2>
        <div className={styles.card}>
          <AssignPotsToDiningHalls refreshKey={refreshKey} onUpdate={triggerRefresh} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Update Delivered Pots</h2>
        <div className={styles.card}>
          <UpdateDeliveredPots refreshKey={refreshKey} onUpdate={triggerRefresh} />
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Complete Meal</h2>
        <div className={styles.card}>
          <CompleteMeal refreshKey={refreshKey} onUpdate={triggerRefresh} />
        </div>
      </div>
    </div>
  );
}
