// scripts/compile-contracts.ts
import { BiddingContract, BiddingProgram } from "../contracts/Bidding";
import fs from 'fs/promises';
import path from 'path';

async function main() {
    try {
        console.time('compilation');
        
        // Compile BiddingProgram
        console.log('Compiling BiddingProgram...');
        const biddingProgramResult = await BiddingProgram.compile();
        console.log('BiddingProgram compilation completed');

        
        // Compile BiddingContract
        console.log('Compiling BiddingContract...');
        const { verificationKey } = await BiddingContract.compile();
        console.log('BiddingContract compilation completed');
        
        // Create contracts-cache directory if it doesn't exist
        const cacheDir = path.join(process.cwd(), 'contracts-cache');
        await fs.mkdir(cacheDir, { recursive: true });
        
        // Save the verification keys
        if (verificationKey) {
            await fs.writeFile(
                path.join(cacheDir, 'bidding_contract_verification_key.json'),
                JSON.stringify(verificationKey, null, 2)
            );
            console.log('BiddingContract verification key saved');
        }

        if (biddingProgramResult?.verificationKey) {
            await fs.writeFile(
                path.join(cacheDir, 'bidding_program_verification_key.json'),
                JSON.stringify(biddingProgramResult.verificationKey, null, 2)
            );
            console.log('BiddingProgram verification key saved');
        }
        
        console.log('All compilations completed successfully');
        console.timeEnd('compilation');
    } catch (error) {
        console.error('An error occurred:', error);
        process.exit(1);
    }
}

// Handle promise rejection
main().catch((error) => {
    console.error('Unexpected error:', error);
    process.exit(1);
});
