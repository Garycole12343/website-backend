import React from "react";
import Header from "../components/navigation/Header";

const ProfilePage = () => (
  <div className="min-h-screen bg-background">
    <Header />
    <main className="max-w-5xl mx-auto px-4 py-10 space-y-4">
      <h1 className="text-3xl font-heading font-bold text-foreground">My Profile</h1>
      <p className="text-muted-foreground">
        This is the profile page. Show user info here.
      </p>
    </main>
  </div>
);

export default ProfilePage;
