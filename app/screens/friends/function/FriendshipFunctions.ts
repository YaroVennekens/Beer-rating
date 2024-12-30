import { Alert } from 'react-native';
import { get, onValue, push, ref, remove, set, update } from 'firebase/database';
import { db } from '@/app/firebase/firebaseConfig';

/** Fetch username for a given userId *//** Fetch username for a given userId */
export const fetchUsername = async (userId: string): Promise<string> => {
    try {
      const userRef = ref(db, `users/${userId}/username`);
      return new Promise<string>((resolve, reject) => {
        onValue(
          userRef,
          (snapshot) => {
            const username = snapshot.val() as string | null;
            resolve(username || 'Unknown');
          },
          (error) => {
            console.error('Error fetching username:', error);
            reject('Onbekend');
          },
          { onlyOnce: true }
        );
      });
    } catch (error) {
      console.error('Error in fetchUsername:', error);
      return 'Onbekend';
    }
  };

/** Verstuur vriendschap verzoek */
/** Verstuur vriendschap verzoek */
export const sendFriendRequest = async (receiverId: string, currentUserId: string) => {
  try {
    if (!currentUserId) {
      Alert.alert('Error', 'Je moet ingelogd zijn voor vriendschap verzoeken te sturen.');
      return;
    }

    const receiverUsername = await fetchUsername(receiverId);

    // Controleer of er al een vriendschap verzoek naar deze persoon is verstuurd
    const existingRequestRef = ref(db, `friendRequests`);
    const snapshot = await get(existingRequestRef);
    const existingRequests = snapshot.val() as Record<string, { receiverId: string; senderId: string; status: string }>;

    // Zoek naar een verzoek dat naar de receiverId is gestuurd en de status 'pending' heeft
    const isRequestSent = Object.values(existingRequests).some(
      (request) =>
        request.receiverId === receiverId &&
        request.senderId === currentUserId &&
        request.status === 'pending'
    );

    if (isRequestSent) {
      Alert.alert('Error', 'Je hebt al een vriendschap verzoek gestuurd naar deze persoon.');
      return;
    }

    // Verstuur nieuw vriendschap verzoek
    const newFriendRequestRef = push(ref(db, 'friendRequests'));
    await set(newFriendRequestRef, {
      senderId: currentUserId,
      receiverId: receiverId,
      status: 'pending',
    });

    Alert.alert('Success', `Vriendschap verzoek verzonden naar ${receiverUsername}.`);
  } catch (error) {
    Alert.alert('Error', 'Kon geen vriendschap verzoek sturen.');
    console.error(error);
  }
};

/** Wijger vriendschap verzoek */
export const handleRejectRequest = async (
  requestId: string,
  setFriendRequests: React.Dispatch<React.SetStateAction<FriendRequest[]>>
): Promise<void> => {
  try {
    await remove(ref(db, `friendRequests/${requestId}`));
    setFriendRequests((prevRequests) =>
      prevRequests.filter((request) => request.id !== requestId)
    );
    Alert.alert('Success', 'Vriendschap verzoek afgewezen!');
  } catch (error) {
    Alert.alert('Error', 'Fout op gedoken bij het afwijzen van het vriendschap verzoek.');
    console.error(error);
  }
};

/** Accepteer vriendschap verzoek */
export const handleAcceptRequest = async (
  requestId: string,
  senderId: string,
  currentUserId: string
): Promise<void> => {
  try {
    if (!currentUserId) {
      Alert.alert('Error', 'Je bent niet ingelogd.');
      return;
    }

    await update(ref(db, `friendRequests/${requestId}`), {
      status: 'accepted',
    });

    const updates: Record<string, boolean> = {};
    updates[`users/${currentUserId}/friends/${senderId}`] = true;
    updates[`users/${senderId}/friends/${currentUserId}`] = true;

    await update(ref(db), updates);

    await remove(ref(db, `friendRequests/${requestId}`));

    Alert.alert('Success', 'Vriendschap verzoek geaccepteerd');
  } catch (error) {
    Alert.alert('Error', 'Er is een fout opgedoken bij het accepteren van vriendschap verzoek.');
    console.error(error);
  }
};

/** Vriend verwijderen */
export const handleRemoveFriend = async (
  friendId: string,
  currentUserId: string,
  setFriends: React.Dispatch<React.SetStateAction<Friend[]>>
): Promise<void> => {
  try {
    if (!currentUserId) return;

    // Updates for removing the friendship
    const updates: Record<string, null> = {
      [`users/${currentUserId}/friends/${friendId}`]: null,
      [`users/${friendId}/friends/${currentUserId}`]: null,
    };

    await update(ref(db), updates);

    setFriends((prevFriends) => prevFriends.filter((friend) => friend.id !== friendId));

    Alert.alert('Success', 'Vriend succesvol verwijderd.');
  } catch (error) {
    Alert.alert('Error', 'Er is een fout opgetreden bij het verwijderen van de vriend.');
    console.error(error);
  }
};


interface FriendRequest {
  id: string;
  senderId: string;
  receiverId: string;
  status: string;
}

interface Friend {
  id: string;
  username: string;
}