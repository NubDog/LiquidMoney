// AddWalletButton.tsx — Liquid Glass styled floating action button

import React from 'react';
import { ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import LiquidButton from './LiquidButton';

interface AddWalletButtonProps {
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
}

const AddWalletButton: React.FC<AddWalletButtonProps> = ({ onPress, style, disabled }) => {
  return (
    <LiquidButton
      onPress={onPress}
      disabled={disabled}
      variant="filled"
      style={[
        {
          width: 58,
          height: 58,
          borderRadius: 29,
          paddingVertical: 0,
          paddingHorizontal: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.15)', // Ensures visibility via tint if BlurView overlap drops
        },
        style,
      ]}
    >
      <Plus size={28} color="#FFFFFF" strokeWidth={2.5} />
    </LiquidButton>
  );
};

export default AddWalletButton;
