import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionService } from '../../services/transactionService';

export interface Transaction {
  id: string;
  txId: string;
  date: string;
  type: 'Incoming' | 'Outgoing' | 'Conversion';
  currency: string;
  amount: string;
  amountUsd: string;
  status: 'Completed' | 'Pending' | 'Failed';
  source: {
    address: string;
    network: string;
  };
  destination: {
    name: string;
    account: string;
  };
  fee: string;
}

interface TransactionState {
  items: Transaction[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TransactionState = {
  items: [],
  isLoading: false,
  error: null,
};

export const fetchTransactions = createAsyncThunk(
  'transactions/fetch',
  async (_, { rejectWithValue }) => {
    try {
      const data = await transactionService.getTransactions();
      return data;
    } catch (error) {
      return rejectWithValue('Failed to fetch transactions');
    }
  }
);

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default transactionSlice.reducer;
