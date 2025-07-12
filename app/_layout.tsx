import { Slot } from 'expo-router';
import { AuthProvider, useAuth } from '../contexts/AuthContext';

function RootLayoutNav() {
  const { isLoggedIn } = useAuth();

  if (!isLoggedIn) {
    return <Slot name="(auth)" />;
  }

  return <Slot name="(tabs)" />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}
