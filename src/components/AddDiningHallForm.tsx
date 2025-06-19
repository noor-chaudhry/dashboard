import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

export default function AddDiningHallForm() {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await addDoc(collection(db, "diningHalls"), { name });
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Dining Hall Name"
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-purple-500 text-white px-4 py-2 rounded">
        Add Dining Hall
      </button>
    </form>
  );
}
