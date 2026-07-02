import { Suspense, useEffect } from "react";
import { Provider } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Spinner } from "./components/ui";
import AppRouting from "./routes/AppRouting";
import store from "./store/store";

function App() {
  useEffect(() => {
    const root = document.documentElement;
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  return (
    <Provider store={store}>
      <Suspense fallback={<div className="flex h-screen w-screen items-center justify-center"><Spinner variant="spinner" size="lg" /></div>}>
        <ToastContainer limit={3} autoClose={1000} className="toaster" hideProgressBar={false} />
        <AppRouting />
      </Suspense>
    </Provider>
  )
}

export default App
