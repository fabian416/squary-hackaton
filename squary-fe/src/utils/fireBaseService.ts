import { doc, getDoc } from 'firebase/firestore';
import { firestore } from '../firebaseConfig';

// Recibe el `currentUser` como parámetro
export const fetchAliases = async (currentUser: string): Promise<Record<string, string>> => {
  try {
    // Referencia al documento del usuario en la colección `friends`
    const userDocRef = doc(firestore, 'friends', currentUser);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      const data = userDoc.data();
      // Devuelve los alias en formato { dirección: nickname }
      return Object.fromEntries(
        Object.entries(data || {}).map(([address, value]: [string, any]) => [
          address,
          value.nickname,
        ])
      );
    } else {
      console.error(`No document found for user: ${currentUser}`);
      return {};
    }
  } catch (error) {
    console.error('Error fetching aliases:', error);
    return {};
  }
};