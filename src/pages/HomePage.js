import React, { useState } from "react";
import { Box, Card, Container, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/material/styles";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import ContactMailIcon from "@mui/icons-material/ContactMail";
import PersonAddRoundedIcon from "@mui/icons-material/PersonAddRounded";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import { capitalCase } from "change-case";
import GroupAddIcon from "@mui/icons-material/GroupAdd";

import useAuth from "../hooks/useAuth";
import Profile from "../features/user/Profile";
import ProfileCover from "../features/user/ProfileCover";
import AddFriend from "../features/friend/AddFriend";
import FriendRequests from "../features/friend/FriendRequests";
import FriendList from "../features/friend/FriendList";
import OutgoingSents from "../features/friend/OutgoingSent";

//user profile page
const TabsWrapperStyle = styled("div")(({ theme }) => ({
  zIndex: 9,
  bottom: 0,
  width: "100%",
  display: "flex",
  position: "absolute",
  backgroundColor: "#fff",
  [theme.breakpoints.up("sm")]: {
    justifyContent: "center",
  },
  [theme.breakpoints.up("md")]: {
    justifyContent: "flex-end",
    paddingRight: theme.spacing(3),
  },
}));

//
function HomePage() {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState("profile");

  const handleChangeTab = (newValue) => {
    setCurrentTab(newValue);
  };
  //
  const PROFILE_TABS = [
    {
      value: "profile",
      icon: <AccountBoxIcon sx={{ fontSize: 24 }} />,
      component: <Profile profile={user} />,
    },
    {
      value: "friends",
      icon: <PeopleAltIcon sx={{ fontSize: 24 }} />,
      component: <FriendList />,
    },
    // incoming
    {
      value: "friend_requests",
      icon: <ContactMailIcon sx={{ fontSize: 24 }} />,
      component: <FriendRequests />,
    },
    {
      value: "add_friend",
      icon: <PersonAddRoundedIcon sx={{ fontSize: 24 }} />,
      component: <AddFriend />,
    },
    // User can see a list of requests that he/she has sent.
    // On the list, User can cancel the requests.
    // API: GET /api/friends/requests/outgoing
    {
      value: "sent_request",
      icon: <GroupAddIcon sx={{ fontSize: 24 }} />,
      component: <OutgoingSents />,
    },
  ];

  //render
  return (
    <Container>
      <Card
        sx={{
          mb: 3,
          height: 280,
          position: "relative",
        }}
      >
        <ProfileCover profile={user} />

        <TabsWrapperStyle>
          <Tabs
            value={currentTab}
            scrollButtons="auto"
            variant="scrollable"
            allowScrollButtonsMobile
            onChange={(e, value) => handleChangeTab(value)}
          >
            {PROFILE_TABS.map((tab) => (
              <Tab
                disableRipple
                key={tab.value}
                value={tab.value}
                icon={tab.icon}
                label={capitalCase(tab.value)}
              />
            ))}
          </Tabs>
        </TabsWrapperStyle>
      </Card>

      {PROFILE_TABS.map((tab) => {
        const isMatched = tab.value === currentTab;
        return isMatched && <Box key={tab.value}>{tab.component}</Box>;
      })}
    </Container>
  );
}

export default HomePage;
