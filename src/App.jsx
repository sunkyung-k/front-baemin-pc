import { RouterProvider } from "react-router-dom";
import { router } from "./router/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrderStatusNotifier from "./components/order/OrderStatusNotifier";
import { ToastContainer } from "react-toastify";
import GlobalLoading from "./components/GlobalLoading";
import ModalContainer from "./components/common/ModalContainer";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1 * 60 * 1000,
      gcTime: 1 * 60 * 1000,
      refetchOnWindowFocus: true,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* SSE 구독 + Toast 알림 */}
      <OrderStatusNotifier />
      {/* error loading */}
      <GlobalLoading />
      {/* Toast 알림 컨테이너 */}
      <ToastContainer position="bottom-right" autoClose={5000} />
      {/* 모달 컨테이너 */}
      <ModalContainer />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;
