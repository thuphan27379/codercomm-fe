import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

import apiService from "../../app/apiService";
import { POSTS_PER_PAGE } from "../../app/config";
import { cloudinaryUpload } from "../../utils/cloudinary";
import { getCurrentUserProfile } from "../user/userSlice";

//
const initialState = {
  isLoading: false,
  error: null,
  postsById: {},
  currentPagePosts: [],
};

// createSlice all the slices
const slice = createSlice({
  name: "post",
  initialState,
  reducers: {
    // create all type of actions
    startLoading(state) {
      state.isLoading = true;
    },
    //
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    ///////fix bug about get list of posts of currentUser
    // declare all posts are empty before getPosts
    resetPosts(state, action) {
      state.postsById = {};
      state.currentPagePosts = [];
    },
    // get all posts
    getPostsSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      const { posts, count } = action.payload;

      posts.forEach((post) => {
        state.postsById[post._id] = post;
        if (!state.currentPagePosts.includes(post._id))
          state.currentPagePosts.push(post._id);
      });
      state.totalPosts = count;
    },
    // create a new post
    createPostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const newPost = action.payload;
      if (state.currentPagePosts.length % POSTS_PER_PAGE === 0)
        state.currentPagePosts.pop();
      state.postsById[newPost._id] = newPost;
      state.currentPagePosts.unshift(newPost._id);
    },
    // reaction a post
    sendPostReactionSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { postId, reactions } = action.payload;
      state.postsById[postId].reactions = reactions;
    },
    // delete a post
    deletePostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { postId } = action.payload;

      // Remove the deleted post from the state
      delete state.postsById[postId];

      // Remove the postId from currentPagePosts array
      state.currentPagePosts = state.currentPagePosts.filter(
        (id) => id !== postId
      );
    },
    // edit a post & image
    editPostSuccess(state, action) {
      state.isLoading = false;
      state.error = null;

      // Check if the edited post data is available in the response
      // if (action.payload.success && action.payload.data) {
      const editedPost = action.payload;
      console.log(editedPost);

      // Find the index of the edited post in currentPagePosts
      const editedPostIndex = state.currentPagePosts.indexOf(editedPost._id);

      // Check if the edited post has a new image URL /////////////
      const newImage = editedPost.image
        ? editedPost.image
        : state.postsById[editedPost._id].image;

      // Update the post's content and image URL ///////////
      state.postsById[editedPost._id] = {
        ...state.postsById[editedPost._id],
        content: editedPost.content,
        image: newImage,
      };

      // If the edited post is in the current page posts, update it
      if (editedPostIndex !== -1) {
        state.currentPagePosts[editedPostIndex] = editedPost._id;
        // }
      }
      // state.postsById[editedPost._id] = editedPost;
    },
  },
});

export default slice.reducer;

// functions //
// get all posts
export const getPosts =
  ({ userId, page = 1, limit = POSTS_PER_PAGE }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = { page, limit };
      const response = await apiService.get(`/posts/user/${userId}`, {
        params,
      });
      ///////fix bug about get list of posts of currentUser
      if (page === 1) dispatch(slice.actions.resetPosts()); //reset posts before dispatch and show only posts of this currentUser
      dispatch(slice.actions.getPostsSuccess(response.data));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

// create a post
export const createPost =
  ({ content, image }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      // upload image to cloudinary.com - from PostForm.js
      const imageUrl = await cloudinaryUpload(image);
      const response = await apiService.post("/posts", {
        content,
        image: imageUrl,
      });

      dispatch(slice.actions.createPostSuccess(response.data));
      toast.success("Post successfully");
      dispatch(getCurrentUserProfile());
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

// react on the post
export const sendPostReaction =
  ({ postId, emoji }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(`/reactions`, {
        targetType: "Post",
        targetId: postId,
        emoji,
      });
      dispatch(
        slice.actions.sendPostReactionSuccess({
          postId,
          reactions: response.data,
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

// lam bai tap M2.3
// delete a post
// confirm delete
export const deletePost =
  ({ postId }) =>
  async (dispatch) => {
    // Show confirmation pop-up
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!isConfirmed) {
      // If user cancels the deletion, do nothing
      return;
    }

    dispatch(slice.actions.startLoading());
    try {
      // Correct the endpoint to delete a post
      await apiService.delete(`/posts/${postId}`);
      dispatch(slice.actions.deletePostSuccess({ postId }));

      // Show success notification
      toast.success("Post deleted successfully");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

// edit a post
// edit a image in the post ???
export const editPost =
  ({ postId, content, image }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());

    try {
      // upload image to cloudinary.com - from PostForm.js
      const imageUrl = await cloudinaryUpload(image);
      const response = await apiService.put(`/posts/${postId}`, {
        content,
        image: imageUrl,
      });

      // Log the entire response
      console.log("Edit Post Response:", response);

      dispatch(slice.actions.editPostSuccess(response.data));
      console.log(response.data);

      dispatch(getPosts({ userId: response.data.author }));
      toast.success("Post edited successfully");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
