import { create } from 'zustand';

export type SnackbarType = 'success' | 'error' | 'warning' | 'info';

export type SnackbarDuration = 'short' | 'long' | 'indefinite';

const DURATION_MAP: Record<SnackbarDuration, number> = {
  short: 3000,
  long: 5000,
  indefinite: 0,
};

interface SnackbarAction {
  label: string;
  onPress: () => void;
}

interface SnackbarShowParams {
  message: string;
  type?: SnackbarType;
  duration?: SnackbarDuration;
  action?: SnackbarAction;
  isSwipeDismissable?: boolean;
}

interface SnackbarState {
  visible: boolean;
  message: string;
  type: SnackbarType;
  duration: number; // Stored as milliseconds
  action?: SnackbarAction;
  isSwipeDismissable: boolean;
  show: (params: SnackbarShowParams) => void;
  hide: () => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  visible: false,
  message: '',
  type: 'info',
  duration: DURATION_MAP.short,
  action: undefined,
  isSwipeDismissable: true,
  show: ({
    message,
    type = 'info',
    duration = 'short',
    action,
    isSwipeDismissable = true,
  }) => {
    set({
      visible: true,
      message,
      type,
      duration: DURATION_MAP[duration],
      action,
      isSwipeDismissable,
    });
  },
  hide: () => set({ visible: false }),
}));

/**
 * Utility object to control the snackbar from anywhere (outside React components).
 */
export const snackbar = {
  show: (params: SnackbarShowParams) => {
    useSnackbarStore.getState().show(params);
  },
  hide: () => {
    useSnackbarStore.getState().hide();
  },
};
