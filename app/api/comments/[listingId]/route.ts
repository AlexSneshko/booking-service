import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export async function POST(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const body = await request.json();

  const { listingId } = params;
  const { text, rating } = body;

  console.log(params);
  console.log(body);

  if (
    !listingId ||
    typeof listingId !== "string" ||
    !text ||
    typeof text !== "string" ||
    !rating ||
    typeof rating !== "number"
  ) {
    throw new Error("Invalid input data");
  }

  const comment = await prisma.comment.create({
    data: {
      userId: currentUser.id,
      listingId,
      text,
      rating,
    },
  });

  return NextResponse.json(comment);
}
