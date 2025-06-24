
export interface StoryType {
  id: string;
  title: string;
  content: string;
  images: [Image];
  createdAt: Date | null;
  updatedAt: Date;
}

export interface StoryHead {
  id: string;
  title: string;
  updatedAt: Date;
  coverImage: Image | null;
}

export interface Image{
  id: string;
  url: string;
  altText: string;

}

export interface DrawingMode {
  mode: "none" | "draw" | "erase";
  color: string;
  thickness: number;
}

export interface SidebarState {
  visible: boolean;
}
