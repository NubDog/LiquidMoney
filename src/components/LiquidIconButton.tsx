import React from 'react';
import { ViewStyle, StyleProp } from 'react-native';
import LiquidButton2 from './LiquidButton2';

interface LiquidIconButtonProps {
    onPress: () => void;
    children: React.ReactNode;
    style?: StyleProp<ViewStyle>;
    size?: number;
    disabled?: boolean;
}

const LiquidIconButton: React.FC<LiquidIconButtonProps> = ({ 
    onPress, 
    children, 
    style, 
    size = 40,
    disabled = false
}) => {
    return (
        <LiquidButton2 
            title=""
            icon={children}
            onPress={onPress} 
            disabled={disabled}
            style={[
                { 
                    width: size, 
                    height: size, 
                    paddingVertical: 0, 
                    paddingHorizontal: 0, 
                    borderRadius: size / 2 
                }, 
                style
            ]}
        />
    );
};

export default LiquidIconButton;
