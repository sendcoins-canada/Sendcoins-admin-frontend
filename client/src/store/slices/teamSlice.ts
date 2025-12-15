import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { teamService } from '../../services/teamService';

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
  isLoading: boolean;
  error: string | null;
}

const initialState: TeamState = {
  members: [],
  isLoading: false,
  error: null,
};

export const fetchTeamMembers = createAsyncThunk(
  'team/fetchMembers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await teamService.getTeamMembers();
      return data;
    } catch (error) {
      return rejectWithValue('Failed to fetch team members');
    }
  }
);

export const teamSlice = createSlice({
  name: 'team',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTeamMembers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTeamMembers.fulfilled, (state, action: PayloadAction<TeamMember[]>) => {
        state.isLoading = false;
        state.members = action.payload;
      })
      .addCase(fetchTeamMembers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default teamSlice.reducer;
