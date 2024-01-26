import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiService from "../../app/apiService"; //ket noi server
import { COMMENTS_PER_POST } from "../../app/config";
// import { confirmAlert } from "react-confirm-alert";

// trang thai khoi tao ban dau, quy dinh cac thanh phan cua slice
const initialState = {
  isLoading: false,
  error: null,
  commentsByPost: {},
  totalCommentsByPost: {},
  currentPageByPost: {},
  commentsById: {},
};

// createSlice for all slices
const slice = createSlice({
  name: "comment",
  initialState,
  reducers: {
    // create types of actions
    startLoading(state) {
      state.isLoading = true;
    },
    //
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },
    //
    getCommentsSuccess(state, action) {
      state.isLoading = false;
      state.error = "";
      const { postId, comments, count, page } = action.payload;

      comments.forEach(
        (comment) => (state.commentsById[comment._id] = comment)
      );

      state.commentsByPost[postId] = comments
        .map((comment) => comment._id)
        .reverse();

      state.totalCommentsByPost[postId] = count;
      state.currentPageByPost[postId] = page;
    },
    //
    createCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
    },
    //
    sendCommentReactionSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { commentId, reactions } = action.payload;
      state.commentsById[commentId].reactions = reactions;
    },
    //
    deleteCommentSuccess(state, action) {
      state.isLoading = false;
      state.error = null;
      const { commentId, postId } = action.payload;

      // Remove the deleted comment from the state
      delete state.commentsById[commentId];

      state.totalCommentsByPost[postId]--;

      // Remove the commentId from commentsByPost array
      state.commentsByPost = Object.fromEntries(
        Object.entries(state.commentsByPost).map(([postId, comments]) => [
          postId,
          comments.filter((id) => id !== commentId),
        ])
      );

      // Show success notification
      toast.success("Comment deleted successfully");
    },
  },
});

export default slice.reducer;

// functions //
// get all comments
export const getComments =
  ({ postId, page = 1, limit = COMMENTS_PER_POST }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const params = {
        page: page,
        limit: limit,
      };
      const response = await apiService.get(`/posts/${postId}/comments`, {
        params,
      });
      dispatch(
        slice.actions.getCommentsSuccess({
          ...response.data,
          postId,
          page,
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

// create a comment
export const createComment =
  ({ postId, content }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post("/comments", {
        content,
        postId,
      });
      dispatch(slice.actions.createCommentSuccess(response.data));
      dispatch(getComments({ postId }));
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

// reaction on a comment
export const sendCommentReaction =
  ({ commentId, emoji }) =>
  async (dispatch) => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await apiService.post(`/reactions`, {
        targetType: "Comment",
        targetId: commentId,
        emoji,
      });
      dispatch(
        slice.actions.sendCommentReactionSuccess({
          commentId,
          reactions: response.data,
        })
      );
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };

// delete a comment
// confirm delete
export const deleteComment =
  ({ postId, commentId }) =>
  async (dispatch) => {
    // Show confirmation pop-up
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );

    if (!isConfirmed) {
      // If user cancels the deletion, do nothing
      return;
    }

    dispatch(slice.actions.startLoading());
    try {
      // Correct the endpoint to delete a comment
      await apiService.delete(`/comments/${commentId}`);
      dispatch(slice.actions.deleteCommentSuccess({ commentId }));
      dispatch(getComments({ postId }));

      // Show success notification
      toast.success("Comment deleted successfully");
    } catch (error) {
      dispatch(slice.actions.hasError(error.message));
      toast.error(error.message);
    }
  };
