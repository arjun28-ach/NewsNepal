import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  useToast,
  Link,
  HStack,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { authService } from '../services/auth';

export const AuthModal = ({ isOpen, onClose, type: initialType = 'login' }) => {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [type, setType] = useState(initialType);
  const toast = useToast();

  useEffect(() => {
    setType(initialType);
    setFormData({});
    setShowForgotPassword(false);
  }, [initialType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (type === 'login') {
        await authService.login({
          username: formData.email,
          password: formData.password
        });
        toast({
          title: 'Login successful!',
          status: 'success',
          duration: 2000,
        });
      } else {
        await authService.signup({
          username: formData.email,
          password: formData.password,
          name: formData.name
        });
        toast({
          title: 'Sign up successful!',
          status: 'success',
          duration: 2000,
        });
      }
      onClose();
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await authService.forgotPassword(formData.email);
      toast({
        title: 'Password reset email sent',
        description: 'Please check your email for instructions',
        status: 'success',
        duration: 5000,
      });
      setShowForgotPassword(false);
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

  const toggleType = () => {
    setType(type === 'login' ? 'signup' : 'login');
    setFormData({});
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      onCloseComplete={() => {
        setFormData({});
        setShowForgotPassword(false);
      }}
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        <ModalHeader>
          {showForgotPassword ? 'Reset Password' : type === 'login' ? 'Welcome Back' : 'Create Account'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          <form onSubmit={showForgotPassword ? handleForgotPassword : handleSubmit}>
            <VStack spacing={4}>
              {!showForgotPassword && type === 'signup' && (
                <FormControl isRequired>
                  <FormLabel>Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </FormControl>
              )}

              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={formData.email || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </FormControl>

              {!showForgotPassword && (
                <FormControl isRequired>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    name="password"
                    value={formData.password || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                  />
                </FormControl>
              )}

              <Button
                type="submit"
                colorScheme="blue"
                w="full"
                isLoading={isLoading}
              >
                {showForgotPassword
                  ? 'Send Reset Link'
                  : type === 'login'
                  ? 'Sign In'
                  : 'Sign Up'}
              </Button>

              {!showForgotPassword ? (
                <HStack justify="space-between" w="full">
                  <Link
                    color="blue.500"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot Password?
                  </Link>
                  <Link
                    color="blue.500"
                    onClick={toggleType}
                  >
                    {type === 'login'
                      ? "Don't have an account? Sign Up"
                      : 'Already have an account? Sign In'}
                  </Link>
                </HStack>
              ) : (
                <Link
                  color="blue.500"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Back to Sign In
                </Link>
              )}
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};