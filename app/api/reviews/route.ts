import { NextResponse } from "next/server";
import { z } from "zod";
import { createPendingReview } from "@/lib/reviewStore";

const reviewSubmitSchema = z.object({
  productSlug: z.string().min(1),
  author: z.string().trim().min(2, "Please enter your name."),
  email: z.string().trim().email("Please enter a valid email address."),
  rating: z.number().int().min(1).max(5),
  title: z.string().trim().min(4, "Please enter a review headline (at least 4 characters)."),
  text: z.string().trim().min(15, "Please write a detailed review (at least 15 characters)."),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = reviewSubmitSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid review input." },
        { status: 400 }
      );
    }

    const review = createPendingReview(parsed.data);
    return NextResponse.json({ review }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to submit review right now." },
      { status: 500 }
    );
  }
}
