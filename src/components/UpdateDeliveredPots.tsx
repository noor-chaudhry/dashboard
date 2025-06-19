import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import { db } from "../firebase";

interface Meal {
  id: string;
  name: string;
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

interface MenuItem {
  id: string;
  name: string;
}

interface DiningHall {
  id: string;
  name: string;
}

interface Props {
  refreshKey?: number;
  onUpdate?: () => void;
}

export default function UpdateDeliveredPots({ refreshKey, onUpdate }: Props) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [diningHalls, setDiningHalls] = useState<DiningHall[]>([]);
  const [selectedMealId, setSelectedMealId] = useState("");
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  useEffect(() => {
    const fetchStatic = async () => {
      const mealSnap = await getDocs(collection(db, "meals"));
      const itemSnap = await getDocs(collection(db, "menuItems"));
      const hallSnap = await getDocs(collection(db, "diningHalls"));

      setMeals(mealSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal)));
      setMenuItems(itemSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
      setDiningHalls(hallSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as DiningHall)));
    };

    fetchStatic();
  }, [refreshKey]);

  useEffect(() => {
    const fetchAssignments = async () => {
      if (!selectedMealId) return;
      const q = query(collection(db, "potAssignments"), where("mealId", "==", selectedMealId));
      const snap = await getDocs(q);
      const data = snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Assignment[];

      const enriched = data.map(a => ({
        ...a,
        dishName: menuItems.find(m => m.id === a.menuItemId)?.name || "Unknown",
        hallName: diningHalls.find(h => h.id === a.diningHallId)?.name || "Unknown"
      }));

      setAssignments(enriched);
    };

    fetchAssignments();
  }, [selectedMealId, menuItems, diningHalls]);

  const handleUpdate = async (id: string, newValue: number) => {
    const ref = doc(db, "potAssignments", id);
    await updateDoc(ref, {
      deliveredPots: newValue
    });

    setAssignments(prev =>
      prev.map(a => (a.id === id ? { ...a, deliveredPots: newValue } : a))
    );
    onUpdate?.();
  };

  const handleIncrement = (id: string) => {
    const current = assignments.find(a => a.id === id);
    if (current && current.deliveredPots < current.assignedPots) {
      handleUpdate(id, current.deliveredPots + 1);
    }
  };

  const groupedByHall = assignments.reduce((acc, a) => {
    if (!acc[a.hallName!]) acc[a.hallName!] = [];
    acc[a.hallName!].push(a);
    return acc;
  }, {} as Record<string, Assignment[]>);

  return (
    <div className="space-y-4">
      <select
        value={selectedMealId}
        onChange={(e) => setSelectedMealId(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">Select a meal...</option>
        {meals.map(meal => (
          <option key={meal.id} value={meal.id}>{meal.name}</option>
        ))}
      </select>

      {Object.entries(groupedByHall).map(([hall, items]) => (
        <div key={hall} className="border rounded-md bg-gray-50 p-3">
          <h3 className="font-semibold text-lg mb-3">{hall}</h3>
          <div className="grid grid-cols-2 gap-4">
            {items.map(a => (
              <div
                key={a.id}
                className="border p-3 flex flex-col justify-between rounded bg-white shadow-sm"
              >
                <div>
                  <div className="font-semibold">{a.dishName}</div>
                  <div className="text-sm text-gray-600">Assigned: {a.assignedPots}</div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={a.assignedPots}
                    value={a.deliveredPots}
                    onChange={(e) => handleUpdate(a.id, Number(e.target.value))}
                    className="w-16 border p-1 text-center"
                  />
                  <button
                    onClick={() => handleIncrement(a.id)}
                    className="bg-blue-600 text-white px-2 py-1 rounded"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
