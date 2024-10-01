export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  role?: string
  approved?: boolean
  tempKey?: string
  adminFor: number;
}

export interface UserResponse {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
  data: User[];
  support: {
    url: string;
    text: string;
  };
}
