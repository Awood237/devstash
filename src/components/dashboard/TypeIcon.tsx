import {
  Code,
  Code2,
  File,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  SquareChevronRight,
  StickyNote,
  Terminal,
  type LucideIcon,
} from "lucide-react";

// Maps the `icon` strings stored on ItemType to lucide components. Covers both
// the mock-data names (Code2, SquareChevronRight, FileText) used by the sidebar
// and the seeded DB names (Code, Terminal, StickyNote).
const iconMap: Record<string, LucideIcon> = {
  Code,
  Code2,
  Sparkles,
  SquareChevronRight,
  Terminal,
  FileText,
  StickyNote,
  File,
  Image: ImageIcon,
  Link: LinkIcon,
};

export function TypeIcon({
  name,
  color,
  className,
}: {
  name: string;
  color?: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? File;
  return <Icon color={color} className={className} />;
}
