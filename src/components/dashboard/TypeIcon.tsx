import {
  Code2,
  File,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  SquareChevronRight,
  type LucideIcon,
} from "lucide-react";

// Maps the `icon` strings stored on ItemType (mock data) to lucide components.
const iconMap: Record<string, LucideIcon> = {
  Code2,
  Sparkles,
  SquareChevronRight,
  FileText,
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
