import { supabase } from "../../lib/supabase";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

export default function Dashboard() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Check if the user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push("/admin"); // Redirect to login if not authenticated
      } else {
        setUser(session.user);
      }
    };
    checkUser();
  }, [router]);

  // ✅ Function to Upload Image and Return URL
  const uploadImage = async (file) => {
    try {
      setUploading(true);
      
      // Extract file extension (e.g., .png, .jpg)
      const fileExt = file.name.split(".").pop(); 
      const fileName = `${Date.now()}.${fileExt}`;  // Unique filename
      const filePath = `blog-images/${fileName}`;   // Storage path
  
      // Upload to Supabase Storage
      const { error } = await supabase.storage
        .from("blog-images")
        .upload(filePath, file);
  
      if (error) throw error;
  
      // ✅ Retrieve Public URL of Uploaded Image
      const { data } = await supabase.storage.from("blog-images").getPublicUrl(filePath);
  
      setUploading(false);
      return data.publicUrl; // Return public URL
    } catch (error) {
      setUploading(false);
      console.error("Image upload error:", error);
      alert("Error uploading image");
      return null;
    }
  };
  

  // ✅ Handle Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin"); // Redirect to login page after logout
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded">
          Logout
        </button>
      </div>

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
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Add Post"}
        </button>
      </form>
    </div>
  );
}
