import {useEffect, useState} from "react";
import {
    collection,
    getDocs,
    query,
    where,
    onSnapshot,
    doc
} from "firebase/firestore";
import {db} from "../firebase";
import styles from "./Dashboard.module.css";

interface Meal {
    id: string;
    name: string;
    isComplete: boolean;
}

interface MenuItem {
    id: string;
    menuItemId: string;
    dishName: string;
    totalPots: number;
}

interface Assignment {
    id: string;
    menuItemId: string;
    diningHallId: string;
    assignedPots: number;
    deliveredPots: number;
    dishName?: string;
    hallName?: string;
}

export default function Dashboard() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [selectedMealId, setSelectedMealId] = useState("");
    const [selectedMealName, setSelectedMealName] = useState("");
    const [isComplete, setIsComplete] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [diningHalls, setDiningHalls] = useState<Record<string, string>>({});
    const [rawAssignments, setRawAssignments] = useState<Assignment[]>([]);

    useEffect(() => {
        const fetchMeals = async () => {
            const snap = await getDocs(collection(db, "meals"));
            const data = snap.docs.map(doc => ({id: doc.id, ...doc.data()} as Meal));
            setMeals(data);
        };

        const fetchDiningHalls = async () => {
            const snap = await getDocs(collection(db, "diningHalls"));
            const halls: Record<string, string> = {};
            snap.docs.forEach(doc => halls[doc.id] = doc.data().name);
            setDiningHalls(halls);
        };

        fetchMeals();
        fetchDiningHalls();
    }, []);

    useEffect(() => {
        const unsubscribeConfig = onSnapshot(doc(db, "config", "activeMeal"), (docSnap) => {
            if (docSnap.exists()) {
                const newMealId = docSnap.data().mealId;
                setSelectedMealId(newMealId);
            }
        });

        return () => unsubscribeConfig();
    }, []);

    useEffect(() => {
        if (!selectedMealId) return;

        const unsubscribe1 = onSnapshot(
            query(collection(db, "mealMenuItems"), where("mealId", "==", selectedMealId)),
            snap => {
                const data = snap.docs.map(doc => ({id: doc.id, ...doc.data()} as MenuItem));
                setMenuItems(data);
            }
        );

        const unsubscribe2 = onSnapshot(
            query(collection(db, "potAssignments"), where("mealId", "==", selectedMealId)),
            snap => {
                const data = snap.docs.map(doc => ({id: doc.id, ...doc.data()} as Assignment));
                setRawAssignments(data);
            }
        );

        return () => {
            unsubscribe1();
            unsubscribe2();
        };
    }, [selectedMealId]);

    useEffect(() => {
        const fetchUpdatedMeals = async () => {
            const snap = await getDocs(collection(db, "meals"));
            const data = snap.docs.map(doc => ({id: doc.id, ...doc.data()} as Meal));
            setMeals(data);

            const mealRef = data.find(m => m.id === selectedMealId);
            setIsComplete(mealRef?.isComplete || false);
            setSelectedMealName(mealRef?.name || "");
        };

        if (selectedMealId) {
            fetchUpdatedMeals();
        }
    }, [selectedMealId]);

    useEffect(() => {
        if (!selectedMealId) return;

        const enriched = rawAssignments.map(a => ({
            ...a,
            dishName: menuItems.find(m => m.menuItemId === a.menuItemId)?.dishName || "Unknown Dish",
            hallName: diningHalls[a.diningHallId] || "Unknown Hall",
        }));

        setAssignments(enriched);
    }, [selectedMealId, rawAssignments, menuItems, diningHalls]);

    const groupedAssignments = assignments.reduce((acc, assignment) => {
        const hallName = assignment.hallName || "Unknown Hall";
        if (!acc[hallName]) acc[hallName] = [];
        acc[hallName].push(assignment);
        return acc;
    }, {} as Record<string, Assignment[]>);

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.header}>
                    <div className={styles.titleArea}>
                        <img src="/assets/jalsa-logo.png" alt="Logo" className={styles.logo}/>
                        <h1 className={styles.title}>Langar Dashboard</h1>
                    </div>
                    <div className={styles.controls}>
                          <span className={styles.mealName}>
                            {selectedMealName}
                          </span>
                        {isComplete && <span className={styles.completed}>✅ Complete</span>}
                    </div>

                </div>

                {selectedMealId && (
                    <div className={styles.content}>
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Menu</h2>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>Dish</th>
                                    <th>Total Pots</th>
                                </tr>
                                </thead>
                                <tbody>
                                {menuItems.map(item => (
                                    <tr key={item.id}>
                                        <td className={styles.dishName}>{item.dishName}</td>
                                        <td>{item.totalPots}</td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        </div>

                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Food Distribution</h2>
                            <table className={styles.table}>
                                <thead>
                                <tr>
                                    <th>Dining Hall</th>
                                    <th>Dish</th>
                                    <th>Assigned</th>
                                    <th>Delivered</th>
                                </tr>
                                </thead>
                                <tbody>
                                {Object.entries(groupedAssignments).flatMap(([hall, items]) => (
                                    items.map((a, index) => (
                                        <tr key={a.id}>
                                            {index === 0 && (
                                                <td rowSpan={items.length} className={styles.hallName}>{hall}</td>
                                            )}
                                            <td>{a.dishName}</td>
                                            <td>{a.assignedPots}</td>
                                            <td>{a.deliveredPots}</td>
                                        </tr>
                                    ))
                                ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
