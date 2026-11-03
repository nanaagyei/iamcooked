import { sendWeeklyDigest, sendCriticalAlerts } from "./digest";

async function main() {
  const job = process.argv[2] ?? "weekly";

  if (job === "weekly") {
    const result = await sendWeeklyDigest();
    console.log(`Weekly digest sent to ${result.sent} subscribers`);
  } else if (job === "critical") {
    const result = await sendCriticalAlerts();
    console.log(`Critical alerts sent to ${result.sent} subscribers`);
  } else {
    console.error(`Unknown job: ${job}`);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
