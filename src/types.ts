export interface Post {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  likes: number;
  created_at: string;
  comment_count?: number;
}

export interface Comment {
  id: string;
  post_id: string;
  name: string;
  comment: string;
  created_at: string;
  parent_id: string | null;
  likes: number;
  replies?: Comment[];
}

export interface Ad {
  id: string;
  title: string;
  description?: string;
  image_url?: string;
  link_url: string;
  is_active: boolean;
  position: string;
  created_at: string;
}

export interface Subscriber {
  id: string;
  name: string;
  email: string;
  created_at: string;
}