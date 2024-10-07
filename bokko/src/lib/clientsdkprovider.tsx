"use client";

import { SDKProvider } from "@telegram-apps/sdk-react";

export const ClientSdkProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <SDKProvider acceptCustomStyles debug>
      {children}
    </SDKProvider>
  );
};
