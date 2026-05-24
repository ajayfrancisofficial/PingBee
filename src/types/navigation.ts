import type { StaticParamList } from '@react-navigation/native';
import { AppStack } from '../navigation/AppStack';
import { AuthStack } from '../navigation/AuthStack';
import { BottomTabNavigator } from '../navigation/BottomTabNavigator';
import { YouStack } from '../navigation/YouStack';

export type AppStackParamList = StaticParamList<typeof AppStack>;
export type AuthStackParamList = StaticParamList<typeof AuthStack>;
export type BottomTabParamList = StaticParamList<typeof BottomTabNavigator>;
export type YouStackParamList = StaticParamList<typeof YouStack>;

export type RootStackParamList = AppStackParamList &
  AuthStackParamList &
  BottomTabParamList &
  YouStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
