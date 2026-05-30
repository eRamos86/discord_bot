import dotenv from 'dotenv';
import * as Utils from '@utils';

dotenv.config();

const result = await Utils.deploy();

if (!result.success) {

    console.log("❌ Deployment failed\n");

    for (const error of result.errors) console.log(`- ${error}`);

    process.exit(1);

}

console.log(`✅ Deployed ${result.deployed.length} commands (${result.duration}ms)`);

if (result.skipped.length) {

    console.log('\nSkipped:');

    for (const skipped of result.skipped) {
        console.log(`- ${skipped}`);
    }

}