import CreateMealForm from "../components/CreateMealForm";
import AddMenuItemForm from "../components/AddMenuItemForm";
import AddDiningHallForm from "../components/AddDiningHallForm";
import AssignMenuItemsToMeal from "../components/AssignMenuItemsToMeal";
import AssignPotsToDiningHalls from "../components/AssignPotsToDiningHalls";
import UpdateDeliveredPots from "../components/UpdateDeliveredPots";
import FinalizeMeal from "../components/FinalizeMeal";
import styles from "./AdminDashboard.module.css";

export default function AdminDashboard() {
  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Admin Dashboard</h1>

      <div className={styles.cardGroup}>
        <div className={styles.card}><CreateMealForm /></div>
        <div className={styles.card}><AddMenuItemForm /></div>
        <div className={styles.card}><AddDiningHallForm /></div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Assign Menu Items to Meal</h2>
        <div className={styles.card}><AssignMenuItemsToMeal /></div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Assign Pots to Dining Halls</h2>
        <div className={styles.card}><AssignPotsToDiningHalls /></div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Update Delivered Pots</h2>
        <div className={styles.card}><UpdateDeliveredPots /></div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Finalize Meal</h2>
        <div className={styles.card}><FinalizeMeal /></div>
      </div>
    </div>
  );
}
