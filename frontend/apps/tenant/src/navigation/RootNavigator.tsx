import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { DashboardScreen } from '../screens/Dashboard/DashboardScreen';
import { RevenueScreen } from '../screens/Revenue/RevenueScreen';
import { SettingsScreen } from '../screens/Settings/SettingsScreen';
import { useTenantStore } from '../store/tenantStore';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function DashboardTabs() {
  const { isLoading } = useTenantStore();

  useEffect(() => {
    // Load data on mount
    const loadData = async () => {
      const store = useTenantStore.getState();
      store.setLoading(true);
      // Load data here
      store.setLoading(false);
    };
    loadData();
  }, []);

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFF',
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        },
        headerTitleStyle: {
          color: '#1F2937',
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>📊</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Revenue"
        component={RevenueScreen}
        options={{
          title: 'Laporan Pendapatan',
          tabBarLabel: 'Pendapatan',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>💰</Text>
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Pengaturan',
          tabBarLabel: 'Pengaturan',
          tabBarIcon: ({ color, size }) => (
            <Text style={{ fontSize: size, color }}>⚙️</Text>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="DashboardTabs" component={DashboardTabs} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
