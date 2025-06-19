import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";

interface AddMenuItemFormProps {
  onCreate?: () => void;
}

export default function AddMenuItemForm({ onCreate }: AddMenuItemFormProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await addDoc(collection(db, "menuItems"), { name });
    setName("");

    if (onCreate) onCreate(); // Notify parent (AdminDashboard) of change
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Menu Item Name"
        className="border p-2 w-full"
      />
      <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded">
        Add Menu Item
      </button>
    </form>
  );
}
