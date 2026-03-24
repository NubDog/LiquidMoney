// AddWalletButton.tsx — Liquid Glass styled button for adding wallet / transaction

import React from 'react';
import { ViewStyle } from 'react-native';
import { Plus } from 'lucide-react-native';
import LiquidButton from './LiquidButton';

interface AddWalletButtonProps {
  onPress: () => void;
  style?: ViewStyle;
}

const AddWalletButton: React.FC<AddWalletButtonProps> = ({ onPress, style }) => {
  return (
    <LiquidButton
      onPress={onPress}
      variant="filled"
      style={[
        {
          width: 58,
          height: 58,
          borderRadius: 29,
          overflow: 'hidden',
          // Ensure the button sits above other content
          zIndex: 9999,
        },
        style,
      ]}
    >
      <Plus size={26} color="#FFFFFF" strokeWidth={3} />
    </LiquidButton>
  );
};

export default AddWalletButton;
