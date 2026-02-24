import styles from './page.module.scss';

export default function Blog() {
  return (
    <div>
      <h1>Blog Posts</h1>
      <div className={styles.blogGrid}>
        {[1, 2, 3].map(post => (
          <article
            key={post}
            className={styles.blogCard}
          >
            <h2>Sample Blog Post {post}</h2>
            <p>This is a sample blog post to showcase the new styling. The blog section has a dark theme with modern aesthetics.</p>
            <div className={styles.blogMeta}>
              <span>Posted on: {new Date().toLocaleDateString()}</span>
              <span>Category: Sample</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
