import React, { useState, useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import UserListScreen from '../screens/UserListScreen';
import ChatScreen from '../screens/ChatScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authenticatedUser) => {
      setUser(authenticatedUser);
    });
    return unsubscribe;
  }, []);

  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: '#075E54' }, headerTintColor: '#FFF', headerTitleStyle: { fontWeight: 'bold' } }}>
      {user ? (
        <>
          <Stack.Screen name="UserList" component={UserListScreen} options={{ title: 'Chat App' }} />
          <Stack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: route.params.recipient.name })} />
        </>
      ) : (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      )}
    </Stack.Navigator>
  );
}