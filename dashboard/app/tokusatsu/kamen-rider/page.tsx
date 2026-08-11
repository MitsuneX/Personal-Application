import { redirect } from "next/navigation";

export default function KamenRiderPage() {
  redirect("/characters?category=tokusatsu&subtype=kamen-rider");
}