import { Injectable } from '@nestjs/common';
import { ethers } from 'ethers';

@Injectable()
export class PumpService {
  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private ammFactory: ethers.Contract;

  constructor() {
    // Initialize provider, signer, and contract
    this.provider = new ethers.JsonRpcProvider('YOUR_RPC_URL'); // Replace with your Ethereum node RPC URL
    // Note: In a production environment, you should use a secure way to manage private keys
    this.signer = new ethers.Wallet('YOUR_PRIVATE_KEY', this.provider);
    
    const ammFactoryAddress = '0x5B840BD7Cb0e8Ae602654F9dFE585e3E807332c4';
    const ammFactoryAbi = [
      "function createAMM(address tokenAddress, string memory name, string memory symbol, uint256 supplyAmount) public returns (address)"
    ];
    this.ammFactory = new ethers.Contract(ammFactoryAddress, ammFactoryAbi, this.signer);
  }

  async deployAMM(tokenName: string, tokenSymbol: string ,tokenAddress: string, supplyAmount: string) {
    try {
      const tx = await this.ammFactory.createAMM(
        tokenAddress,
        tokenName,
        tokenSymbol, // symbol (not used in the contract, but required in the function signature)
        ethers.parseUnits(supplyAmount, 18) // Assuming 18 decimals, adjust if different
      );

      const receipt = await tx.wait();
      
      // Find the AMMCreated event in the transaction receipt
      const event = receipt.logs.find((log: ethers.Log) => {
        const parsedLog = this.ammFactory.interface.parseLog({
          topics: log.topics as string[],
          data: log.data
        });
        return parsedLog?.name === 'AMMCreated';
      });

      if (event) {
        const parsedEvent = this.ammFactory.interface.parseLog({
          topics: event.topics as string[],
          data: event.data
        });
        
        if (parsedEvent && parsedEvent.args) {
          const [newAmmAddress, name, symbol, supply, owner] = parsedEvent.args;
          return {
            ammAddress: newAmmAddress,
            tokenName: name,
            tokenSymbol: symbol,
            supplyAmount: ethers.formatUnits(supply, 18), // Convert back to string
            owner: owner
          };
        } else {
          throw new Error('Failed to parse AMMCreated event');
        }
      } else {
        throw new Error('AMMCreated event not found in transaction receipt');
      }
    } catch (error) {
      console.error('Error deploying AMM:', error);
      throw error;
    }
  }
}
