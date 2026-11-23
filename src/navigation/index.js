import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';

import { useAuth } from '../context/AuthContext';
import Loading from '../components/Loading';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import ProductsScreen from '../screens/ProductsScreen';
import ProductFormScreen from '../screens/ProductFormScreen';
import NewSaleScreen from '../screens/NewSaleScreen';
import SalesHistoryScreen from '../screens/SalesHistoryScreen';
import ReportsScreen from '../screens/ReportsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Início: 'home-variant-outline',
  Produtos: 'package-variant-closed',
  Vender: 'cart-plus',
  Vendas: 'receipt-text-outline',
  Relatórios: 'chart-box-outline',
};

function Tabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.outline,
        tabBarLabelStyle: { fontSize: 12 },
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTitleStyle: { fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <MaterialCommunityIcons name={TAB_ICONS[route.name]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Produtos" component={ProductsScreen} />
      <Tab.Screen name="Vender" component={NewSaleScreen} options={{ title: 'Nova venda' }} />
      <Tab.Screen name="Vendas" component={SalesHistoryScreen} options={{ title: 'Histórico' }} />
      <Tab.Screen name="Relatórios" component={ReportsScreen} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { session, loading } = useAuth();
  if (loading) return <Loading />;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {session ? (
          <>
            <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
            <Stack.Screen name="ProductForm" component={ProductFormScreen} options={{ title: 'Produto' }} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Criar conta' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
