import { auth, db } from '../lib/firebase';
import { doc, increment, writeBatch } from 'firebase/firestore';
import { useDocument } from 'react-firebase-hooks/firestore';

const Heart = ({ postRef }) => {
  const heartRef = doc(db, postRef.path, 'hearts', auth.currentUser.uid);
  const [heartDoc] = useDocument(heartRef);

  const removeHeart = async () => {
    const batch = writeBatch(db);

    batch.update(postRef, { heartCount: increment(-1) });
    batch.delete(heartRef);

    await batch.commit();
  };

  const addHeart = async () => {
    const batch = writeBatch(db);

    batch.update(postRef, { heartCount: increment(1) });
    batch.set(heartRef, { uid: auth.currentUser.uid });

    await batch.commit();
  };

  return heartDoc?.exists() ? (
    <button onClick={removeHeart}>Unheart</button>
  ) : (
    <button onClick={addHeart}>Heart</button>
  );
};

export default Heart;
