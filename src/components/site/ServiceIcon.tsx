import { CircleDot, Cog, Disc3, Droplets, ScanLine, Snowflake, Wrench, Zap } from 'lucide-react';
import type { ServiceIcon as Key } from '@/config/site';

const ICONS = { scan: ScanLine, engine: Wrench, gear: Cog, bolt: Zap, snow: Snowflake, disc: Disc3, oil: Droplets, tire: CircleDot };

export function ServiceIcon({ name, className }: { name: Key; className?: string }) {
  const Icon = ICONS[name];
  return <Icon className={className} aria-hidden="true" />;
}
