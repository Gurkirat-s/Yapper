import React from 'react';
import UserProfile from '../../components/UserProfile';
import PostFeed from '../../components/PostFeed';
import { db, getUserWithUsername, postToJSON } from '@/lib/firebase';
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore';

export const getServerSideProps = async ({ query: urlQuery }) => {
  const { username } = urlQuery;

  const userDoc = await getUserWithUsername(username);

  // If no user, go to 404 page
  if (!userDoc) {
    return {
      notFound: true,
    };
  }

  let user = null;
  let posts = null;

  // Get posts by user userDoc
  if (userDoc) {
    user = userDoc.data();

    // console.log(userDoc);
    // console.log(userDoc.ref);
    // console.log(userDoc.ref.path);

    // userDoc.ref.path provides uid for user
    const postsQuery = query(
      collection(db, userDoc.ref.path, 'posts'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(5)
    );
    posts = (await getDocs(postsQuery)).docs.map(postToJSON);
  }

  // Gets passed as props to component
  return {
    props: { user, posts },
  };
};

export const UserProfilePage = ({ user, posts }) => {
  return (
    <main>
      <UserProfile user={user} />
      <PostFeed posts={posts} />
    </main>
  );
};

export default UserProfilePage;
