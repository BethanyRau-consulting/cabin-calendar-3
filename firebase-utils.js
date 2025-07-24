async function checkBillingStatus() {
  // Firestore doc: /billing/monthlyUsage
  const usageDoc = await firebase.firestore().collection("billing").doc("monthlyUsage").get();
  const data = usageDoc.data();

  if (!data) return true;

  const { reads = 0, writes = 0, deletes = 0, storageMB = 0, downloadsMB = 0 } = data;

  // Estimate limits (free tier)
  const readCost = Math.max(0, (reads - 50000)) * 0.00006;
  const writeCost = Math.max(0, (writes - 20000)) * 0.0006;
  const deleteCost = Math.max(0, (deletes - 20000)) * 0.0006;
  const storageCost = Math.max(0, (storageMB - 1000)) * 0.026;
  const downloadCost = Math.max(0, (downloadsMB - 10000)) * 0.12 / 1000;

  const estimatedTotal = readCost + writeCost + deleteCost + storageCost + downloadCost;

  return estimatedTotal < 0.01; // Disable if cost is non-zero
}
