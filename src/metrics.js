const config = require('./config');
const os = require('os');

// Metrics stored in memory
const requests = {};
const latencies = {};
const latencyCounts = {};
let successfulPurchases = 0;
let failedPurchases = 0;
let totalRevenue = 0;
let totalPurchaseLatency = 0;
let purchaseLatencyCount = 0;
let currentUsers = 0;
let successfulLogins = 0;
let failedLogins = 0;

// Middleware to track requests
function requestTracker(req, res, next) {
    const endpoint = `[${req.method}] ${req.path}`;
    const method = req.method + " total";
    requests[endpoint] = (requests[endpoint] || 0) + 1;
    requests[method] = (requests[method] || 0) + 1;
    next();
}

// Middleware to track latency
function latencyTracker(req, res, next) {
    const start = Date.now();
    res.on('finish', () => {
        const latency = Date.now() - start;
        const endpoint = `[${req.method}] ${req.originalUrl}`;
        latencies[endpoint] = (latencies[endpoint] || 0) + latency;
        latencyCounts[endpoint] = (latencyCounts[endpoint] || 0) + 1;
    });
    next();
}

function incrementCurrentUsers() {
    currentUsers++;
}

function decrementCurrentUsers() {
    currentUsers--;

    if (currentUsers < 0) {
        currentUsers = 0;
    }
}

function incrementSuccessfulLogins() {
    successfulLogins++;
}

function incrementFailedLogins() {
    failedLogins++;
}

// This will send metrics to the metrics endpoint every 10 seconds
setInterval(() => {
    const metrics = [];

    // Endpoint request counts
    Object.keys(requests).forEach((endpoint) => {
        metrics.push(createMetric('requests', requests[endpoint], '1', 'sum', 'asInt', { endpoint }));
    });

    // Endpoint latencies
    Object.keys(latencies).forEach((endpoint) => {
        if (latencyCounts[endpoint] > 0) {
            metrics.push(createMetric('latency_avg', latencies[endpoint] / latencyCounts[endpoint], 'ms', 'gauge', 'asDouble', { endpoint }));
        }
        latencies[endpoint] = 0;
        latencyCounts[endpoint] = 0;
    });

    // system cpu and memory usage
    metrics.push(createMetric('cpu_usage', getCpuUsagePercentage(), '%', 'gauge', 'asDouble', {}));
    metrics.push(createMetric('memory_usage', getMemoryUsagePercentage(), '%', 'gauge', 'asDouble', {}));

    // purchase metrics
    metrics.push(createMetric('successful_purchases', successfulPurchases, '1', 'sum', 'asInt', {}));
    metrics.push(createMetric('failed_purchases', failedPurchases, '1', 'sum', 'asInt', {}));
    metrics.push(createMetric('total_revenue', totalRevenue, 'USD', 'sum', 'asDouble', {}));
    if (purchaseLatencyCount > 0) {
        metrics.push(createMetric('order_latency', totalPurchaseLatency / purchaseLatencyCount, 'ms', 'gauge', 'asDouble', {}));
        totalPurchaseLatency = 0;
        purchaseLatencyCount = 0;
    }

    // process memory usage
    const processMemoryUsage = getProcessMemoryUsage();
    metrics.push(createMetric('process_memory_usage', processMemoryUsage.rss, 'bytes', 'gauge', 'asInt', {}));
    metrics.push(createMetric('process_heap_total', processMemoryUsage.heapTotal, 'bytes', 'gauge', 'asInt', {}));
    metrics.push(createMetric('process_heap_used', processMemoryUsage.heapUsed, 'bytes', 'gauge', 'asInt', {}));
    metrics.push(createMetric('process_external_memory', processMemoryUsage.external, 'bytes', 'gauge', 'asInt', {}));

    // login metrics
    metrics.push(createMetric('current_users', currentUsers, '1', 'gauge', 'asInt', {}));
    metrics.push(createMetric('successful_logins', successfulLogins, '1', 'sum', 'asInt', {}));
    metrics.push(createMetric('failed_logins', failedLogins, '1', 'sum', 'asInt', {}));

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

function getProcessMemoryUsage() {
    const memoryUsage = process.memoryUsage();
    return {
        rss: memoryUsage.rss,
        heapTotal: memoryUsage.heapTotal,
        heapUsed: memoryUsage.heapUsed,
        external: memoryUsage.external,
    };
}

function purchaseMetric(success, latency, revenue) {
    if (success) {
        successfulPurchases++;
        totalRevenue += revenue;
    } else {
        failedPurchases++;
    }
    totalPurchaseLatency += latency;
    purchaseLatencyCount++;
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

module.exports = {
    requestTracker, 
    purchaseMetric, 
    decrementCurrentUsers, 
    incrementCurrentUsers, 
    incrementSuccessfulLogins, 
    incrementFailedLogins,
    latencyTracker
};