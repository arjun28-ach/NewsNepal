import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Avatar,
  Button,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { authService } from '../services/auth';

export const Profile = ({ isAuthenticated, user }) => {
  const toast = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [passwordData, setPasswordData] = useState({});
  const { isOpen: isChangePasswordOpen, onOpen: onChangePasswordOpen, onClose: onChangePasswordClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const cancelRef = useRef();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      await authService.changePassword(passwordData.currentPassword, passwordData.newPassword);
      toast({
        title: 'Password changed successfully',
        status: 'success',
        duration: 3000,
      });
      onChangePasswordClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setPasswordData({});
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await authService.deleteAccount();
      toast({
        title: 'Account deleted successfully',
        status: 'success',
        duration: 3000,
      });
      window.location.reload();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="center">
        <Avatar
          size="2xl"
          name={user?.name}
        />
        <Heading size="lg">{user?.name}</Heading>
        <Text>{user?.email}</Text>
        
        <Box w="full" pt={8}>
          <Heading size="md" mb={4}>Account Settings</Heading>
          <VStack spacing={4} align="stretch">
            <Button variant="outline" onClick={onChangePasswordOpen}>
              Change Password
            </Button>
            <Button variant="outline" colorScheme="red" onClick={onDeleteOpen}>
              Delete Account
            </Button>
          </VStack>
        </Box>
      </VStack>

      {/* Change Password Modal */}
      <Modal isOpen={isChangePasswordOpen} onClose={onChangePasswordClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Change Password</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleChangePassword}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Current Password</FormLabel>
                  <Input
                    type="password"
                    value={passwordData.currentPassword || ''}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>New Password</FormLabel>
                  <Input
                    type="password"
                    value={passwordData.newPassword || ''}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value
                    })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Confirm New Password</FormLabel>
                  <Input
                    type="password"
                    value={passwordData.confirmPassword || ''}
                    onChange={(e) => setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value
                    })}
                  />
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  w="full"
                  isLoading={isLoading}
                >
                  Change Password
                </Button>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Delete Account Alert Dialog */}
      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={onDeleteClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Account
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? This action cannot be undone. All your data will be permanently deleted.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button
                colorScheme="red"
                onClick={handleDeleteAccount}
                ml={3}
                isLoading={isLoading}
              >
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  );
}; 