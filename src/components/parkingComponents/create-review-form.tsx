"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Star } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comments: z
    .string()
    .min(1, "Comment is required")
    .max(500, "Comment must be 500 characters or less"),
});

type ReviewFormData = z.infer<typeof reviewSchema>;

export default function ParkingSpotReviewForm({
  parkingSpotId,
  parkingSpotUuid,
  refresh,
}: {
  parkingSpotId: number;
  parkingSpotUuid: string;
  refresh: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comments: "",
    },
  });


  useEffect(() => {
    async function fetchUser() {
      const res = await axiosInstance.get("/auth");
      setUser(res.data);
    }
    fetchUser();
  }, []);


  const onSubmit = async (data: ReviewFormData) => {
    setIsSubmitting(true);

    if (!user) {
      toast.error("Please login to book a parking spot");
      setIsSubmitting(false);
      localStorage.setItem("redirectBackToParking", `/parking/${parkingSpotUuid}`);
      router.push("/login");
      return;
    }

    try {
      const res = await axiosInstance.post(
        "/public/parking-app/parking-spots/create-review",
        {
          ...data,
          parkingSpot: parkingSpotId,
        },
        {
          headers: {
            user_uuid: user?.id || "",
          },
        }
      );
      if (res.status === 201) {
        toast.success("Thank you for your feedback!");
        form.reset();
        refresh();
      }
    } catch (error) {
      console.log("Error submitting review:", error);
      toast.error("Failed to submit review. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader>
        <CardTitle className="font-mont-semibold">Leave a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mont-semibold">Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={uuidv4()}
                          className={`w-6 h-6 cursor-pointer ${star <= field.value
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                            }`}
                          onClick={() => field.onChange(star)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormDescription>
                    Select a rating from 1 to 5 stars
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comments"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mont-semibold">Comments</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={5}
                      placeholder="Share your experience..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide details about your experience (max 500 characters)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full font-mont-medium py-4"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
