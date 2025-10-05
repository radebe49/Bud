import { Tabs, useRouter, usePathname } from 'expo-router';
import React from 'react';
import { Platform, View } from 'react-native';

import { HapticTab } from '../../components/HapticTab';
import { IconSymbol } from '../../components/ui/IconSymbol';
import TabBarBackground from '../../components/ui/TabBarBackground';
import { FloatingActionButton } from '../../src/shared/components/FloatingActionButton';


export default function TabLayout() {
  const router = useRouter();
  const pathname = usePathname();

  const handleFloatingButtonPress = () => {
    router.push('/(tabs)/askbud');
  };

  // Hide floating button when on AskBud screen
  const isOnAskBudScreen = pathname === '/askbud' || pathname === '/(tabs)/askbud';

  return (
    <View style={{ flex: 1, position: 'relative' }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#000000', // Black font for active state
          tabBarInactiveTintColor: '#6B7280', // Gray for inactive state
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarBackground: TabBarBackground,
          tabBarStyle: Platform.select({
            ios: {
              position: 'absolute',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderTopColor: 'rgba(0, 0, 0, 0.05)',
              borderTopWidth: 0.5,
              height: 88,
              paddingBottom: 34,
              paddingTop: 8,
            },
            default: {
              backgroundColor: '#FFFFFF',
              borderTopColor: '#E5E7EB',
              borderTopWidth: 0.5,
              height: 70,
              paddingBottom: 8,
              paddingTop: 8,
            },
          }),
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 4,
            // Add glow effect for active state
            textShadowColor: 'rgba(0, 0, 0, 0.1)',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: 2,
          },
          tabBarIconStyle: {
            marginBottom: 2,
            // Add glow effect for active state
            shadowColor: '#000000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
        }}>
        
        {/* Home Tab - Renamed from "Today" to "Home" */}
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => (
              <IconSymbol 
                size={26} 
                name="house.fill" 
                color={color} 
              />
            ),
          }}
        />
        
        {/* Cardio Tab */}
        <Tabs.Screen
          name="cardio"
          options={{
            title: 'Cardio',
            tabBarIcon: ({ color }) => (
              <IconSymbol 
                size={26} 
                name="heart.fill" 
                color={color} 
              />
            ),
          }}
        />
        
        {/* Health Tab - Renamed from "You" to "Health" */}
        <Tabs.Screen
          name="health"
          options={{
            title: 'Health',
            tabBarIcon: ({ color }) => (
              <IconSymbol 
                size={26} 
                name="chart.bar.fill" 
                color={color} 
              />
            ),
          }}
        />
        
        {/* Nutrition Tab */}
        <Tabs.Screen
          name="nutrition"
          options={{
            title: 'Nutrition',
            tabBarIcon: ({ color }) => (
              <IconSymbol 
                size={26} 
                name="fork.knife" 
                color={color} 
              />
            ),
          }}
        />
        
        {/* Hide AskBud from tab bar - will be accessed via floating button */}
        <Tabs.Screen
          name="askbud"
          options={{
            href: null, // This hides the tab from the tab bar
          }}
        />
      </Tabs>
      
      {/* Floating Action Button for AskBud Chat - Hidden when on AskBud screen */}
      {!isOnAskBudScreen && (
        <View style={{
          position: 'absolute',
          bottom: Platform.select({
            ios: 88 + 20, // Tab bar height + margin
            android: 70 + 20, // Tab bar height + margin
          }),
          right: 20,
          zIndex: 1000,
        }}>
          <FloatingActionButton
            onPress={handleFloatingButtonPress}
            icon="person.crop.circle.badge.checkmark"
            size={22}
          />
        </View>
      )}
    </View>
  );
}
