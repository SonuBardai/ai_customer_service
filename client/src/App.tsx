import { Route, Routes } from "react-router-dom";
import NavBar from "Shared/core/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Page404 from "./pages/Page404";
import { ErrorBoundary } from "react-error-boundary";
import Error from "./pages/Error";
import { Toaster } from "react-hot-toast";
import Setup from "Pages/Setup";

const App = () => {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <NavBar />
      <Toaster/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Page404 />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
