import BlurFade from "@/components/magicui/blur-fade";
import { formatDate } from "@/lib/utils";
import { getBlogPosts } from "@/data/blog";
import Link from "next/link";

export const metadata = {
  title: "Blog",
  description: "My thoughts on software development, USC, and more.",
};

const BLUR_FADE_DELAY = 0.04;

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <section>
      <BlurFade delay={BLUR_FADE_DELAY}>
        <h1 className="font-medium text-xl sm:text-2xl mb-8 tracking-tighter">My thoughts on software development, USC, and more.</h1>
      </BlurFade>
      {posts
        .sort((a, b) => {
          if (
            new Date(a.metadata.publishedAt) > new Date(b.metadata.publishedAt)
          ) {
            return -1;
          }
          return 1;
        })
        .map((post, id) => (
          <BlurFade delay={BLUR_FADE_DELAY * 2 + id * 0.05} key={post.slug}>
            <Link
              className="flex flex-col space-y-1 mb-4 bg-gray-300 bg-opacity-40 p-4 rounded dark:bg-white dark:bg-opacity-10 hover:bg-gray-400 hover:bg-opacity-60 dark:hover:bg-gray-200 dark:hover:bg-opacity-30"
              href={`/blog/${post.slug}`}
            >
              <div className="w-full flex flex-col">
                <p className="text-base sm:text-xl tracking-tight">{post.metadata.title}</p>
                <p className="h-6 text-xs text-muted-foreground">
                  {formatDate(post.metadata.publishedAt)}
                </p>
              </div>
            </Link>
          </BlurFade>
        ))}
    </section>
  );
}
