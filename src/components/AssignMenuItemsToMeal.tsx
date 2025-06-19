import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

interface MenuItem {
  id: string;
  name: string;
}

interface Meal {
  id: string;
  name: string;
}

interface Props {
  refreshKey?: number;
  onUpdate?: () => void;
}

export default function AssignMenuItemsToMeal({ refreshKey, onUpdate }: Props) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedMealId, setSelectedMealId] = useState("");
  const [potCounts, setPotCounts] = useState<Record<string, number>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      const snapshot = await getDocs(collection(db, "meals"));
      setMeals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal)));
    };

    const fetchMenuItems = async () => {
      const snapshot = await getDocs(collection(db, "menuItems"));
      setMenuItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuItem)));
    };

    fetchMeals();
    fetchMenuItems();
  }, [refreshKey]);

  useEffect(() => {
    const fetchExistingAssignments = async () => {
      if (!selectedMealId) return;
      const q = query(collection(db, "mealMenuItems"), where("mealId", "==", selectedMealId));
      const snap = await getDocs(q);
      const existing: Record<string, number> = {};
      snap.forEach(doc => {
        const data = doc.data();
        existing[data.menuItemId] = data.totalPots;
      });
      setPotCounts(existing);
    };
    fetchExistingAssignments();
  }, [selectedMealId]);

  const handlePotChange = (menuItemId: string, value: string) => {
    setPotCounts({
      ...potCounts,
      [menuItemId]: Number(value)
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMealId) {
      setStatus("Please select a meal.");
      return;
    }

    try {
      const q = query(
        collection(db, "mealMenuItems"),
        where("mealId", "==", selectedMealId)
      );
      const snap = await getDocs(q);

      const existingDocs: Record<string, string> = {};
      snap.forEach(docSnap => {
        const data = docSnap.data();
        if (data.menuItemId) {
          existingDocs[data.menuItemId] = docSnap.id;
        }
      });

      const tasks = menuItems
        .filter(item => potCounts[item.id] > 0)
        .map(item => {
          const existingDocId = existingDocs[item.id];
          const payload = {
            mealId: selectedMealId,
            menuItemId: item.id,
            dishName: item.name,
            totalPots: potCounts[item.id]
          };

          return existingDocId
            ? updateDoc(doc(db, "mealMenuItems", existingDocId), payload)
            : addDoc(collection(db, "mealMenuItems"), payload);
        });

      await Promise.all(tasks);

      setStatus("Menu items assigned.");
      setPotCounts({});
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
      setStatus("Error assigning items.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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

      <div className="space-y-2">
        {menuItems.map(item => (
          <div key={item.id} className="flex justify-between items-center">
            <span>{item.name}</span>
            <input
              type="number"
              min={0}
              value={potCounts[item.id] || ""}
              onChange={(e) => handlePotChange(item.id, e.target.value)}
              className="border rounded w-20 text-right p-1"
              placeholder="Pots"
            />
          </div>
        ))}
      </div>

      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Assign Dishes
      </button>
      {status && <p>{status}</p>}
    </form>
  );
}
