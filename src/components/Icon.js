import React from 'react';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const Icon = ({ name, size = 24, color = '#000', ...props }) => {
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      {...props}
    />
  );
};

export default Icon;
