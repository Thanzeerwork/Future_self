import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../constants/roles';
import { colors } from '../constants/colors';
import Icon from '../components/Icon';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';

// Student Screens
import StudentDashboard from '../screens/Student/StudentDashboard';
import ResumeBuilder from '../screens/Student/ResumeBuilder';
import TestList from '../screens/Student/TestList';
import CareerRoadmap from '../screens/Student/CareerRoadmap';
import Analytics from '../screens/Student/Analytics';

// Mentor Screens
import MentorDashboard from '../screens/Mentor/MentorDashboard';
import ResumeReview from '../screens/Mentor/ResumeReview';

// Admin Screens
import AdminDashboard from '../screens/Admin/AdminDashboard';
import UserManagement from '../screens/Admin/UserManagement';
import TestManagement from '../screens/Admin/TestManagement';

// Loading Screen
import LoadingScreen from '../screens/LoadingScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const StudentTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.white,
        elevation: 8,
      },
    }}
  >
    <Tab.Screen
      name="Dashboard"
      component={StudentDashboard}
      options={{
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="ResumeBuilder"
      component={ResumeBuilder}
      options={{
        title: 'Resume',
        tabBarIcon: ({ color, size }) => (
          <Icon name="file-document" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="TestList"
      component={TestList}
      options={{
        title: 'Tests',
        tabBarIcon: ({ color, size }) => (
          <Icon name="school" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="CareerRoadmap"
      component={CareerRoadmap}
      options={{
        title: 'Roadmap',
        tabBarIcon: ({ color, size }) => (
          <Icon name="map" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="Analytics"
      component={Analytics}
      options={{
        title: 'Analytics',
        tabBarIcon: ({ color, size }) => (
          <Icon name="chart-line" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const MentorTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.white,
        elevation: 8,
      },
    }}
  >
    <Tab.Screen
      name="MentorDashboard"
      component={MentorDashboard}
      options={{
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="ResumeReview"
      component={ResumeReview}
      options={{
        title: 'Review',
        tabBarIcon: ({ color, size }) => (
          <Icon name="file-document-edit" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const AdminTabs = () => (
  <Tab.Navigator
    screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.textSecondary,
      tabBarStyle: {
        backgroundColor: colors.white,
        elevation: 8,
      },
    }}
  >
    <Tab.Screen
      name="AdminDashboard"
      component={AdminDashboard}
      options={{
        title: 'Dashboard',
        tabBarIcon: ({ color, size }) => (
          <Icon name="home" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="UserManagement"
      component={UserManagement}
      options={{
        title: 'Users',
        tabBarIcon: ({ color, size }) => (
          <Icon name="account-group" size={size} color={color} />
        ),
      }}
    />
    <Tab.Screen
      name="TestManagement"
      component={TestManagement}
      options={{
        title: 'Tests',
        tabBarIcon: ({ color, size }) => (
          <Icon name="school" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
);

const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        ) : (
          // Main App based on user role
          <>
            {userProfile?.role === USER_ROLES.STUDENT && (
              <Stack.Screen name="StudentApp" component={StudentTabs} />
            )}
            {userProfile?.role === USER_ROLES.MENTOR && (
              <Stack.Screen name="MentorApp" component={MentorTabs} />
            )}
            {userProfile?.role === USER_ROLES.ADMIN && (
              <Stack.Screen name="AdminApp" component={AdminTabs} />
            )}
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
