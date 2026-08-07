"use client";

import React, { use } from "react";
import { MediaDetailsView } from "@/components/media/MediaDetailsView";

export default function DramaDossierPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  return <MediaDetailsView mediaId={resolvedParams.id} mediaType="drama" />;
}
