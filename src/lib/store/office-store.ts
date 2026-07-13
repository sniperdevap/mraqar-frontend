import { create } from 'zustand';
import { Office } from '@/lib/api/office';

interface OfficeStore {
  offices: Record<string, Office>;
  setOffices: (officesToSet: Office[]) => void;
  setOffice: (office: Office) => void;
  getOffice: (id: string) => Office | undefined;
}

export const useOfficeStore = create<OfficeStore>((set, get) => ({
  offices: {},
  setOffices: officesToSet => {
    set(state => {
      const newOffices = { ...state.offices };
      officesToSet.forEach(office => {
        newOffices[office._id] = { ...newOffices[office._id], ...office };
      });
      return { offices: newOffices };
    });
  },
  setOffice: office => {
    set(state => ({
      offices: {
        ...state.offices,
        [office._id]: { ...(state.offices[office._id] || {}), ...office },
      },
    }));
  },
  getOffice: id => get().offices[id],
}));
