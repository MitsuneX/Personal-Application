import { redirect } from "next/navigation";

export default function TokusatsuPage() {
  redirect("/characters?category=tokusatsu");
}
