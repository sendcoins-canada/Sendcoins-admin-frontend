import { delay } from '../lib/api';
import { Transaction } from '../store/slices/transactionSlice';

export const transactionService = {
  getTransactions: async (): Promise<Transaction[]> => {
    await delay(800);
    return [
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
    ];
  }
};
