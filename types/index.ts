export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface Idea {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface IdeaWithTags extends Idea {
  tags: string[];
  submitter_email?: string;
  like_count?: number;
  is_liked?: boolean;
}

export interface Tag {
  id: string;
  idea_id: string;
  tag_name: string;
}

export interface AuthPayload {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// Extend next-auth Session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    email?: string;
    name?: string | null;
  }
}
