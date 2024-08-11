import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";

export default function UserProfile({ userId }: { userId: string }) {
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    async function fetchUserData() {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setUserData(docSnap.data());
      } else {
        console.log("No such document!");
      }
    }

    fetchUserData();
  }, [userId]);

  if (!userData) return <div>Loading...</div>;

  return (
    <div>
      <h1>User Profile</h1>
      <p>Email: {userData.email}</p>
      <p>Created At: {userData.createdAt.toDate().toString()}</p>
    </div>
  );
}
