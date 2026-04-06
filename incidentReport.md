# Incident: 2026-04-02 12-38

## Summary
Around 18:38 UTC we experienced an outage with the Pizza Factory that caused all orders to fail. The outage was triggered by a chaos test.

As our code was not yet ready to respond to chaos testing, the system failed. We detected the error around 19:00 and began work on fixing the error. This is a critical outage as it affects all users ordering pizza.


## Detection
The incident was noticed when the pizza creation success rate dropped to 0. There was no alert that fired.

To improve future response times, an alert will be added by Jay to alert us immediately of pizza delivery outages.

## Impact
Until the issue was resolved at 1:16 pm, all users were unable to purchase pizzas.

This incident affected our one user who faithfully purchased pizza every 50 seconds resulting in roughly 46 failed pizza purchases.


## Timeline

All times are in UTC.

- _18:38_ - Chaos test initiated
- _19:00_ - Issue noticed on manual inspection of metrics
- _19:14_ - Root issue found in logs
- _19:16_ - Issue resolved by following chaos test resolve link
- _19:17_ - Pizza purchasing successful again (fix worked)

## Response
After noticing the issue at 19:00, Jay begain looking at the logs to discover the root cause. Upon finding it, he was able to end the chaos test by following the link provided in the logged http requests.

## Root cause
A chaos test went off that we were not prepared to handle automatically. In order to fix this issue, we will add a request to end chaos testing should similar errors occur.

## Resolution
No additional work was required to fix the service. The factory returned to its normal state after the chaos test was resolved.

## Prevention
To prevent future instances of this issue, we will begin migrating away from the pizza factory to our own pizza creation service as the current factory is prone to issues.

## Action items

1. Jay will add automatic chaos test links calls to end chaos state with current factory.
1. Jay will implement our own factory to prevent future factory related issues.