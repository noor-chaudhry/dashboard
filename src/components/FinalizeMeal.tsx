import { useEffect, useState } from "react";
import { collection, doc, getDocs, updateDoc } from "firebase/firestore";
import { db } from "../firebase";

interface Meal {
  id: string;
  name: string;
  isFinal?: boolean;
}

export default function FinalizeMeal() {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [selectedMealId, setSelectedMealId] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchMeals = async () => {
      const snap = await getDocs(collection(db, "meals"));
      const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Meal));
      setMeals(data.filter(m => !m.isFinal)); // Only show active meals
    };

    fetchMeals();
  }, []);

  const handleFinalize = async () => {
    if (!selectedMealId) return;

    const ref = doc(db, "meals", selectedMealId);
    await updateDoc(ref, {
      isFinal: true,
      finalizedAt: new Date()
    });

    setStatus("Meal finalized.");
    setMeals(prev => prev.filter(m => m.id !== selectedMealId));
    setSelectedMealId("");
  };

  return (
    <div className="space-y-3">
      <select
        value={selectedMealId}
        onChange={(e) => setSelectedMealId(e.target.value)}
        className="w-full border rounded p-2"
      >
        <option value="">Select active meal...</option>
        {meals.map(meal => (
          <option key={meal.id} value={meal.id}>
            {meal.name}
          </option>
        ))}
      </select>

      <button
        disabled={!selectedMealId}
        onClick={handleFinalize}
        className="bg-red-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
      >
        Finalize Meal
      </button>

      {status && <p>{status}</p>}
    </div>
  );
}
