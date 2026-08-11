import { redirect } from "next/navigation";

export default function UltramanPage() {
  redirect("/characters?category=tokusatsu&subtype=ultraman");
}
