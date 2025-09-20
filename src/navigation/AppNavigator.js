import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { USER_ROLES } from '../constants/roles';
import { colors as baseColors } from '../constants/colors';
import { useThemeMode } from '../context/ThemeContext';
import Icon from '../components/Icon';

// Auth Screens
import LoginScreen from '../screens/Auth/LoginScreen';
import SignUpScreen from '../screens/Auth/SignUpScreen';

// Student Screens
import StudentDashboard from '../screens/Student/StudentDashboard';
import ResumeBuilder from '../screens/Student/ResumeBuilder';
import TestList from '../screens/Student/TestList';
import TestGenerator from '../screens/Student/TestGenerator';
import TestScreen from '../screens/Student/TestScreen';
import TestResults from '../screens/Student/TestResults';
import DetailedAnalysis from '../screens/Student/DetailedAnalysis';
import CareerRoadmap from '../screens/Student/CareerRoadmap';
import Analytics from '../screens/Student/Analytics';

// Mentor Screens
import MentorDashboard from '../screens/Mentor/MentorDashboard';
import ResumeReview from '../screens/Mentor/ResumeReview';

// Admin Screens
import AdminDashboard from '../screens/Admin/AdminDashboard';
import UserManagement from '../screens/Admin/UserManagement';
import TestManagement from '../screens/Admin/TestManagement';
import TestAnalytics from '../screens/Admin/TestAnalytics';

// Loading Screen
import LoadingScreen from '../screens/LoadingScreen';

// Settings Screen
import Settings from '../screens/Settings';

// Profile Screen
import Profile from '../screens/Profile';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const StudentTabs = () => {
  const { userProfile } = useAuth();
  const { colors } = useThemeMode();
  
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          elevation: 8,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 4,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <Icon 
            name="account-circle" 
            size={28} 
            color={colors.white}
            style={{ marginRight: 15 }}
            onPress={() => navigation.navigate('Profile')}
          />
        ),
      })}
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
    <Tab.Screen
      name="Settings"
      component={Settings}
      options={{
        title: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <Icon name="cog" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
  );
};

const MentorTabs = () => {
  const { userProfile } = useAuth();
  const { colors } = useThemeMode();
  
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          elevation: 8,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 4,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <Icon 
            name="account-circle" 
            size={28} 
            color={colors.white}
            style={{ marginRight: 15 }}
            onPress={() => navigation.navigate('Profile')}
          />
        ),
      })}
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
    <Tab.Screen
      name="Settings"
      component={Settings}
      options={{
        title: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <Icon name="cog" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
  );
};

const AdminTabs = () => {
  const { userProfile } = useAuth();
  const { colors } = useThemeMode();
  
  return (
    <Tab.Navigator
      screenOptions={({ navigation }) => ({
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          elevation: 8,
        },
        headerShown: true,
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 4,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerRight: () => (
          <Icon 
            name="account-circle" 
            size={28} 
            color={colors.white}
            style={{ marginRight: 15 }}
            onPress={() => navigation.navigate('Profile')}
          />
        ),
      })}
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
    <Tab.Screen
      name="Settings"
      component={Settings}
      options={{
        title: 'Settings',
        tabBarIcon: ({ color, size }) => (
          <Icon name="cog" size={size} color={color} />
        ),
      }}
    />
  </Tab.Navigator>
  );
};

const AppNavigator = () => {
  const { user, userProfile, loading } = useAuth();
  const { navigationTheme, colors } = useThemeMode();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false 
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={({ navigation }) => ({
                headerShown: true,
                title: 'FutureSelf',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                headerRight: () => (
                  <Icon 
                    name="account-circle" 
                    size={28} 
                    color={colors.white}
                    style={{ marginRight: 15 }}
                    onPress={() => navigation.navigate('Profile')}
                  />
                ),
              })}
            />
            <Stack.Screen 
              name="SignUp" 
              component={SignUpScreen}
              options={({ navigation }) => ({
                headerShown: true,
                title: 'Join FutureSelf',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
                headerRight: () => (
                  <Icon 
                    name="account-circle" 
                    size={28} 
                    color={colors.white}
                    style={{ marginRight: 15 }}
                    onPress={() => navigation.navigate('Profile')}
                  />
                ),
              })}
            />
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
            <Stack.Screen 
              name="Profile" 
              component={Profile}
              options={{
                headerShown: true,
                title: 'Profile',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            
            {/* Test Screens */}
            <Stack.Screen 
              name="TestGenerator" 
              component={TestGenerator}
              options={{
                headerShown: true,
                title: 'AI Test Generator',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen 
              name="TestScreen" 
              component={TestScreen}
              options={{
                headerShown: true,
                title: 'Taking Test',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen 
              name="TestResults" 
              component={TestResults}
              options={{
                headerShown: true,
                title: 'Test Results',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            <Stack.Screen 
              name="DetailedAnalysis" 
              component={DetailedAnalysis}
              options={{
                headerShown: true,
                title: 'Detailed Analysis',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
            
            {/* Admin Screens */}
            <Stack.Screen 
              name="TestAnalytics" 
              component={TestAnalytics}
              options={{
                headerShown: true,
                title: 'Test Analytics',
                headerStyle: {
                  backgroundColor: colors.primary,
                },
                headerTintColor: colors.white,
                headerTitleStyle: {
                  fontWeight: 'bold',
                },
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
