import { Injectable } from '@nestjs/common';
import { Field, SelfProof, ZkProgram, verify } from 'o1js';
import { setupAndDeploy } from './deploy';

const Add = ZkProgram({
  name: 'add-example',
  publicInput: Field,

  methods: {
    init: {
      privateInputs: [],
      async method(state: Field) {
        state.assertEquals(Field(0));
      },
    },

    addNumber: {
      privateInputs: [SelfProof, Field],
      async method(
        newState: Field,
        earlierProof: SelfProof<Field, void>,
        numberToAdd: Field
      ) {
        earlierProof.verify();
        newState.assertEquals(earlierProof.publicInput.add(numberToAdd));
      },
    },

    add: {
      privateInputs: [SelfProof, SelfProof],
      async method(
        newState: Field,
        earlierProof1: SelfProof<Field, void>,
        earlierProof2: SelfProof<Field, void>
      ) {
        earlierProof1.verify();
        earlierProof2.verify();
        newState.assertEquals(
          earlierProof1.publicInput.add(earlierProof2.publicInput)
        );
      },
    },
  },
});

@Injectable()
export class AppService {
  getHello(): string {
    console.log("h1");
    return 'Hello World!';
  }

  async prove() {

      console.log('Compiling...');
      const { verificationKey } = await Add.compile();

      console.log('Making proof 0');
      const proof0 = await Add.init(Field(0));

      console.log('Making proof 1');
      const proof1 = await Add.addNumber(Field(4), proof0, Field(4));

      console.log('Making proof 2');
      const proof2 = await Add.add(Field(4), proof1, proof0);

      console.log('Verifying proof 2');
      console.log('Proof 2 data', proof2.publicInput.toString());

      const ok = await verify(proof2.toJSON(), verificationKey);
      console.log('Verification result:', ok);

      return { success: true, verificationResult: ok };
  }

  async deploy(){
    setupAndDeploy("name3");
  }

}


