import { redirect } from "next/navigation";

export default function PowerRangersPage() {
  redirect("/characters?category=tokusatsu&subtype=power-rangers");
}
