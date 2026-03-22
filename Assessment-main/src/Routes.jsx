import { Routes, Route } from "react-router-dom";
import ReactPage from "./React"; 
import MusicPage from "./Music"; 
import ArtPage from "./Art"; 
import CodingPage from "./Coding"; 
import CookingPage from "./Cooking"; 
import DesignPage from "./Design"; 
import JavascriptPage from "./Javascript"; 
import PhotographyPage from "./Photography"; 
import WritingPage from "./Writing";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/react" element={<ReactPage />} />
      <Route path="/music" element={<MusicPage />} />
      <Route path="/art" element={<ArtPage />} />
      <Route path="/coding" element={<CodingPage />} />
      <Route path="/cooking" element={<CookingPage />} />
      <Route path="/design" element={<DesignPage />} />
      <Route path="/javascript" element={<JavascriptPage />} />
      <Route path="/photography" element={<PhotographyPage />} />
      <Route path="/writing" element={<WritingPage />} />
    </Routes>
  );
}
