'use client';

import { Root } from '@/components/dev/root';

export const ClientSdkProvider = ({ children }: { children: React.ReactNode }) => {
    return <Root>{children}</Root>;
};
