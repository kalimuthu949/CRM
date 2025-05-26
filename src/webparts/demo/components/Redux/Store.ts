import { configureStore } from "@reduxjs/toolkit";
import ConfigureationData from "./ConfigureationData"; // Import IState explicitly
import PageData from "./PageData";

const store = configureStore({
  reducer: {
    ConfigureationData: ConfigureationData,
    PageData: PageData,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export { store };
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
