export default function BlogPost({ params }: { params: { blogID: string } }) {
    return (
        <div>
            <h1>Blog Post {params.blogID}</h1>
            <p>This is a blog post.</p>
        </div>
    );
}