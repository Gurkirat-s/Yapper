import { auth, db } from '@/lib/firebase';
import {
  collection,
  doc,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import React, { useContext, useState } from 'react';
import AuthCheck from '../../components/AuthCheck';
import { useCollection } from 'react-firebase-hooks/firestore';
import PostFeed from '@/components/PostFeed';
import { useRouter } from 'next/router';
import { UserContext } from '@/lib/context';
import kebabCase from 'lodash.kebabcase';
import { toast } from 'react-hot-toast';

const AdminPostsPage = (props) => {
  return (
    <main>
      <AuthCheck>
        <Postlist />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
};

// Client side render, no need for SEO for hidden admin page, which shows only when logged in.
const Postlist = () => {
  const ref = collection(db, 'users', auth.currentUser.uid, 'posts');
  const postQuery = query(ref, orderBy('createdAt'));

  const [querySnapshot] = useCollection(postQuery);

  const posts = querySnapshot?.docs.map((doc) => doc.data());

  return (
    <div>
      <h1>Manage your Posts</h1>
      <PostFeed posts={posts} admin />
    </div>
  );
};

const CreateNewPost = () => {
  const router = useRouter();
  const { username } = useContext(UserContext);
  const [title, setTitle] = useState('');

  const slug = encodeURI(kebabCase(title));

  const isValid = title.length > 3 && title.length < 100;

  const createPost = async (e) => {
    e.preventDefault();
    const uid = auth.currentUser.uid;
    const ref = doc(db, 'users', uid, 'posts', slug);

    const data = {
      title,
      slug,
      uid,
      username,
      published: false,
      content: '# hello world!',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      heartCount: 0,
    };

    await setDoc(ref, data);

    toast.success('Post created!');

    router.push(`/admin/${slug}`);
  };

  return (
    <form onSubmit={createPost}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="My article"
        className={StyleSheet.input}
      />
      <p>
        <strong>Slug: </strong> {slug}
      </p>
      <button type="submit" disabled={!isValid} className="btn-green">
        Create New Post
      </button>
    </form>
  );
};

export default AdminPostsPage;
