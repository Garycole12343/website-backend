import React from "react";
import { Link } from "react-router-dom";

export default function AboutUs() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-foreground mb-6">About SkillSphere</h1>
      <div className="bg-card rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-4">Our Mission</h2>
        <p className="text-muted-foreground mb-6">
          SkillSphere is a platform dedicated to bringing passionate individuals together.
          Whether you are an expert looking to share your knowledge or a beginner eager to learn, this is the place for you.
          We believe that everyone has something valuable to teach and something new to learn.
        </p>

        <h2 className="text-2xl font-semibold text-foreground mb-4">What We Do</h2>
        <p className="text-muted-foreground mb-6">
          Our platform allows users to share resources, including tutorials, articles, tools, and videos. 
          By categorising these resources into specific hobbies and skills—like Coding, Art, Music, and Cooking—we 
          make it easy for you to find exactly what you're looking for.
        </p>

        <h2 className="text-2xl font-semibold text-foreground mb-4">Features</h2>
        <ul className="list-disc list-inside text-muted-foreground mb-6 space-y-2">
          <li>Create a personalized profile to showcase your skills and interests.</li>
          <li>Share and discover high-quality resources in various categories.</li>
          <li>Connect with like-minded learners through our real-time messaging system.</li>
          <li>Rate and review users to help the community find the best content.</li>
                </ul>

        <div className="mt-8 text-center">
          <Link to="/register" className="inline-block bg-blue-600 text-white font-semibold py-3 px-6 rounded hover:bg-blue-700 transition">
            Join Our Community Today
          </Link>
        </div>
      </div>
    </div>
  );
}
