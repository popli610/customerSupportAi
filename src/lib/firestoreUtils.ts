import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function addUserToFirestore(user: { uid: string; email: string; name: string }) {
  try {
    // Ensure email and name are not null
    const email = user.email ?? "unknown@example.com"; // Provide a default or handle as needed
    const name = user.name ?? "Anonymous"; // Provide a default or handle as needed

    await setDoc(doc(db, "users", user.uid), {
      email,
      name,
      createdAt: new Date(),
    });
    console.log("User added to Firestore");
  } catch (e) {
    console.error("Error adding document: ", e);
  }
}
