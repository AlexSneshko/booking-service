import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export default async function getComments(params: IParams) {
  try {
    const { listingId } = params;

    const comments = await prisma.comment.findMany({
      where: {
        listingId: listingId,
      },
      include: {
        user: true,
      },
    });

    const safeComments = comments.map((comment) => {
      return {
        ...comment,
        createdAt: comment.createdAt.toISOString(),
        user: {
          ...comment.user,
          createdAt: comment.user.createdAt.toISOString(),
          updatedAt: comment.user.updatedAt.toISOString(),
          emailVerified: comment.user.emailVerified?.toISOString() || null,
        },
      };
    });

    return safeComments;
  } catch (error: any) {
    throw new Error(error);
  }
}
