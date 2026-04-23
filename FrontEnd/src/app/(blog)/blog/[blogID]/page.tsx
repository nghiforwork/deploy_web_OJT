type PageProps = {
  params: Promise<{ blogID: string }>;
};

export default async function BlogPost({ params }: PageProps) {
  const { blogID } = await params;
  return (
    <div>
      <h1>Blog Post {blogID}</h1>
      <p>This is a blog post.</p>
    </div>
  );
}