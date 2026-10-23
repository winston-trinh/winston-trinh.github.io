import { NavBar } from '../components/NavBar'
import { Reveal } from '../components/Reveal'
import { DATA } from '../data/resume'
import { POSTS, postUrl, type PostMeta } from './posts'
import { BuildingAPortfolio } from './posts/BuildingAPortfolio'
import styles from './Blog.module.css'

const CONTENT: Record<string, () => JSX.Element> = {
  'building-a-portfolio-that-looks-back': BuildingAPortfolio,
}

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        © {new Date().getFullYear()} {DATA.name}. Built with React, TypeScript & Vite.
      </div>
    </footer>
  )
}

export function BlogIndex() {
  return (
    <>
      <NavBar home="/" />
      <main>
        <section className="section" aria-labelledby="blog-title">
          <div className="container">
            <Reveal>
              <p className="eyebrow">Blog</p>
              <h1 id="blog-title" className="section-title">
                Things I’ve written.
              </h1>
            </Reveal>
            <ul className={styles.list}>
              {POSTS.map((post) => (
                <li key={post.slug}>
                  <Reveal>
                    <a className={`card ${styles.postCard}`} href={postUrl(post.slug)}>
                      <div className={styles.cardMedia}>
                        <img src={post.image} alt="" loading="lazy" />
                      </div>
                      <div className={styles.cardBody}>
                        <p className={styles.cardMeta}>
                          {post.date} · {post.readTime}
                        </p>
                        <h2 className={styles.cardTitle}>{post.title}</h2>
                        <p className={styles.cardDek}>{post.dek}</p>
                        <span className={styles.readMore}>Read the post ›</span>
                      </div>
                    </a>
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

export function BlogPost({ post }: { post: PostMeta }) {
  const Content = CONTENT[post.slug]
  return (
    <>
      <NavBar home="/" />
      <main>
        <header className={`${styles.col} ${styles.hero}`}>
          <a className={styles.back} href="/blog/">
            ‹ All posts
          </a>
          <p className="eyebrow">Engineering &amp; Design</p>
          <h1 className={styles.title}>{post.title}</h1>
          <p className={styles.dek}>{post.dek}</p>
          <div className={styles.byline}>
            <span>
              By <strong>{DATA.name}</strong>, USC Computer Science ’24
            </span>
            <span>{post.date}</span>
            <span>{post.readTime}</span>
          </div>
        </header>
        <article className={`${styles.col} ${styles.article}`}>
          <Content />
        </article>
      </main>
      <Footer />
    </>
  )
}

export function BlogApp({ page }: { page: string }) {
  const post = POSTS.find((p) => p.slug === page)
  return post ? <BlogPost post={post} /> : <BlogIndex />
}
