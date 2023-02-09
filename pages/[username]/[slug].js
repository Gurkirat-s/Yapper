import styles from '../../styles/Post.module.css';
import PostContent from '@/components/PostContent';
import { db, getUserWithUsername, postToJSON } from '@/lib/firebase';
import {
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
} from 'firebase/firestore';
import React, { useContext } from 'react';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import AuthCheck from '../../components/AuthCheck';
import Link from 'next/link';
import HeartButton from '../../components/HeartButton';
import { UserContext } from '@/lib/context';

export const getStaticProps = async ({ params }) => {
  const { username, slug } = params;
  const userDoc = await getUserWithUsername(username);

  let post;
  let path;

  if (userDoc) {
    const postRef = doc(db, userDoc.ref.path, 'posts', slug);

    post = postToJSON(await getDoc(postRef));

    path = postRef.path;
  }

  return {
    props: { post, path },
    revalidate: 100,
  };
};

export const getStaticPaths = async () => {
  const q = query(collectionGroup(db, 'posts'), limit(20));
  const snapshot = await getDocs(q);

  const paths = snapshot.docs.map((doc) => {
    const { slug, username } = doc.data();
    return {
      params: { username, slug },
    };
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

export const Post = (props) => {
  const postRef = doc(db, props.path);
  const [realtimePost] = useDocumentData(postRef);

  const post = realtimePost || props.post;

  const { user: currentUser } = useContext(UserContext);

  return (
    <main className={styles.container}>
      <section>
        <PostContent post={post} />
      </section>
      <aside className="card">
        <p>
          <strong>{post.heartCount || 0} ❤️</strong>
        </p>

        <AuthCheck
          fallback={
            <Link href="/enter">
              <button>Sign Up</button>
            </Link>
          }
        >
          <HeartButton postRef={postRef} />
        </AuthCheck>

        {currentUser?.uid === post.uid && (
          <Link href={`/admin/${post.slug}`}>
            <button className="btn-blue">Edit Post</button>
          </Link>
        )}
      </aside>
    </main>
  );
};
export default Post;
