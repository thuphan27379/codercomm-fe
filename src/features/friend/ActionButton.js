import { Button, Stack } from "@mui/material";
import React from "react";
import { useDispatch } from "react-redux";

import {
  acceptRequest,
  cancelRequest, //
  declineRequest,
  removeFriend,
  sendFriendRequest,
} from "./friendSlice";

//
function ActionButton({ currentUserId, targetUserId, friendship, sx }) {
  const dispatch = useDispatch();

  if (currentUserId === targetUserId) return null;

  // btn send request, default when without friendship
  const btnSendRequest = (
    <Button
      sx={{ fontSize: "0.6rem", ...sx }}
      size="small"
      variant="contained"
      onClick={() => dispatch(sendFriendRequest(targetUserId))}
    >
      Send Request
    </Button>
  );

  if (!friendship) return btnSendRequest;

  // btn unfriend
  const btnUnfriend = (
    <Button
      sx={{ fontSize: "0.6rem", ...sx }}
      size="small"
      variant="contained"
      color="error"
      onClick={() => dispatch(removeFriend(targetUserId))}
    >
      Unfriend
    </Button>
  );
  // btn resend
  const btnResend = (
    <Button
      sx={{ fontSize: "0.6rem", ...sx }}
      size="small"
      variant="contained"
      onClick={() => dispatch(sendFriendRequest(targetUserId))}
    >
      {friendship.from === currentUserId ? "Resend" : "Send"} Request
    </Button>
  );
  // btn cancel request //
  const btnCancelRequest = (
    <Button
      sx={{ fontSize: "0.6rem", ...sx }}
      size="small"
      variant="contained"
      color="error"
      onClick={() => dispatch(cancelRequest(targetUserId))}
    >
      Cancel Request
    </Button>
  );
  // btn acceptRequest & declineRequest
  const btnGroupReact = (
    <Stack direction="row" spacing={1}>
      <Button
        sx={{ fontSize: "0.6rem", ...sx }}
        size="small"
        variant="contained"
        color="success"
        onClick={() => dispatch(acceptRequest(targetUserId))}
      >
        Accept
      </Button>
      <Button
        size="small"
        variant="outlined"
        color="error"
        onClick={() => dispatch(declineRequest(targetUserId))}
      >
        Decline
      </Button>
    </Stack>
  );

  if (friendship.status === "accepted") {
    return btnUnfriend;
  }

  if (friendship.status === "declined") {
    return btnResend;
  }

  if (friendship.status === "pending") {
    const { from, to } = friendship;
    if (from === currentUserId && to === targetUserId) {
      return btnCancelRequest;
    } else if (from === targetUserId && to === currentUserId) {
      return btnGroupReact;
    }
  }

  return btnSendRequest;
}

export default ActionButton;
