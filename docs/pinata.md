Install and Setup SDK
In the root of your project run the install command with your package manager of choice.


npm

pnpm

yarn

bun

Copy
npm i pinata
Import and initialize the SDK in your codebase with the API key and Gateway from the previous step


Copy
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: "PINATA_JWT",
  pinataGateway: "example-gateway.mypinata.cloud",
});
The PINATA_JWT is a secret key, be sure to initialize the SDK in a secure environment and practice basic variable security practices. If you need to upload from a client environment, consider using signed JWTs
​
3. Upload a File
Use the upload method to upload a File object.


SDK

API

Copy
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "example-gateway.mypinata.cloud",
});

async function main() {
  try {
    const file = new File(["hello world!"], "hello.txt", { type: "text/plain" });
    const upload = await pinata.upload.public.file(file);
    console.log(upload);
  } catch (error) {
    console.log(error);
  }
}

await main();
You should get a response object like the one below


SDK

API

Copy
{
  id: "0195f815-5c5e-716d-9240-d3ae380e2002",
  group_id: null,
  name: "hello.txt",
  cid: "bafkreidvbhs33ighmljlvr7zbv2ywwzcmp5adtf4kqvlly67cy56bdtmve",
  created_at: "2025-04-02T19:58:24.616Z",
  size: 12,
  number_of_files: 1,
  mime_type: "text/plain",
  vectorized: false,
  network: "public",
}
​
4. Retrieve a File through a Gateway
Use the cid of a file to fetch it through a Gateway directly or create a URL


SDK

API

Copy
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: "example-gateway.mypinata.cloud",
});

async function main() {
  try {
    const data = await pinata.gateways.public.get("bafkreibm6jg3ux5qumhcn2b3flc3tyu6dmlb4xa7u5bf44yegnrjhc4yeq");
    console.log(data)

    const url = await pinata.gateways.convert(
      "bafkreib4pqtikzdjlj4zigobmd63lig7u6oxlug24snlr6atjlmlza45dq"
    )
    console.log(url)
  } catch (error) {
    console.log(error);
  }
}

main();
​
What’s Next?
Ready to see more of what Pinata has to offer? Here are some additional features and concepts to help you get the most out of our platform: