import { create } from 'zustand';

interface StoreState {
  user: any;
  checkUser: () => void;
}

export const useStore = create<StoreState>((set) => ({
  user: null,
  checkUser: () => {
    // Şimdilik boş bir kontrol
    console.log("User checked");
  },
}));
