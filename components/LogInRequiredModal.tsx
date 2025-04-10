import React from 'react';
import { View } from 'react-native';
import { Dialog, Portal, Paragraph, Button } from 'react-native-paper';

interface LoginRequiredModalProps {
  visible: boolean;
  onDismiss: () => void;
}

const LoginRequiredModal: React.FC<LoginRequiredModalProps> = ({ visible, onDismiss }) => {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss}>
        <Dialog.Title>Login Required</Dialog.Title>
        <Dialog.Content>
          <Paragraph>Please sign in to add items to your cart.</Paragraph>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={onDismiss}>OK</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default LoginRequiredModal;
