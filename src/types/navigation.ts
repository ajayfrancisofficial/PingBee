import type { NavigatorScreenParams } from '@react-navigation/native';

export type BottomTabParamList = {
  Chats: undefined;
  Status: undefined;
  Calls: undefined;
};

export type AppStackParamList = {
  BottomTabs: NavigatorScreenParams<BottomTabParamList>;
  Chat: { name: string; chatId?: string };
};

export type RootStackParamList = AppStackParamList & BottomTabParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
