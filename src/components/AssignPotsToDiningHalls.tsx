import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

interface Props {
  refreshKey?: number;
  onUpdate?: () => void;
}

export default function AssignPotsToDiningHalls({ refreshKey, onUpdate }: Props) {
  const [meals, setMeals] = useState<any[]>([]);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [diningHalls, setDiningHalls] = useState<any[]>([]);
  const [selectedMealId, setSelectedMealId] = useState("");
  const [selectedHallId, setSelectedHallId] = useState("");
  const [assignedPots, setAssignedPots] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchStaticData = async () => {
      const mealSnap = await getDocs(collection(db, "meals"));
      const hallSnap = await getDocs(collection(db, "diningHalls"));
      setMeals(mealSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setDiningHalls(hallSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchStaticData();
  }, [refreshKey]);

  useEffect(() => {
    const fetchMenuItems = async () => {
      if (!selectedMealId) return;
      const q = query(collection(db, "mealMenuItems"), where("mealId", "==", selectedMealId));
      const snap = await getDocs(q);
      const items = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMenuItems(items);
    };
    fetchMenuItems();
  }, [selectedMealId]);

  useEffect(() => {
    const fetchExistingAssignments = async () => {
      if (!selectedMealId || !selectedHallId) return;
      const q = query(
        collection(db, "potAssignments"),
        where("mealId", "==", selectedMealId),
        where("diningHallId", "==", selectedHallId)
      );
      const snap = await getDocs(q);
      const existing: Record<string, number> = {};
      snap.forEach(doc => {
        const data = doc.data();
        existing[data.menuItemId] = data.assignedPots;
      });
      setAssignedPots(existing);
    };
    fetchExistingAssignments();
  }, [selectedMealId, selectedHallId]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMealId || !selectedHallId) return;

    for (const [menuItemId, pots] of Object.entries(assignedPots)) {
      if (pots <= 0) continue;

      const q = query(
        collection(db, "potAssignments"),
        where("mealId", "==", selectedMealId),
        where("menuItemId", "==", menuItemId),
        where("diningHallId", "==", selectedHallId)
      );
      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const docRef = snapshot.docs[0].ref;
        await updateDoc(docRef, { assignedPots: pots });
      } else {
        await addDoc(collection(db, "potAssignments"), {
          mealId: selectedMealId,
          menuItemId,
          diningHallId: selectedHallId,
          assignedPots: pots,
          deliveredPots: 0,
        });
      }
    }

    alert("Pots assigned successfully.");
    if (onUpdate) onUpdate();
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow w-full">
      <form onSubmit={handleAssign} className="flex flex-col gap-4">
        <select
          value={selectedMealId}
          onChange={(e) => setSelectedMealId(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="">Select a meal...</option>
          {meals.map(meal => (
            <option key={meal.id} value={meal.id}>{meal.name}</option>
          ))}
        </select>

        {selectedMealId && (
          <>
            <select
              value={selectedHallId}
              onChange={(e) => setSelectedHallId(e.target.value)}
              className="border p-2 rounded"
            >
              <option value="">Select a dining hall...</option>
              {diningHalls.map(hall => (
                <option key={hall.id} value={hall.id}>{hall.name}</option>
              ))}
            </select>

            {selectedHallId && menuItems.length > 0 && (
              <div className="space-y-3">
                {menuItems.map(item => (
                  <div key={item.menuItemId} className="flex items-center justify-between border p-2 rounded">
                    <div>{item.dishName || item.name}</div>
                    <input
                      type="number"
                      min={0}
                      value={assignedPots[item.menuItemId] || 0}
                      onChange={(e) =>
                        setAssignedPots(prev => ({
                          ...prev,
                          [item.menuItemId]: Number(e.target.value),
                        }))
                      }
                      className="w-20 border p-1 text-center"
                    />
                  </div>
                ))}
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Assign Pots
                </button>
              </div>
            )}
          </>
        )}
      </form>
    </div>
  );
}
