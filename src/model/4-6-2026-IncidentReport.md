# Incident: 2026-04-06 12:32:00 MDT

## Summary

Between approximately 18:32 and 18:37 UTC, **all users were unable to order pizzas**. During this period, HTTP requests
from
our service to the JWT Pizza Factory returned the response code `500`.

This was caused by a chaos testing event, initiated the day prior, and was resolved by identifying an appropriate link (
sent
in the Factory response body) to end the chaos state.

This incident led to an **immediate loss of ฿5.28** ($368,000) in the form of failed pizzas, estimated by average
traffic rates.

## Detection

The incident was detected approximately 6 seconds later, thanks to a fortuitously-timed routine examination of
production
metrics. Had this inspection not taken place, the first detection would have been **3 minutes after the incident began
** (18:35 UTC)
when Grafana detected a sudden revenue dip and alerted the development team via email.

Notably, the Grafana alert for failing pizza orders **failed to trigger**. Thanks to an error in the simulated traffic
script,
the failing pizza orders caused the script to terminate, preventing the number of failing orders from rising enough to
trigger
the alert. This bug has since been resolved; future chaos tests will not encounter the same issue.

Although the incident was quickly detected and resolved, had it taken place two hours later, the entire dev team (of
one)
would have been in class, unable to respond. Expanding this team to ensure round-the-clock coverage is essential to
avoiding
such a scenario in the future.

Additionally, the Grafana alert was sent several minutes after the incident started, well after revenue reached zero.
Faster
alarm alternatives should be examined and considered in order to allow for immediate response.

## Impact

> [!NOTE]
> Describe how the incident impacted internal and external users during the incident. Include how many support cases
> were raised.

```md
**EXAMPLE**:

For {XXhrs XX minutes} between {XX:XX UTC and XX:XX UTC} on {MM/DD/YY}, {SUMMARY OF INCIDENT} our users experienced this
incident.

This incident affected {XX} customers (X% OF {SYSTEM OR SERVICE} USERS), who experienced {DESCRIPTION OF SYMPTOMS}.

{XX NUMBER OF SUPPORT TICKETS AND XX NUMBER OF SOCIAL MEDIA POSTS} were submitted.
```

## Timeline

zz

| Time       | Event                                                                                                              |
|------------|--------------------------------------------------------------------------------------------------------------------|
| _18:32:00_ | An order with less than 20 pizzas fails, returning `500`. Simulated traffic stops.                                 |
| _18:32:06_ | Engineer notices failed call in log. Investigation starts.                                                         |
| _18:33:10_ | Halted traffic becomes evident in metrics page.                                                                    |
| _18:33:22_ | `End Chaos` URL discovered in Factory response. Resolution intentionally delayed to ensure Grafana alerts trigger. |
| _18:35:10_ | Grafana `Low Revenue`alert is triggered. Notification chain initiated.                                             |
| _18:35:41_ | Simulated traffic is restarted.                                                                                    |
| _18:35:41_ | Grafana alert received by development team.                                                                        |
| _18:35:51_ | A second order fails. Simulated traffic halts.                                                                     |
| _18:36:44_ | `End Chaos` URL is followed. Pizza orders should now succeed.                                                      |
| _18:37:00_ | Halted traffic is again evident in metrics.                                                                        |
| _18:39:17_ | Traffic script corrected and restarted.                                                                            |
| _18:40:41_ | `Low Revenue` alert resolved.                                                                                      |
| _19:45:00_ | Normal operation for 5 minutes. Incident marked as resolved.                                                       |

## Response

> [!NOTE]
> Who responded to the incident? When did they respond, and what did they do? Note any delays or obstacles to
> responding.

```md
**EXAMPLE**:

After receiving a page at {XX:XX UTC}, {ON-CALL ENGINEER} came online at {XX:XX UTC} in {SYSTEM WHERE INCIDENT INFO IS
CAPTURED}.

This engineer did not have a background in the {AFFECTED SYSTEM} so a second alert was sent at {XX:XX UTC} to
{ESCALATIONS ON-CALL ENGINEER} into the who came into the room at {XX:XX UTC}.
```

## Root cause

> [!NOTE]
> Note the final root cause of the incident, the thing identified that needs to change in order to prevent this class of
> incident from happening again.

```md
**EXAMPLE**:

A bug in connection pool handling led to leaked connections under failure conditions, combined with lack of visibility
into connection state.
```

## Resolution

> [!NOTE]
> Describe how the service was restored and the incident was deemed over. Detail how the service was successfully
> restored and you knew how what steps you needed to take to recovery.
> Depending on the scenario, consider these questions: How could you improve time to mitigation? How could you have cut
> that time by half?

```md
**EXAMPLE**:
By Increasing the size of the BuildEng EC3 ASG to increase the number of nodes available to support the workload and
reduce the likelihood of scheduling on oversubscribed nodes

Disabled the Escalator autoscaler to prevent the cluster from aggressively scaling-down
Reverting the Build Engineering scheduler to the previous version.
```

## Prevention

> [!NOTE]
> Now that you know the root cause, can you look back and see any other incidents that could have the same root cause?
> If yes, note what mitigation was attempted in those incidents and ask why this incident occurred again.

```md
**EXAMPLE**:

This same root cause resulted in incidents HOT-13432, HOT-14932 and HOT-19452.
```

## Action items

> [!NOTE]
> Describe the corrective action ordered to prevent this class of incident in the future. Note who is responsible and
> when they have to complete the work and where that work is being tracked.

```md
**EXAMPLE**:

1. Manual auto-scaling rate limit put in place temporarily to limit failures
1. Unit test and re-introduction of job rate limiting
1. Introduction of a secondary mechanism to collect distributed rate information across cluster to guide scaling effects
```