import { HydrationGate } from "@/components/HydrationGate";
import { VelaApp } from "@/components/VelaApp";

export default function Home() {
  return (
    <HydrationGate>
      <VelaApp />
    </HydrationGate>
  );
}
