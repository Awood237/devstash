// Mock data — single source of truth for the dashboard UI until the database
// is wired up. Shapes mirror the Prisma models in context/project-overview.md.

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isPro: boolean;
}

export interface ItemType {
  id: string;
  name: string;
  icon: string; // lucide icon name
  color: string;
  count: number;
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  itemCount: number;
  isFavorite: boolean;
  color: string;
  typeIds: string[]; // item types represented in the collection
}

export type ContentType = "text" | "file";

export interface Item {
  id: string;
  title: string;
  description: string | null;
  contentType: ContentType;
  content: string | null;
  typeId: string;
  collectionId: string | null;
  tags: string[];
  isFavorite: boolean;
  isPinned: boolean;
  createdAt: string; // ISO date
}

export const currentUser: User = {
  id: "user_1",
  name: "John Doe",
  email: "john@example.com",
  image: null,
  isPro: true,
};

export const itemTypes: ItemType[] = [
  { id: "type_snippet", name: "Snippets", icon: "Code2", color: "#3b82f6", count: 24 },
  { id: "type_prompt", name: "Prompts", icon: "Sparkles", color: "#a855f7", count: 18 },
  { id: "type_command", name: "Commands", icon: "SquareChevronRight", color: "#f97316", count: 15 },
  { id: "type_note", name: "Notes", icon: "FileText", color: "#eab308", count: 12 },
  { id: "type_file", name: "Files", icon: "File", color: "#9ca3af", count: 5 },
  { id: "type_image", name: "Images", icon: "Image", color: "#ec4899", count: 3 },
  { id: "type_url", name: "Links", icon: "Link", color: "#22c55e", count: 8 },
];

export const collections: Collection[] = [
  {
    id: "col_react",
    name: "React Patterns",
    description: "Common React patterns and hooks",
    itemCount: 12,
    isFavorite: true,
    color: "#3b82f6",
    typeIds: ["type_snippet", "type_note", "type_url"],
  },
  {
    id: "col_python",
    name: "Python Snippets",
    description: "Useful Python code snippets",
    itemCount: 8,
    isFavorite: false,
    color: "#3b82f6",
    typeIds: ["type_snippet", "type_note"],
  },
  {
    id: "col_context",
    name: "Context Files",
    description: "AI context files for projects",
    itemCount: 5,
    isFavorite: true,
    color: "#6b7280",
    typeIds: ["type_file", "type_note"],
  },
  {
    id: "col_interview",
    name: "Interview Prep",
    description: "Technical interview preparation",
    itemCount: 24,
    isFavorite: false,
    color: "#eab308",
    typeIds: ["type_note", "type_snippet", "type_url", "type_prompt"],
  },
  {
    id: "col_git",
    name: "Git Commands",
    description: "Frequently used git commands",
    itemCount: 15,
    isFavorite: true,
    color: "#f97316",
    typeIds: ["type_command", "type_note"],
  },
  {
    id: "col_ai_prompts",
    name: "AI Prompts",
    description: "Curated AI prompts for coding",
    itemCount: 18,
    isFavorite: false,
    color: "#a855f7",
    typeIds: ["type_prompt", "type_snippet", "type_note"],
  },
];

export function getItemType(typeId: string): ItemType | undefined {
  return itemTypes.find((type) => type.id === typeId);
}

export const items: Item[] = [
  {
    id: "item_use_auth",
    title: "useAuth Hook",
    description: "Custom authentication hook for React applications",
    contentType: "text",
    content:
      "export function useAuth() {\n  const { data: session } = useSession();\n  return { user: session?.user, isAuthenticated: !!session };\n}",
    typeId: "type_snippet",
    collectionId: "col_react",
    tags: ["react", "auth", "hooks"],
    isFavorite: true,
    isPinned: true,
    createdAt: "2026-01-15",
  },
  {
    id: "item_api_error",
    title: "API Error Handling Pattern",
    description: "Fetch wrapper with exponential backoff retry logic",
    contentType: "text",
    content:
      "async function fetchWithRetry(url, options, retries = 3) {\n  // exponential backoff retry logic\n}",
    typeId: "type_snippet",
    collectionId: "col_react",
    tags: ["api", "fetch", "error-handling"],
    isFavorite: false,
    isPinned: true,
    createdAt: "2026-01-12",
  },
  {
    id: "item_git_undo",
    title: "Undo Last Commit",
    description: "Reset the last commit while keeping your changes staged",
    contentType: "text",
    content: "git reset --soft HEAD~1",
    typeId: "type_command",
    collectionId: "col_git",
    tags: ["git", "commit"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-01-10",
  },
  {
    id: "item_refactor_prompt",
    title: "Refactor to Clean Code",
    description: "Prompt for asking AI to refactor code for readability",
    contentType: "text",
    content:
      "Refactor the following code for readability and maintainability without changing its behavior. Explain each change briefly.",
    typeId: "type_prompt",
    collectionId: "col_ai_prompts",
    tags: ["ai", "refactor", "clean-code"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-08",
  },
  {
    id: "item_py_dedupe",
    title: "Deduplicate a List",
    description: "Remove duplicates from a list while preserving order",
    contentType: "text",
    content: "unique = list(dict.fromkeys(items))",
    typeId: "type_snippet",
    collectionId: "col_python",
    tags: ["python", "list"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-06",
  },
  {
    id: "item_next_docs",
    title: "Next.js App Router Docs",
    description: "Official documentation for the Next.js App Router",
    contentType: "text",
    content: "https://nextjs.org/docs/app",
    typeId: "type_url",
    collectionId: "col_react",
    tags: ["nextjs", "docs"],
    isFavorite: false,
    isPinned: false,
    createdAt: "2026-01-04",
  },
  {
    id: "item_claude_context",
    title: "CLAUDE.md Template",
    description: "Starter context file for AI-assisted projects",
    contentType: "file",
    content: null,
    typeId: "type_file",
    collectionId: "col_context",
    tags: ["ai", "context", "template"],
    isFavorite: true,
    isPinned: false,
    createdAt: "2026-01-02",
  },
];
