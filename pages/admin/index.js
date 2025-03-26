import { supabase } from "../../lib/supabase";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Admin() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ✅ Upload Image to Supabase Storage
  const uploadImage = async (file) => {
    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`;
    const filePath = `blog-images/${fileName}`;

    const { data, error } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file);

    setUploading(false);

    if (error) {
      console.error("Image upload error:", error);
      alert("Error uploading image");
      return null;
    }

    // ✅ Get Public URL of Uploaded Image
    const { data: imageData } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filePath);

    return imageData.publicUrl;
  };

  // ✅ Handle Blog Post Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = null;
    if (image) {
      imageUrl = await uploadImage(image);
    }

    const { data, error } = await supabase.from("posts").insert([
      { title, content, image_url: imageUrl }
    ]);

    if (error) {
      console.error("Error adding post:", error);
      alert("Error adding post");
      return;
    }

    router.push("/");
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add New Blog Post</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 border"
          required
        />
        <textarea
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-2 border"
          required
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setImage(e.target.files[0])}
          className="w-full p-2 border"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          {uploading ? "Uploading..." : "Add Post"}
        </button>
      </form>
    </div>
  );
}
