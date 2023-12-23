"use client";

import React, { useEffect, useState } from "react";
import { SafeUser } from "../types";
import { getEmotionalAnalisis } from "../actions/getEmotionalAnalisis";

interface CommentProps {
  text: string;
  rating: number;
  createdAt: string;
  author: SafeUser;
}

export const Comment: React.FC<CommentProps> = ({
  text,
  rating,
  createdAt,
  author,
}) => {
  const formattedDate = new Date(createdAt).toLocaleString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
  });
  const [emotionalRating, setEmotionalRating] = useState<any>([]);

  useEffect(() => {
    // getEmotionalAnalisis(text).then((res) => {
    //   const filteredRes = res.map((emotion: any) => {
    //     return {
    //       ...emotion,
    //       score: `${Math.trunc(emotion.score * 100)}%`,
    //     };
    //   });

    //   setEmotionalRating(filteredRes.slice(0, 3).filter((emotion: any) => emotion.score !== '0%'));
    // });
  }, []);

  return (
    <div className="bg-white p-4 shadow-md mb-4 ">
      <div className="flex items-center mb-4">
        <img
          src={author.image || "/images/placeholder.jpg"}
          alt={author.name || "user"}
          className="w-10 h-10 rounded-full mr-2"
        />
        <div>
          <p className="font-semibold">{author.name}</p>
          <p className="text-gray-500 text-sm">{formattedDate}</p>
        </div>
      </div>
      <p className="mb-2">{text}</p>
      <div className="flex items-center">
        <p className="mr-2">Rating: {rating}</p>
      </div>
      <div>
        {emotionalRating.map((emotion: any) =>
          <div key={emotion.label + 'a'}>
            <p>{emotion.label}</p>  
            <p>{emotion.score}</p>
          </div>
        )}
      </div>
    </div>
  );
};
