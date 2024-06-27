import Post from "./Post";
import PostSkeleton from "../skeletons/PostSkeleton";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
const Posts = ({ feedType, username, userId }) => {
  const getPostEndpoint = () => {
    switch (feedType) {
      case "forYou":
        console.log("forYou");
        return "/api/posts/all";
      case "following":
        console.log("following");

        return "/api/posts/following";
      case "posts":
        console.log("posts");
        return `/api/posts/user/${username}`;
      case "likes":
        console.log("likes");
        return `/api/posts/likes/${userId}`;
      default:
        return "/api/posts/all";
    }
  };
  const POST_ENDPOINT = getPostEndpoint();
  const {
    data: posts,
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ["posts"],
    queryFn: async () => {
      try {
        console.log("POST_ENDPOINT", POST_ENDPOINT);
        const res = await fetch(POST_ENDPOINT);
        const data = await res.json();
        console.log("api anne", data);
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(data.error || "something went wrong");
      }
    },
  });
  useEffect(() => {
    refetch();
  }, [feedType, refetch, username]);
  return (
    <>
      {(isLoading || isRefetching) && (
        <div className="flex flex-col justify-center">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      )}
      {/* {console.log("posts.data?.length", posts.data)} */}
      {!isLoading && !isRefetching && posts.data?.length === 0 && (
        <p className="text-center my-4">No posts in this tab. Switch 👻</p>
      )}
      {!isLoading && !isRefetching && posts.data && (
        <div>
          {posts.data.map((post) => (
            <Post feedType={feedType} key={post._id} post={post} />
          ))}
        </div>
      )}
    </>
  );
};
export default Posts;
