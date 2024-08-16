import React, { useCallback, useState } from "react";
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
  alpha,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Modal from "@mui/material/Modal";
import { useDispatch, useSelector } from "react-redux";
import { LoadingButton } from "@mui/lab";
// import { useFormContext, Controller } from "react-hook-form";

import { fDate } from "../../utils/formatTime";
import PostReaction from "./PostReaction";
import CommentForm from "../comment/CommentForm";
import CommentList from "../comment/CommentList";
import { deletePost, editPost } from "../post/postSlice";
import { FTextField, FUploadImage, FormProvider } from "../../components/form";

// 1. khi edit post, chýa lýu l?i ðý?c content v?i image bài post. Khi click cancel th? v?n update luôn
// 2. ? tab send request, b?m cancel request th? b? l?i nhý h?nh

//show a post with comment and reaction, delete/edit
const yupSchema = Yup.object().shape({
  content: Yup.string().required("Content is required"),
});

// const defaultValues = {
//   content: "",
//   image: null,
// };

//show list of posts
function PostCard({ post }) {
  // default value fai nam ben trong function
  const defaultValues = {
    content: post.content,
    image: post.image,
  };

  const [IsEditing, setIsEditing] = useState(true);

  //popover on icon to delete or edit
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
    setIsEditing(false); // Reset editing mode when closing the popover
  };

  const open = Boolean(anchorEl);
  // a window will pop up asking for confirmation to delete.

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
  const [isEditing] = React.useState(false); // State to track editing mode
  const [openModal, setOpenModal] = React.useState(false);

  // const handleEdit = () => {
  //   // dispatch(PostForm({}));
  //   setIsEditing(true); // Set editing mode to true when the "Edit" button is clicked
  // };

  // const handleSave = () => {
  //   // Dispatch the editPost action with the edited content and post ID
  //   dispatch(
  //     editPost({ postId: post._id, content: editedContent, image: post.image })
  //   );
  //   setIsEditing(false); // Reset editing mode after saving changes
  //   handleClose();
  // };

  const handleContentChange = (e) => {
    e.stopPropagation();
    setEditedContent(e.target.value);
  };

  const handleInputMouseDown = (e) => {
    // Stop the event propagation to prevent closing the popover when clicking on the input
    e.stopPropagation();
  };

  //
  const methods = useForm({
    resolver: yupResolver(yupSchema),
    defaultValues,
  });

  // const { setValue } = methods;

  // edit image
  // const handleDrop = useCallback(
  //   (acceptedFiles) => {
  //     const file = acceptedFiles[0];

  //     if (file) {
  //       setValue(
  //         "image",
  //         Object.assign(file, {
  //           preview: URL.createObjectURL(file),
  //         })
  //       );
  //     }
  //   },
  //   [setValue]
  // );

  // modal edit
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const {
    handleSubmit,
    formState: { isSubmitting },
    reset,
    setValue,
  } = methods;

  // post slide
  const onSubmit = (data) => {
    if (!data.image && post.image) {
      data.image = post.image;
    }

    dispatch(
      editPost({ postId: post._id, content: data.content, image: data.image })
    ).then(() => reset());

    handleClose(); //close popover
  };

  const handleDrop = useCallback(
    (acceptedFiles) => {
      const file = acceptedFiles[0];

      if (file) {
        setValue(
          "image",
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        );
      }
    },
    [setValue]
  );

  const { isLoading } = useSelector((state) => state.post);

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

      {/* popover */}
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
        </Button>
        |
        <div>
          <Button sx={{ p: 1, fontSize: 10 }} onClick={handleOpenModal}>
            Edit
          </Button>

          {/* popup modal delete & edit */}
          <Modal
            open={openModal}
            onClose={handleCloseModal}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
          >
            <Card
              sx={{
                p: 3,
                width: 500,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2}>
                  <FTextField
                    // content of the Post, not placeholder?!?!
                    name="content"
                    multiline
                    fullWidth
                    rows={4}
                    // placeholder={post.content}
                    sx={{
                      "& fieldset": {
                        borderWidth: `1px !important`,
                        borderColor: alpha("#919EAB", 0.32),
                      },
                    }}
                  />

                  {/* UPLOAD A FILE: btn choose File  */}
                  {/* <input type="file" ref={fileInput} onChange={handleFile} /> */}
                  <FUploadImage
                    // upload image with the Post, the image of the post?!?!
                    name="image"
                    accept="image/*"
                    maxSize={3145728}
                    onDrop={handleDrop}
                  />

                  <Box
                    // button submit a Post
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "flex-end",
                    }}
                  >
                    <LoadingButton
                      // loading...
                      // type="cancel"
                      variant="contained"
                      size="small"
                      onClick={handleCloseModal} //
                      // loading={isSubmitting || isLoading}
                      disabled={isSubmitting || isLoading}
                    >
                      Cancel
                    </LoadingButton>
                    <LoadingButton
                      // loading...
                      type="submit"
                      variant="contained"
                      size="small"
                      loading={isSubmitting || isLoading}
                    >
                      Edit
                    </LoadingButton>
                  </Box>
                </Stack>
              </FormProvider>
            </Card>
          </Modal>
        </div>
      </Popover>

      {/* content */}
      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography>{post.content}</Typography>
        {/* {isEditing && (
          <input
            type="text"
            value={editedContent}
            onChange={handleContentChange}
            onMouseDown={handleInputMouseDown}
          />
        )} */}

        {/* media */}
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
