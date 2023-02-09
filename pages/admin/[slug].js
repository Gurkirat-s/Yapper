import AuthCheck from '@/components/AuthCheck';
import { auth, db } from '@/lib/firebase';
import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { useDocumentDataOnce } from 'react-firebase-hooks/firestore';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import styles from '../../styles/AdminPostEdit.module.css';

const AdminPostEdit = (props) => {
  return (
    <AuthCheck>
      <PostManager />
    </AuthCheck>
  );
};

const PostManager = () => {
  const [preview, setPreview] = useState(false);

  const router = useRouter();
  const { slug } = router.query;

  const postRef = doc(db, 'users', auth.currentUser.uid, 'posts', slug);
  const [post] = useDocumentDataOnce(postRef);

  return (
    <main>
      {post && (
        <div className={styles.container}>
          <section className="card">
            <h1>{post.title}</h1>
            <p>ID: {post.slug}</p>

            <PostForm
              postRef={postRef}
              defaultValues={post}
              preview={preview}
            ></PostForm>
          </section>

          <aside className="card">
            <h3>Tools</h3>
            <button onClick={() => setPreview(!preview)}>
              {preview ? 'Edit' : 'Preview'}
            </button>
            <Link href={`/${post.username}/${post.slug}`}>
              <button className="btn-blue">Live View</button>
            </Link>
            <DeletePostButton postRef={postRef} />
          </aside>
        </div>
      )}
    </main>
  );
};

const PostForm = ({ defaultValues, postRef, preview }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty, isValid },
    reset,
    watch,
  } = useForm({
    defaultValues,
    mode: 'onChange',
  });

  // const { isValid, isDirty } = formState;

  const updatePost = async ({ content, published }) => {
    await updateDoc(postRef, {
      content,
      published,
      updatedAt: serverTimestamp(),
    });

    reset({ content, published });

    toast.success('Post updated Successfully!');
  };

  return (
    <form onSubmit={handleSubmit(updatePost)}>
      {preview && (
        <div className="card">
          <ReactMarkdown>{watch('content')}</ReactMarkdown>
        </div>
      )}

      <div className={styles.textBody}>
        <textarea
          {...register('content', {
            maxLength: { value: 20000, message: 'content is too long' },
            minLength: { value: 10, message: 'content is too short' },
            required: { value: true, message: 'content is required' },
          })}
        ></textarea>

        {errors.content && (
          <p className="text-danger">{errors.content.message}</p>
        )}

        <div className={styles.published}>
          <input
            className={styles.checkbox}
            type="checkbox"
            {...register('published')}
          />
          <label>Published</label>
        </div>

        <button
          type="submit"
          className="btn-green"
          disabled={!isDirty || !isValid}
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

const DeletePostButton = ({ postRef }) => {
  const router = useRouter();

  const deletePost = async () => {
    const doIt = confirm('Are you sure?');
    if (doIt) {
      await deleteDoc(postRef);
      router.push('/admin');
      toast('Post Deleted');
    }
  };

  return (
    <button className="btn-red" onClick={deletePost}>
      Delete
    </button>
  );
};

export default AdminPostEdit;
