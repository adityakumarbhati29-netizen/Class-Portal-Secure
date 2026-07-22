import React from 'react';
import { Platform, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native';
import { useColors } from '@/hooks/useColors';
import { Feather, Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs, useRouter } from 'expo-router';
import { Icon, Label, NativeTabs } from 'expo-router/unstable-native-tabs';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function SettingsButton() {
  const router = useRouter();
  return (
    <TouchableOpacity
      onPress={() => router.push('/settings')}
      style={{ marginRight: 16 }}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <Ionicons name="settings-outline" size={22} color="#FFFFFF" />
    </TouchableOpacity>
  );
}

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: 'person.3', selected: 'person.3.fill' }} />
        <Label>Roll</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="class-test">
        <Icon sf={{ default: 'doc.text', selected: 'doc.text.fill' }} />
        <Label>Tests</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="subjects">
        <Icon sf={{ default: 'books.vertical', selected: 'books.vertical.fill' }} />
        <Label>Subjects</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="soft-board">
        <Icon sf={{ default: 'pin', selected: 'pin.fill' }} />
        <Label>Board</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="notice">
        <Icon sf={{ default: 'bell', selected: 'bell.fill' }} />
        <Label>Notice</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isIOS = Platform.OS === 'ios';
  const isWeb = Platform.OS === 'web';
  const insets = useSafeAreaInsets();

  const headerStyle = {
    backgroundColor: '#5C6BC0',
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerStyle,
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontFamily: 'Inter_600SemiBold',
          fontSize: 17,
          color: '#FFFFFF',
        },
        headerRight: () => <SettingsButton />,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : colors.background,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
          ) : isWeb ? (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: colors.background },
              ]}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Nominal Roll',
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? 'person.3.fill' : 'person.3'} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? 'people' : 'people-outline'} size={22} color={color} />
            ),
          tabBarLabel: 'Roll',
        }}
      />
      <Tabs.Screen
        name="class-test"
        options={{
          title: 'Class Test Records',
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? 'doc.text.fill' : 'doc.text'} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? 'document-text' : 'document-text-outline'} size={22} color={color} />
            ),
          tabBarLabel: 'Tests',
        }}
      />
      <Tabs.Screen
        name="subjects"
        options={{
          title: 'Subjects & Syllabus',
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? 'books.vertical.fill' : 'books.vertical'} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? 'book' : 'book-outline'} size={22} color={color} />
            ),
          tabBarLabel: 'Subjects',
        }}
      />
      <Tabs.Screen
        name="soft-board"
        options={{
          title: 'Soft Board',
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? 'pin.fill' : 'pin'} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? 'pin' : 'pin-outline'} size={22} color={color} />
            ),
          tabBarLabel: 'Board',
        }}
      />
      <Tabs.Screen
        name="notice"
        options={{
          title: 'Notice Board',
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? 'bell.fill' : 'bell'} tintColor={color} size={22} />
            ) : (
              <Ionicons name={focused ? 'notifications' : 'notifications-outline'} size={22} color={color} />
            ),
          tabBarLabel: 'Notice',
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
