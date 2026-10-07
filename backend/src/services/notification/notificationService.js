// Stub notification service. In a full production system this would push
// to SNS/SES/FCM; for this project it logs to CloudWatch so the flow is
// demonstrable and the integration point is obvious for future work.
export function notify(event, payload) {
  console.log(`[NOTIFY] ${event}`, JSON.stringify(payload));
}
