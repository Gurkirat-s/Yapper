import Loader from '../components/Loader';
import {
  collectionGroup,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  Timestamp,
  where,
} from 'firebase/firestore';
import { db, postToJSON } from '@/lib/firebase';
import PostFeed from '@/components/PostFeed';
import { useState } from 'react';

const LIMIT = 5;

export const getServerSideProps = async () => {
  const postsRef = collectionGroup(db, 'posts');
  const postsQuery = query(
    postsRef,
    where('published', '==', true),
    orderBy('createdAt', 'desc'),
    limit(LIMIT)
  );

  const posts = (await getDocs(postsQuery)).docs.map(postToJSON);

  return {
    props: { posts },
  };
};

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);
  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    if (posts.length < LIMIT) {
      setPostsEnd(true);
      return;
    }

    setLoading(true);
    const last = posts[posts.length - 1] > 0 ? posts[posts.length - 1] : 0;

    const cursor =
      typeof last.createdAt === 'number'
        ? Timestamp.fromMillis(last.createdAt)
        : last.createdAt;

    const ref = collectionGroup(db, 'posts');
    const postsQuery = query(
      ref,
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      startAfter(cursor),
      limit(LIMIT)
    );

    const newPosts = (await getDocs(postsQuery)).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };

  return (
    <main>
      <div className="card card-banner">
        <h2>Welcome to YAPPER</h2>
        <p>
          Yapper is social media made with Next.js and React. Sign up for an
          account, write posts, then heart content created by other users. All
          public content is server-rendered and search engine optimized.
        </p>
      </div>

      <PostFeed posts={posts} />

      {!loading && !postsEnd && (
        <button onClick={getMorePosts}>Load more</button>
      )}

      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  );
}
