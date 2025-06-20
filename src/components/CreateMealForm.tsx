import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

interface CreateMealFormProps {
  onCreate?: () => void;
}

export default function CreateMealForm({ onCreate }: CreateMealFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addDoc(collection(db, "meals"), {
      name,
      isComplete: false,
      createdAt: serverTimestamp(),
    });

    setName("");
    if (onCreate) onCreate(); // Notify parent to refresh
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Meal Name"
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Create Meal
      </button>
    </form>
  );
}
