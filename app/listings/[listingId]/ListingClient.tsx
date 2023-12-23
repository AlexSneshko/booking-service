"use client";

import axios from "axios";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Range } from "react-date-range";
import { useRouter } from "next/navigation";
import { differenceInDays, eachDayOfInterval } from "date-fns";

import useLoginModal from "@/app/hooks/useLoginModal";
import {
  SafeComment,
  SafeListing,
  SafeReservation,
  SafeUser,
} from "@/app/types";

import Container from "@/app/components/Container";
import { categories } from "@/app/components/navbar/Categories";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";
import { Comment } from "@/app/components/Comment";
import { getEmotionalAnalisis } from "@/app/actions/getEmotionalAnalisis";

const initialDateRange = {
  startDate: new Date(),
  endDate: new Date(),
  key: "selection",
};

interface ListingClientProps {
  reservations?: SafeReservation[];
  listing: SafeListing & {
    user: SafeUser;
  };
  currentUser?: SafeUser | null;
  comments?: SafeComment[];
}

const ListingClient: React.FC<ListingClientProps> = ({
  listing,
  reservations = [],
  currentUser,
  comments = [],
}) => {
  const loginModal = useLoginModal();
  const router = useRouter();

  const disabledDates = useMemo(() => {
    let dates: Date[] = [];

    reservations.forEach((reservation: any) => {
      const range = eachDayOfInterval({
        start: new Date(reservation.startDate),
        end: new Date(reservation.endDate),
      });

      dates = [...dates, ...range];
    });

    return dates;
  }, [reservations]);

  const category = useMemo(() => {
    return categories.find((items) => items.label === listing.category);
  }, [listing.category]);

  const [isLoading, setIsLoading] = useState(false);
  const [totalPrice, setTotalPrice] = useState(listing.price);
  const [dateRange, setDateRange] = useState<Range>(initialDateRange);
  const [emotionalProperties, setEmotionalProperties] = useState<any>([]);

  const onCreateReservation = useCallback(() => {
    if (!currentUser) {
      return loginModal.onOpen();
    }
    setIsLoading(true);

    axios
      .post("/api/reservations", {
        totalPrice,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        listingId: listing?.id,
      })
      .then(() => {
        toast.success("Listing reserved!");
        setDateRange(initialDateRange);
        router.push("/trips");
      })
      .catch(() => {
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [totalPrice, dateRange, listing?.id, router, currentUser, loginModal]);

  const [commentText, setCommentText] = useState("");
  const [commentRating, setCommentRating] = useState(0);

  const handleAddComment = () => {
    if (!currentUser) {
      return loginModal.onOpen();
    }

    axios
      .post(`/api/comments/${listing.id}`, {
        text: commentText,
        rating: commentRating,
      })
      .then(() => {
        toast.success("Comment added!");
        router.refresh();
      })
      .catch((error) => {
        console.log(error);
        toast.error("Something went wrong while adding the comment.");
      });
  };

  useEffect(() => {
    if (dateRange.startDate && dateRange.endDate) {
      const dayCount = differenceInDays(dateRange.endDate, dateRange.startDate);

      if (dayCount && listing.price) {
        setTotalPrice(dayCount * listing.price);
      } else {
        setTotalPrice(listing.price);
      }
    }
  }, [dateRange, listing.price]);

  useEffect(() => {
    const text = comments.map((comment) => comment.text).join(" ");

    getEmotionalAnalisis(text).then((res) => {
      const filteredRes = res.map((emotion: any) => {
        return {
          ...emotion,
          score: `${Math.trunc(emotion.score * 100)}%`,
        };
      });

      setEmotionalProperties(
        filteredRes.slice(0, 5).filter((emotion: any) => emotion.score !== "0%")
      );
    });
  }, []);

  return (
    <Container>
      <div
        className="
          max-w-screen-lg 
          mx-auto
        "
      >
        <div className="flex flex-col gap-6">
          <ListingHead
            title={listing.title}
            imageSrc={listing.imageSrc}
            locationValue={listing.locationValue}
            id={listing.id}
            currentUser={currentUser}
          />
          <div
            className="
              grid 
              grid-cols-1 
              md:grid-cols-7 
              md:gap-10 
              mt-6
            "
          >
            <ListingInfo
              user={listing.user}
              category={category}
              description={listing.description}
              roomCount={listing.roomCount}
              guestCount={listing.guestCount}
              bathroomCount={listing.bathroomCount}
              locationValue={listing.locationValue}
            />
            <div
              className="
                order-first 
                mb-10 
                md:order-last 
                md:col-span-3
              "
            >
              <ListingReservation
                price={listing.price}
                totalPrice={totalPrice}
                onChangeDate={(value) => setDateRange(value)}
                dateRange={dateRange}
                onSubmit={onCreateReservation}
                disabled={isLoading}
                disabledDates={disabledDates}
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Emotional propeties:</h2>
        {emotionalProperties.lenth === 0 ? (
          <h2>No commets yet</h2>
        ) : (
          <div className="flex justify-between">
            {emotionalProperties.map((emotionalProperty: any) => (
              <p key={emotionalProperty.label}>
                {emotionalProperty.label}: {emotionalProperty.score}
              </p>
            ))}
          </div>
        )}
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Add Comment</h2>
        {currentUser ? (
          <>
            <div className="flex gap-4 mb-4">
              <input
                type="text"
                placeholder="Enter your comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="p-2 border border-gray-300 w-full"
              />
              <input
                type="number"
                placeholder="Rating (1-5)"
                value={commentRating}
                onChange={(e) => setCommentRating(Number(e.target.value))}
                className="p-2 border border-gray-300 w-1/4"
              />
            </div>
            <button
              onClick={handleAddComment}
              className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 cursor-pointer"
            >
              Add Comment
            </button>
          </>
        ) : (
          <h2 className="text-gray-500 text-xl">
            Please login to add comment.
          </h2>
        )}
      </div>
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-4">Comments</h2>
        {comments.length === 0 ? (
          <h2>No commets yet</h2>
        ) : (
          <>
            {comments.map((comment: any) => (
              <Comment
                key={comment.id}
                text={comment.text}
                author={comment.user}
                createdAt={comment.createdAt}
                rating={comment.rating}
              />
            ))}
          </>
        )}
      </div>
    </Container>
  );
};

export default ListingClient;
