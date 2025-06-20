import { useEffect, useState } from "react";
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut
} from "firebase/auth";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs
} from "firebase/firestore";
import { auth, db } from "../firebase";

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

    const [showLogin, setShowLogin] = useState(true);
    const [email] = useState("admin@langar.us");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [selectedMealId, setSelectedMealId] = useState("");
    const [mealOptions, setMealOptions] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setShowLogin(!user);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        const fetchMeals = async () => {
            try {
                // Load all meals directly from the "meals" collection
                const snapshot = await getDocs(collection(db, "meals"));
                const meals = snapshot.docs.map(doc => ({
                    id: doc.id,
                    name: doc.data().name,
                }));
                setMealOptions(meals);

                // Load currently selected active meal
                const activeMealDoc = await getDoc(doc(db, "config", "activeMeal"));
                if (activeMealDoc.exists()) {
                    setSelectedMealId(activeMealDoc.data().mealId);
                }
            } catch (err) {
                console.error("Error loading meals:", err);
            }
        };

        fetchMeals();
    }, [refreshKey]);


    const handleMealChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const mealId = e.target.value;
        setSelectedMealId(mealId);
        await setDoc(doc(db, "config", "activeMeal"), { mealId });
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            setError("");
        } catch {
            setError("Invalid login credentials");
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
        setShowLogin(true);
        setPassword("");
    };

    if (showLogin) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <form
                    onSubmit={handleLogin}
                    className="bg-white p-6 rounded shadow space-y-4 w-80"
                >
                    <h2 className="text-xl font-bold text-center">Admin Login</h2>
                    {error && <p className="text-red-600 text-sm">{error}</p>}
                    <input
                        type="text"
                        value={email}
                        disabled
                        className="w-full border p-2 rounded bg-gray-100 text-gray-500"
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full border p-2 rounded"
                        required
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
                    >
                        Login
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.heading}>Admin Dashboard</h1>
            <div className={styles.logoutContainer}>
                <button onClick={handleLogout} className={styles.logoutButton}>
                    Logout
                </button>
            </div>

            <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Set Active Meal</h2>
                <select
                    id="meal-select"
                    value={selectedMealId}
                    onChange={handleMealChange}
                    className="border p-2 rounded w-full max-w-xs"
                >
                    <option value="">Select a meal...</option>
                    {mealOptions.map(meal => (
                        <option key={meal.id} value={meal.id}>{meal.name}</option>
                    ))}
                </select>
            </div>

            <div className={styles.cardGroup}>
            <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Create Meal</h2>
                    <CreateMealForm onCreate={triggerRefresh}/>
                </div>
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Add Menu Item</h2>
                    <AddMenuItemForm onCreate={triggerRefresh}/>
                </div>
                <div className={styles.card}>
                    <h2 className={styles.sectionTitle}>Add Dining Hall</h2>
                    <AddDiningHallForm onCreate={triggerRefresh}/>
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
