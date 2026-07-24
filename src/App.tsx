import { HashRouter, Routes, Route } from "react-router-dom";
import { Dashboard } from "./components/Dashboard";
import { Quiz } from "./components/Quiz";
import { Results } from "./components/Results";
import { NotFound } from "./components/NotFound";

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/test/:testId" element={<Quiz />} />
        <Route path="/test/:testId/resultado" element={<Results />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
