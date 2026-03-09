const config = require('./config');
const os = require('os');

// Metrics stored in memory
const requests = {};
let successfulPurchases = 0;
let failedPurchases = 0;
let totalRevenue = 0;
let totalLatency = 0;
let latencyCount = 0;

// Middleware to track requests
function requestTracker(req, res, next) {
    const endpoint = `[${req.method}] ${req.path}`;
    requests[endpoint] = (requests[endpoint] || 0) + 1;
    next();
}

// This will send metrics to the metrics endpoint every 10 seconds
setInterval(() => {
    const metrics = [];
    Object.keys(requests).forEach((endpoint) => {
        metrics.push(createMetric('requests', requests[endpoint], '1', 'sum', 'asInt', { endpoint }));
    });

    metrics.push(createMetric('cpu_usage', getCpuUsagePercentage(), '%', 'gauge', 'asDouble', {}));
    metrics.push(createMetric('memory_usage', getMemoryUsagePercentage(), '%', 'gauge', 'asDouble', {}));

    metrics.push(createMetric('successful_purchases', successfulPurchases, '1', 'sum', 'asInt', {}));
    metrics.push(createMetric('failed_purchases', failedPurchases, '1', 'sum', 'asInt', {}));
    metrics.push(createMetric('total_revenue', totalRevenue, 'USD', 'sum', 'asDouble', {}));
    if (latencyCount > 0) {
        metrics.push(createMetric('order_latency', totalLatency / latencyCount, 'ms', 'gauge', 'asDouble', {}));
    }

    sendMetricToMetricService(metrics);
}, 10000);

function getCpuUsagePercentage() {
    const cpuUsage = os.loadavg()[0] / os.cpus().length;
    return cpuUsage.toFixed(2) * 100;
}

function getMemoryUsagePercentage() {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    const memoryUsage = (usedMemory / totalMemory) * 100;
    return memoryUsage.toFixed(2);
}

function purchaseMetric(success, latency, revenue) {
    if (success) {
        successfulPurchases++;
        totalRevenue += revenue;
    } else {
        failedPurchases++;
    }
    totalLatency += latency;
    latencyCount++;
}

function createMetric(metricName, metricValue, metricUnit, metricType, valueType, attributes) {
    attributes = { ...attributes, source: config.metricsConfig.source };

    const metric = {
        name: metricName,
        unit: metricUnit,
        [metricType]: {
            dataPoints: [
                {
                    [valueType]: metricValue,
                    timeUnixNano: Date.now() * 1000000,
                    attributes: [],
                },
            ],
        },
    };

    Object.keys(attributes).forEach((key) => {
        metric[metricType].dataPoints[0].attributes.push({
            key: key,
            value: { stringValue: attributes[key] },
        });
    });

    if (metricType === 'sum') {
        metric[metricType].aggregationTemporality = 'AGGREGATION_TEMPORALITY_CUMULATIVE';
        metric[metricType].isMonotonic = true;
    }

    return metric;
}

function sendMetricToMetricService(metrics) {
    const body = {
        resourceMetrics: [
            {
                scopeMetrics: [
                    {
                        metrics,
                    },
                ],
            },
        ],
    };

    fetch(`${config.metricsConfig.endpointUrl}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: { Authorization: `Bearer ${config.metricsConfig.accountId}:${config.metricsConfig.apiKey}`, 'Content-Type': 'application/json' },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`HTTP status: ${response.status}`);
            }
        })
        .catch((error) => {
            console.error('Error pushing metrics:', error);
        });
}

module.exports = { requestTracker, purchaseMetric };