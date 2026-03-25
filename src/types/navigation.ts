import type { NavigatorScreenParams } from '@react-navigation/native';

export type AuthStackParamList = {
  Welcome: undefined;
  Login: undefined;
  RegisterEmail: undefined;
  Verification: { phoneNumber: string };
  EmailLogin: undefined;
};

export type YouStackParamList = {
  You: { name?: string } | undefined;
  Profile: undefined;
};

export type BottomTabParamList = {
  Chats: undefined;
  Status: undefined;
  Calls: undefined;
  YouStack: NavigatorScreenParams<YouStackParamList>;
};

export type AppStackParamList = {
  BottomTabs: NavigatorScreenParams<BottomTabParamList>;
  Chat: { name: string; chatId?: string };
};

export type RootStackParamList = AppStackParamList & BottomTabParamList & YouStackParamList;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList { }
  }
}
