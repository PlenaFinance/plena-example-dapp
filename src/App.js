import React, { useEffect, useState } from 'react';
import './App.css';
import { Button } from 'antd';
import SendTxnModal from './modals/SendTxnModal';
import { ethers, providers } from 'ethers';
import Header from './components/Header';
import axios from 'axios';
import { usePlenaWallet } from 'plena-wallet-sdk';
import { convertUtf8ToHex } from '@plenaconnect/utils';
import { eip1271 } from './helpers/eip1271';
import { hashMessage } from './helpers/utiliities';
import SignMessageModal from './modals/SignMessageModal';

function App() {
  const [pending, setPending] = useState(false);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [isTxnModalOpen, setIsTxnModalOpen] = useState(false);
  const [address, setAddress] = useState(null);
  const [result, setResult] = useState(null);
  const [connector, setConnector] = useState(null);
  const { openModal, closeConnection, sendTransaction, walletAddress } =
    usePlenaWallet();

  const disconnect = async () => {
    closeConnection();
  };

  const openTxnModal = () => {
    setIsTxnModalOpen(true);
  };

  const openSignModal = () => {
    setIsSignModalOpen(true);
  };

  const closeTxnModal = () => {
    setIsTxnModalOpen(false);
    setPending(false);
    setResult(false);
  };

  const closeSignModal = () => {
    setIsSignModalOpen(false);
    setPending(false);
    setResult(false);
  };

  const cancelTransaction = () => {};

  const testSendTransaction = async () => {
    openTxnModal();
    setPending(true);

    const lendingPool = '0x8dFf5E27EA6b7AC08EbFdf9eB090F32ee9a30fcf';
    const USDC = '0xc2132D05D31c914a87C6611C10748AEb04B58e8F';
    const abi1 = [
      {
        inputs: [
          {
            internalType: 'address',
            name: 'spender',
            type: 'address',
          },
          {
            internalType: 'uint256',
            name: 'amount',
            type: 'uint256',
          },
        ],
        name: 'transfer',
        outputs: [
          {
            internalType: 'bool',
            name: '',
            type: 'bool',
          },
        ],
        stateMutability: 'nonpayable',
        type: 'function',
      },
    ];
    const contract = new ethers.utils.Interface(abi1);

    const txnData1 = contract.encodeFunctionData('transfer', [
      lendingPool,
      '1',
    ]);
    // Draft transaction
    const tx: IPlenaTxData = {
      from: walletAddress,
      data: [txnData1],
      to: [USDC],
      tokens: ['', ''],
      amounts: ['0x0', '0x0'],
    };
    try {
      const res = await sendTransaction({
        chain: 137,
        method: 'send_transaction', // personal_sign
        payload: {
          transaction: tx,
          // todo: payload of transaction
        },
      });
      if (!res?.success) {
        setResult(false);
        return;
      }
      const formattedResult = {
        method: 'send_transaction',
        txHash: res?.content?.transactionHash,
        from: walletAddress,
      };
      setResult(formattedResult);
    } catch (error) {
      setResult(null);
    } finally {
      setPending(false);
    }
  };

  const testSignTransaction = async () => {
    openSignModal();
    setPending(true);
    try {
      const message = `My email is john@doe.com - ${new Date().toUTCString()}`;

      // encode message (hex)
      const hexMsg = convertUtf8ToHex(message);

      // eth_sign params
      const msgParams = [hexMsg, walletAddress];
      const res = await sendTransaction({
        chain: 137,
        method: 'personal_sign',
        payload: {
          msgParams,
        },
      });
      if (!res?.success) {
        setResult(false);
        return;
      }
      const hash = hashMessage(message);
      const polygonProvider = new ethers.providers.JsonRpcProvider(
        'https://polygon-rpc.com/'
      );
      const valid = await eip1271.isValidSignature(
        walletAddress,
        res?.content?.signature,
        hash,
        polygonProvider
      );
      const formattedResult = {
        method: 'personal_sign',
        signature: res?.content?.signature,
        from: walletAddress,
      };
      setResult(formattedResult);
    } catch (error) {
      setResult(null);
    } finally {
      setPending(false);
    }
  };
  return (
    <>
      {!walletAddress ? (
        <div className='flex flex-col items-center justify-center h-full'>
          <h1 className='mb-8 text-2xl font-bold'>Welcome to Plena Connect</h1>
          <Button
            type='primary'
            onClick={openModal}
            className='text-sm font-bold'>
            Connect
          </Button>
        </div>
      ) : (
        <div className=' h-full'>
          <Header disconnect={disconnect} walletAddress={walletAddress} />
          <div className='flex flex-col items-center justify-center'>
            <h1 className='mb-8 text-2xl font-bold mt-20'>Methods</h1>
            <div className='flex flex-col'>
              <Button
                type='primary'
                onClick={testSignTransaction}
                className='text-sm font-bold mx-2'>
                Personal Sign
              </Button>
              <Button
                type='primary'
                onClick={testSendTransaction}
                cancelTransaction={cancelTransaction}
                className='text-sm font-bold mx-2  mt-5'>
                SendTransaction
              </Button>
            </div>
          </div>
        </div>
      )}
      <SendTxnModal
        isModalOpen={isTxnModalOpen}
        onCancel={closeTxnModal}
        pendingRequest={pending}
        result={result}
      />
      <SignMessageModal
        isModalOpen={isSignModalOpen}
        onCancel={closeSignModal}
        pendingRequest={pending}
        result={result}
      />
    </>
  );
}

export default App;
