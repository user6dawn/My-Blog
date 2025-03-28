export default function BlogCard({ post, likePost, likedPosts, sharePost, isSharing }) {
  return (
    <div className="flex border rounded-lg shadow-md overflow-hidden mb-6">
      {/* ✅ Image (Left Side) */}
      {post.image_url && (
        <img 
          src={post.image_url} 
          alt={post.title} 
          className="w-1/3 h-40 object-cover " 
        />
      )}

      {/* ✅ Content (Right Side) */}
      <div className="w-2/3 p-4">
        {/* ✅ Title */}
        <h2 className="text-xl font-bold">{post.title}</h2>
        
        {/* ✅ Description */}
        <p className="text-gray-700">{post.content.slice(0, 100)}...</p>

        {/* ✅ Read More Link */}
        <a href={`/post/${post.id}`} className="text-blue-500 mt-2 inline-block">
          Read More
        </a>

        {/* ✅ Like & Share Buttons */}
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => likePost(post.id, post.likes)}
            disabled={likedPosts[post.id]} 
            className={`px-3 py-1 rounded ${
              likedPosts[post.id] ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-500 text-white"
            }`}
          >
            👍 {post.likes || 0} Likes
          </button>

          <button
            onClick={() => sharePost(post.title, post.id)}
            disabled={isSharing}
            className={`bg-green-500 text-white px-3 py-1 rounded ${
              isSharing ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {isSharing ? "Sharing..." : "🔗 Share"}
          </button>
        </div>
      </div>
    </div>
  );
}
