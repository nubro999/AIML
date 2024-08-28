import { MessageBody, SubscribeMessage, WebSocketGateway, WebSocketServer, ConnectedSocket } from "@nestjs/websockets";
import { Server, Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { ethers } from 'ethers';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class PriceFeed implements OnModuleInit {

  @WebSocketServer()
  server: Server;

  private provider: ethers.Provider;
  private signer: ethers.Signer;
  private cpammContract: ethers.Contract;

  constructor() {
    this.provider = ethers.getDefaultProvider('https://arbitrum-sepolia.infura.io/v3/035c5c117cd649d7bdbb5ee61b3cb696');
    this.signer = new ethers.Wallet('7616671493b9e6de153a2c55ce5db66dfac0ca4f4aea114153ceac461c90f416', this.provider);
    
    const cpammAddress = '0xf9586cb1D64BF67b380c59267EbB404cc8B3Bfc9';
    const cpammAbi = [
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "_token0",
                    "type": "address"
                },
                {
                    "internalType": "address",
                    "name": "_token1",
                    "type": "address"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "tokenAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "buyToken",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "tokenAddress",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "sellToken",
            "type": "event"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "sender",
                    "type": "address"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "amount",
                    "type": "uint256"
                }
            ],
            "name": "swapEvent",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_amount0",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "_amount1",
                    "type": "uint256"
                }
            ],
            "name": "addLiquidity",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "shares",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "balanceOf",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "name": "balances",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "address",
                    "name": "tokenIn",
                    "type": "address"
                },
                {
                    "internalType": "uint256",
                    "name": "amountIn",
                    "type": "uint256"
                }
            ],
            "name": "getPrice",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amountOut",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_shares",
                    "type": "uint256"
                }
            ],
            "name": "removeLiquidity",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "amount0",
                    "type": "uint256"
                },
                {
                    "internalType": "uint256",
                    "name": "amount1",
                    "type": "uint256"
                }
            ],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "reserve0",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "reserve1",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "supplyReserve",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "token0",
            "outputs": [
                {
                    "internalType": "contract IERC20",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "token1",
            "outputs": [
                {
                    "internalType": "contract IERC20",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "totalSupply",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ];

    this.cpammContract = new ethers.Contract(cpammAddress, cpammAbi, this.signer);
  }

  onModuleInit() {
    this.server.on('connection', (socket: Socket) => {
      console.log('Client connected:', socket.id);
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });
  }

  @SubscribeMessage('subscribeToPrice')
  async handleSubscribeToPrice(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { tokenAddress: string }
  ) {
    console.log(`Client ${client.id} subscribed to price updates for token: ${data.tokenAddress}`);
    
    const interval = setInterval(async () => {
      try {
        const price = await this.fetchPriceForToken(data.tokenAddress);
        client.emit('priceUpdate', { tokenAddress: data.tokenAddress, price });
      } catch (error) {
        console.error(`Error fetching price for ${data.tokenAddress}:`, error);
      }
    }, 20000); // 20초마다 실행

    client.on('disconnect', () => {
      clearInterval(interval);
    });
  }

  private async fetchPriceForToken(tokenAddress: string): Promise<string> {
    try {
      const amountIn = ethers.parseEther('1'); // 1 token
      const price = await this.cpammContract.getPrice(tokenAddress, amountIn);
      return ethers.formatEther(price);
    } catch (error) {
      console.error('Error fetching price:', error);
      throw error;
    }
  }
}
