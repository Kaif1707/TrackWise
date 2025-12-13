import Asset from "../models/Asset.js";

export async function getAssets(req, res) {
  try {
    const assets = await Asset.find();
    res.json(assets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch assets" });
  }
}

export async function addAsset(req, res) {
  try {
    const asset = new Asset(req.body);
    await asset.save();
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: "Failed to add asset" });
  }
}

export async function updateAsset(req, res) {
  try {
    const asset = await Asset.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(asset);
  } catch (err) {
    res.status(500).json({ error: "Failed to update asset" });
  }
}

export async function deleteAsset(req, res) {
  try {
    await Asset.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete asset" });
  }
}
