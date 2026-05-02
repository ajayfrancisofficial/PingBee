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

export interface SnackbarItem {
  id: string;
  message: string;
  type: SnackbarType;
  duration: number;
  action?: SnackbarAction;
  isSwipeDismissable: boolean;
}

interface SnackbarShowParams {
  message: string;
  type?: SnackbarType;
  duration?: SnackbarDuration;
  action?: SnackbarAction;
  isSwipeDismissable?: boolean;
}

interface SnackbarState {
  queue: SnackbarItem[];
  show: (params: SnackbarShowParams) => void;
  dismiss: (id: string) => void;
}

export const useSnackbarStore = create<SnackbarState>((set) => ({
  queue: [],
  show: ({
    message,
    type = 'info',
    duration = 'short',
    action,
    isSwipeDismissable = true,
  }) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
    const newItem: SnackbarItem = {
      id,
      message,
      type,
      duration: DURATION_MAP[duration],
      action,
      isSwipeDismissable,
    };
    set((state) => ({ queue: [...state.queue, newItem] }));
  },
  dismiss: (id) =>
    set((state) => ({
      queue: state.queue.filter((item) => item.id !== id),
    })),
}));

/**
 * Utility object to control the snackbar from anywhere (outside React components).
 */
export const snackbar = {
  show: (params: SnackbarShowParams) => {
    useSnackbarStore.getState().show(params);
  },
  dismiss: (id: string) => {
    useSnackbarStore.getState().dismiss(id);
  },
};
