import { createSlice } from '@reduxjs/toolkit';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  department: string;
  lastActive: string;
  status: 'Active' | 'Inactive';
}

interface TeamState {
  members: TeamMember[];
}

const initialState: TeamState = {
  members: [
    {
      id: '1',
      name: 'Olivia Rhye',
      email: 'olivia@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'Super admin',
      department: 'Operations',
      lastActive: '2 hrs ago',
      status: 'Active'
    },
    {
      id: '2',
      name: 'Phoenix Baker',
      email: 'phoenix@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'Super admin',
      department: 'Operations',
      lastActive: '2 hrs ago',
      status: 'Active'
    },
    {
      id: '3',
      name: 'Lana Steiner',
      email: 'lana@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'Compliance',
      department: 'Operations',
      lastActive: '2 hrs ago',
      status: 'Active'
    },
    {
      id: '4',
      name: 'Demi Wilkinson',
      email: 'demi@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
      role: 'Super admin',
      department: 'Operations',
      lastActive: '2 hrs ago',
      status: 'Active'
    },
  ],
};

export const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {},
});

export default teamSlice.reducer;
