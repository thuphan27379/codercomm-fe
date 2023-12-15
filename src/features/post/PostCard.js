import React from "react";
import {
  Box,
  Link,
  Card,
  Stack,
  Avatar,
  Typography,
  CardHeader,
  IconButton,
  Popover,
  Button,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { fDate } from "../../utils/formatTime";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import PostReaction from "./PostReaction";
import CommentForm from "../comment/CommentForm";
import CommentList from "../comment/CommentList";

import { useDispatch, useSelector } from "react-redux";
import { deletePost } from "../post/postSlice";
import { editPost } from "../post/postSlice";

//show list of posts
function PostCard({ post }) {
  //popover on icon to delete or edit
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    // setIsEditing(false); // Reset editing mode when closing the popover
  };

  const open = Boolean(anchorEl);

  // a window will pop up asking for confirmation to delete.
  // ?!?!

  // handleDelete a post
  const dispatch = useDispatch();
  const currentUser = useSelector((state) => state.user.currentUser);

  const handleDelete = () => {
    // Dispatch the deletePost action with the postId
    if (currentUser) {
    }
    dispatch(deletePost({ postId: post._id }));

    handleClose(); //close popover
  };

  // handleEdit a post
  const [editedContent, setEditedContent] = React.useState(post.content); // New state for edited content
  const [isEditing, setIsEditing] = React.useState(false); // State to track editing mode

  const handleEdit = () => {
    setIsEditing(true); // Set editing mode to true when the "Edit" button is clicked
  };

  const handleSave = () => {
    // Dispatch the editPost action with the edited content and post ID
    dispatch(editPost({ postId: post._id, content: editedContent }));
    setIsEditing(false); // Reset editing mode after saving changes
    handleClose();
  };

  const handleContentChange = (e) => {
    e.stopPropagation();
    setEditedContent(e.target.value);
  };

  const handleInputMouseDown = (e) => {
    // Stop the event propagation to prevent closing the popover when clicking on the input
    e.stopPropagation();
  };

  //
  return (
    <Card>
      <CardHeader
        disableTypography
        avatar={
          <Avatar src={post?.author?.avatarUrl} alt={post?.author?.name} />
        }
        title={
          <Link
            variant="subtitle2"
            color="text.primary"
            component={RouterLink}
            sx={{ fontWeight: 600 }}
            to={`/user/${post.author._id}`}
          >
            {post?.author?.name}
          </Link>
        }
        subheader={
          <Typography
            variant="caption"
            sx={{ display: "block", color: "text.secondary" }}
          >
            {fDate(post.createdAt)}
          </Typography>
        }
        action={
          <IconButton>
            <MoreVertIcon onClick={handleClick} sx={{ fontSize: 30 }} />
          </IconButton>
        }
      />

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
      >
        <Button sx={{ p: 1, fontSize: 10 }} onClick={handleDelete}>
          Delete
        </Button>{" "}
        |
        {!isEditing ? (
          <Button sx={{ p: 1, fontSize: 10 }} onClick={handleEdit}>
            Edit
          </Button>
        ) : (
          <Button sx={{ p: 1, fontSize: 10 }} onClick={handleSave}>
            Save
          </Button>
        )}{" "}
      </Popover>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography>{post.content}</Typography>
        {isEditing && (
          <input
            type="text"
            value={editedContent}
            onChange={handleContentChange}
            onMouseDown={handleInputMouseDown}
          />
        )}
        {post.image && (
          <Box
            sx={{
              borderRadius: 2,
              overflow: "hidden",
              height: 300,
              "& img": { objectFit: "cover", width: 1, height: 1 },
            }}
          >
            <img src={post.image} alt="post" />
          </Box>
        )}

        <PostReaction post={post} />
        <CommentList postId={post._id} />
        <CommentForm postId={post._id} />
      </Stack>
    </Card>
  );
}

export default PostCard;
