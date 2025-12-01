import { createSlice } from '@reduxjs/toolkit';

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
}

const initialState: TransactionState = {
  items: [
    {
      id: '1',
      txId: '902A3',
      date: 'Nov 2, 2025, 9:30pm',
      type: 'Outgoing',
      currency: 'BNB',
      amount: 'N20,000',
      amountUsd: '-$10',
      status: 'Completed',
      source: { address: '0X23423', network: 'ERC 20' },
      destination: { name: 'Dwight Schrute', account: '***9021 • First fabnk' },
      fee: '2,000'
    },
    {
      id: '2',
      txId: '902A3',
      date: 'Nov 2, 2025, 9:30pm',
      type: 'Incoming',
      currency: 'NGN',
      amount: 'N20,000',
      amountUsd: '-$10',
      status: 'Pending',
      source: { address: '0X23423', network: 'ERC 20' },
      destination: { name: 'Dwight Schrute', account: '***9021 • First fabnk' },
      fee: '2,000'
    },
    {
      id: '3',
      txId: '902A3',
      date: 'Nov 2, 2025, 9:30pm',
      type: 'Conversion',
      currency: 'CAD',
      amount: 'N20,000',
      amountUsd: '-$10',
      status: 'Completed',
      source: { address: '0X23423', network: 'ERC 20' },
      destination: { name: 'Dwight Schrute', account: '***9021 • First fabnk' },
      fee: '2,000'
    },
    {
      id: '4',
      txId: '902A3',
      date: 'Nov 2, 2025, 9:30pm',
      type: 'Outgoing',
      currency: 'BNB',
      amount: 'N20,000',
      amountUsd: '-$10',
      status: 'Completed',
      source: { address: '0X23423', network: 'ERC 20' },
      destination: { name: 'Dwight Schrute', account: '***9021 • First fabnk' },
      fee: '2,000'
    },
    {
      id: '5',
      txId: '902A3',
      date: 'Nov 2, 2025, 9:30pm',
      type: 'Outgoing',
      currency: 'NGN',
      amount: 'N20,000',
      amountUsd: '-$10',
      status: 'Completed',
      source: { address: '0X23423', network: 'ERC 20' },
      destination: { name: 'Dwight Schrute', account: '***9021 • First fabnk' },
      fee: '2,000'
    },
    {
      id: '6',
      txId: '902A3',
      date: 'Nov 2, 2025, 9:30pm',
      type: 'Outgoing',
      currency: 'CAD',
      amount: 'N20,000',
      amountUsd: '-$10',
      status: 'Completed',
      source: { address: '0X23423', network: 'ERC 20' },
      destination: { name: 'Dwight Schrute', account: '***9021 • First fabnk' },
      fee: '2,000'
    },
  ],
};

export const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {},
});

export default transactionSlice.reducer;
