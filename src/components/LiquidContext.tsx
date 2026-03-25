import { createContext, useContext } from 'react';

export interface LiquidContextType {
    isInsideGlass: boolean;
}

export const LiquidContext = createContext<LiquidContextType>({
    isInsideGlass: false,
});

export const useLiquidContext = () => useContext(LiquidContext);
